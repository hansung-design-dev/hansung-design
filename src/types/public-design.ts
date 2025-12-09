export type DesignContentsType = 'list' | 'detail';

export type PublicDesignCategory =
  | 'banner_improvement'
  | 'env_improvement'
  | 'public_design'
  | 'street_furniture'
  | 'landscape_design'
  | 'lighting_design'
  | 'signage_system'
  | 'urban_art';

export interface PublicDesignContent {
  id: string;
  project_category: PublicDesignCategory;
  design_contents_type: DesignContentsType;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  alt_text?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicDesignProject {
  id: string;
  project_category: PublicDesignCategory;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface PublicDesignDetail {
  id: string;
  project_category: PublicDesignCategory;
  title: string;
  alt_text: string;
  image_url: string;
  display_order: number;
}

export interface PublicDesignDetailResponse {
  projects: PublicDesignContent[];
  detailContents: PublicDesignContent[];
  listData?: {
    id: string;
    name: string;
    description: string;
    location: string;
    listImages: string[];
    categoryId: string;
    displayOrder: number;
    parentId?: string;
  };
}
