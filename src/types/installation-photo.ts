export interface InstallationBanner {
  id: string;
  region_gu_id: string;
  title: string;
  content: string | null;
  folder_path: string; // 폴더 경로로 변경
  photo_urls?: string[]; // API에서 동적으로 생성되는 이미지 URL 배열
  total_images?: number; // 이미지 개수
  created_at: string;
  updated_at: string;
  region_gu?: {
    name: string;
  };
}

export interface InstallationBannerResponse {
  installation_banners: InstallationBanner[];
}

// 기존 타입과의 호환성을 위한 별칭
export interface InstallationPhoto extends InstallationBanner {}
export interface InstallationPhotoResponse extends InstallationBannerResponse {}
