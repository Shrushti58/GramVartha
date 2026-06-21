/**
 * API Service
 * Handles all backend communication
 */

import NetInfo from "@react-native-community/netinfo";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError,
} from "axios";

import { Config } from "../constants/config";
import { Notice, NoticeResponse, ViewTrackingRequest } from "../types/Notice";
import { getToken, logout } from "../utils/auth";
import { getVisitorId } from "../utils/visitor";

type RetryConfig = AxiosRequestConfig & {
  retry?: number;
  retryDelayMs?: number;
  skipOfflineCheck?: boolean;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
  isOffline: boolean;
  isTimeout: boolean;

  constructor(message: string, options: {
    status?: number;
    code?: string;
    data?: unknown;
    isOffline?: boolean;
    isTimeout?: boolean;
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
    this.isOffline = Boolean(options.isOffline);
    this.isTimeout = Boolean(options.isTimeout);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isSafeMethod = (method?: string) => {
  const normalized = (method || "get").toLowerCase();
  return ["get", "head", "options"].includes(normalized);
};

const shouldRetry = (error: AxiosError, method?: string) => {
  if (!isSafeMethod(method)) return false;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") return true;
  const status = error.response?.status;
  return status === 408 || status === 429 || Boolean(status && status >= 500);
};

const getServerMessage = (data: any) => {
  if (!data) return undefined;
  if (typeof data === "string") return data;
  return data.message || data.error;
};

const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = getServerMessage(error.response?.data);
    const isTimeout = error.code === "ECONNABORTED";
    const isOffline = !error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error");

    return new ApiError(
      serverMessage ||
        (isTimeout
          ? "Request timed out. Please try again."
          : isOffline
          ? "No internet connection. Please check your network and try again."
          : "Something went wrong. Please try again."),
      {
        status,
        code: error.code,
        data: error.response?.data,
        isOffline,
        isTimeout,
      }
    );
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("Something went wrong. Please try again.");
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${Config.API_BASE_URL}/`,
      timeout: Config.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        if (!(config as RetryConfig).skipOfflineCheck) {
          const network = await NetInfo.fetch();
          if (network.isConnected === false || network.isInternetReachable === false) {
            throw new ApiError("No internet connection. Please check your network and try again.", {
              isOffline: true,
              code: "OFFLINE",
            });
          }
        }

        const token = await getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(normalizeError(error))
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          void logout();
        }

        return Promise.reject(error);
      }
    );
  }

  private async request<T = any>(config: RetryConfig): Promise<T> {
    const retryLimit = config.retry ?? (isSafeMethod(config.method) ? 2 : 0);
    const retryDelayMs = config.retryDelayMs ?? 500;
    let attempt = 0;

    while (true) {
      try {
        const response: AxiosResponse<T> = await this.api.request<T>(config);
        return response.data;
      } catch (error) {
        const normalized = normalizeError(error);
        const axiosError = isAxiosError(error) ? error : undefined;

        if (!axiosError || attempt >= retryLimit || !shouldRetry(axiosError, config.method)) {
          throw normalized;
        }

        attempt += 1;
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
    return normalizeError(error).message || fallback;
  }

  isOfflineError(error: unknown) {
    return normalizeError(error).isOffline;
  }

  async get<T = any>(endpoint: string, config?: RetryConfig) {
    return this.request<T>({
      ...config,
      method: "get",
      url: endpoint,
    });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RetryConfig) {
    return this.request<T>({
      ...config,
      method: "post",
      url: endpoint,
      data,
      retry: config?.retry ?? 0,
    });
  }

  async delete<T = any>(endpoint: string, config?: RetryConfig) {
    return this.request<T>({
      ...config,
      method: "delete",
      url: endpoint,
      retry: config?.retry ?? 0,
    });
  }

  async registerCitizen(data: {
    name: string;
    phone: string;
    password: string;
    village: string;
  }) {
    return this.post("/citizen/register", data);
  }

  async loginCitizen(data: {
    phone: string;
    password: string;
    village: string;
  }) {
    return this.post("/citizen/login", data);
  }

  async deleteCitizenAccount() {
    return this.delete("/citizen/me");
  }

  async createComplaint(formData: FormData) {
    return this.post(
      "/complaints/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: Config.UPLOAD_TIMEOUT,
      }
    );
  }

  async getMyComplaints() {
    return this.get("/complaints/my");
  }

  async getComplaintsByVillage(villageId: string, page: number = 1, limit: number = 10, filters?: any) {
    const params: any = { page, limit };
    if (filters?.type) params.type = filters.type;
    if (filters?.status) params.status = filters.status;

    return this.get(`/complaints/village/${villageId}`, { params });
  }

  async getComplaintDetails(complaintId: string) {
    return this.get(`/complaints/${complaintId}`);
  }

  async fetchNotices(): Promise<Notice[]> {
    const data = await this.get<NoticeResponse>("/notice/fetch");

    if (Array.isArray(data)) return data;
    if ((data as any).notices && Array.isArray((data as any).notices)) return (data as any).notices;
    if ((data as any).data && Array.isArray((data as any).data)) return (data as any).data;

    return [];
  }

  async fetchNoticeById(id: string): Promise<Notice> {
    const data = await this.get<NoticeResponse>(`/notice/${id}`);

    if ((data as any).notice) return (data as any).notice;
    if ((data as any).data) return (data as any).data as Notice;

    return data as unknown as Notice;
  }

  async trackView(noticeId: string): Promise<number> {
    const visitorId = await getVisitorId();
    const payload: ViewTrackingRequest = { visitorId };
    const data = await this.post<{ views: number }>(`/notice/${noticeId}/view`, payload);

    return data.views;
  }

  async getVillageByQRCode(qrCodeId: string): Promise<any> {
    return this.get(`/villages/qr/${qrCodeId}`);
  }

  async getNoticesByVillage(
    villageId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    return this.get(`/notice/village/${villageId}`, {
      params: { page, limit },
    });
  }
}

export const apiService = new ApiService();
export default apiService;
