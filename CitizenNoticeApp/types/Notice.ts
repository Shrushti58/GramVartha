/**
 * TypeScript interfaces for Notice data structures
 */

export interface Notice {
  _id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  fileUrl?: string;
  fileName?: string;
  views?: number;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
    department?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type NoticeCategory =
  | 'development'
  | 'health'
  | 'education'
  | 'agriculture'
  | 'employment'
  | 'social_welfare'
  | 'tax_billing'
  | 'election'
  | 'meeting'
  | 'general';

export interface CategoryInfo {
  id: NoticeCategory | 'all';
  name: string;
  emoji: string;
  color: string;
}

export interface NoticeResponse {
  notices?: Notice[];
  data?: Notice[];
  notice?: Notice;
  views?: number;
  success?: boolean;
  message?: string;
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'title-asc' | 'title-desc';

export interface ViewTrackingRequest {
  visitorId: string;
}

export interface ViewTrackingResponse {
  views: number;
  success: boolean;
}