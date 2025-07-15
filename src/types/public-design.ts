export type DesignContentsType = 'list' | 'detail';

export interface PublicDesignContent {
  id: string;
  project_id: string;
  design_contents_type: DesignContentsType;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicDesignProject {
  id: string;
  project_id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface PublicDesignDetail {
  id: string;
  project_id: string;
  title: string;
  alt_text: string;
  image_url: string;
  display_order: number;
}

export interface PublicDesignDetailResponse {
  project: PublicDesignContent;
  detailContents: PublicDesignContent[];
}
