export interface HomepageMenuType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  page:
    | 'main'
    | 'banner_display'
    | 'led_display'
    | 'public_design'
    | 'digital_signage';
  homepage_menu_types: string; // homepage_menu_types 테이블의 id
  title: string;
  subtitle: string;
  description: string;
  main_image_url: string;
  description_list?: string[];
  created_at: string;
  updated_at: string;
  homepage_menu_types_relation: HomepageMenuType;
}

export type HomepageMenuEnum =
  | 'main'
  | 'banner_display'
  | 'led_display'
  | 'public_design'
  | 'digital_signage';

// 실제 homepage_menu_types 테이블의 name 값들
export type HomepageMenuName =
  | 'main'
  | 'banner_display'
  | 'led_display'
  | 'public_design'
  | 'digital_signage';
