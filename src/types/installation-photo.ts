// 개별 이미지 정보
export interface InstallationPhotoImage {
  id: string;
  image_url: string;
  file_name: string;
  sort_order: number;
  panel?: {
    panel_code: number;
    panel_type: string;
    nickname: string;
  };
}

export interface InstallationBanner {
  id: string;
  region_gu_id: string;
  title: string;
  content: string | null;
  year: number;
  month: number;
  period: 'first_half' | 'second_half';
  display_order: number;
  created_at: string;
  updated_at: string;
  region_gu?: {
    id?: string;
    name: string;
    code?: string;
  };
  // For backward compatibility
  photo_urls?: string[];
  photo_names?: string[];
  total_images?: number;
  // New structure with full image data
  images?: InstallationPhotoImage[];
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface InstallationBannerResponse {
  installation_banners: InstallationBanner[];
  pagination: PaginationInfo;
}
