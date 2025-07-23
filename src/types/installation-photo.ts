export interface InstallationPhoto {
  id: string;
  display_type_id: string;
  title: string;
  content: string | null;
  photo_urls: string[]; // 사진 URL 배열로 변경
  created_at: string;
  updated_at: string;
  display_types?: {
    name: string;
  };
}

export interface InstallationPhotoResponse {
  installation_photos: InstallationPhoto[];
  error?: string;
}
