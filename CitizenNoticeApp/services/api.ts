/**
 * API Service
 * Handles all backend communication
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Config } from "../constants/config";
import { Notice, NoticeResponse, ViewTrackingRequest } from "../types/Notice";
import { getVisitorId } from "../utils/visitor";

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

    // 🔐 Request interceptor (Attach JWT token)
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ❌ Response interceptor (Error handling)
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }

  // ==============================
  // 🔐 AUTH APIs
  // ==============================

  async registerCitizen(data: {
    name: string;
    phone: string;
    password: string;
    village: string;
  }) {
    try {
      const response = await this.api.post("/citizen/register", data);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async loginCitizen(data: {
    phone: string;
    password: string;
  }) {
    try {
      const response = await this.api.post("/citizen/login", data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // ==============================
  // 📢 COMPLAINT APIs
  // ==============================

  async createComplaint(formData: FormData) {
    try {
      const response = await this.api.post(
        "/complaints/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Complaint error:", error);
      throw error;
    }
  }

  async getMyComplaints() {
    try {
      const response = await this.api.get("/complaints/my");
      return response.data;
    } catch (error) {
      console.error("Fetch complaints error:", error);
      throw error;
    }
  }

  // ==============================
  // 📄 NOTICE APIs (Existing)
  // ==============================

  async fetchNotices(): Promise<Notice[]> {
    try {
      const response = await this.api.get<NoticeResponse>("/notice/fetch");

      let notices: Notice[] = [];

      if (Array.isArray(response.data)) {
        notices = response.data;
      } else if (
        (response.data as any).notices &&
        Array.isArray((response.data as any).notices)
      ) {
        notices = (response.data as any).notices;
      } else if (
        (response.data as any).data &&
        Array.isArray((response.data as any).data)
      ) {
        notices = (response.data as any).data;
      }

      return notices;
    } catch (error) {
      console.error("Error fetching notices:", error);
      throw error;
    }
  }

  async fetchNoticeById(id: string): Promise<Notice> {
    try {
      const response = await this.api.get<NoticeResponse>(`/notice/${id}`);

      if ((response.data as any).notice) {
        return (response.data as any).notice;
      } else if ((response.data as any).data) {
        return (response.data as any).data as Notice;
      }

      return response.data as unknown as Notice;
    } catch (error) {
      console.error("Error fetching notice:", error);
      throw error;
    }
  }

  async trackView(noticeId: string): Promise<number> {
    try {
      const visitorId = await getVisitorId();
      const payload: ViewTrackingRequest = { visitorId };

      const response = await this.api.post<{ views: number }>(
        `/notice/${noticeId}/view`,
        payload
      );

      return response.data.views;
    } catch (error) {
      console.error("Error tracking view:", error);
      throw error;
    }
  }

  // ==============================
  // 🏡 VILLAGE APIs
  // ==============================

  async getVillageByQRCode(qrCodeId: string): Promise<any> {
    try {
      const response = await this.api.get(`/villages/qr/${qrCodeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching village by QR code:", error);
      throw error;
    }
  }

  async getNoticesByVillage(
    villageId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const response = await this.api.get(
        `/notice/village/${villageId}`,
        {
          params: { page, limit },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching village notices:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;