/**
 * API Service
 * Handles all backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Config } from '../constants/config';
import { Notice, NoticeResponse, ViewTrackingRequest } from '../types/Notice';
import { getVisitorId } from '../utils/visitor';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${Config.API_BASE_URL}/`,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // You can add auth tokens here if needed in future
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
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
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }

  /**
   * Fetch all notices
   */
  async fetchNotices(): Promise<Notice[]> {
    try {
      const response = await this.api.get<NoticeResponse>('/notice/fetch');
      
      // Handle different response structures
      let notices: Notice[] = [];
      if (Array.isArray(response.data)) {
        notices = response.data;
      } else if (response.data.notices && Array.isArray(response.data.notices)) {
        notices = response.data.notices;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        notices = response.data.data;
      }
      
      return notices;
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  /**
   * Fetch single notice by ID
   */
  async fetchNoticeById(id: string): Promise<Notice> {
    try {
      const response = await this.api.get<NoticeResponse>(`/notice/${id}`);
      
      if (response.data.notice) {
        return response.data.notice;
      } else if (response.data.data) {
        return response.data.data as unknown as Notice;
      }
      
      return response.data as unknown as Notice;
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  /**
   * Track notice view
   */
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
      console.error('Error tracking view:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;