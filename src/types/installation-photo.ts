export interface InstallationBanner {
  id: string;
  region_gu_id: string;
  title: string;
  content: string | null;
  folder_path: string; // 폴더 경로로 변경
  location_info?: string; // 위치 정보 (예: 관악구, 강북구)
  display_order?: number; // 표시 순서 (1, 2, 3... 순서대로)
  photo_urls?: string[]; // API에서 동적으로 생성되는 이미지 URL 배열
  photo_names?: string[]; // 표시용 이름 배열 (번호만, 예: ["01", "02", "03"])
  total_images?: number; // 이미지 개수
  created_at: string;
  updated_at: string;
  region_gu?: {
    name: string;
  };
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
