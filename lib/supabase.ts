import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface PanelInfo {
  id: string;
  display_type_id: string;
  region_gu_id: string;
  region_dong_id: string;
  address: string;
  nickname?: string;
  panel_status: string;
  created_at: string;
  updated_at: string;
}

export interface BannerPanelDetails {
  id: string;
  panel_info_id: string;
  max_banners: number;
  panel_height: number;
  panel_width: number;
  created_at: string;
  updated_at: string;
}

export interface RegionGu {
  id: string;
  name: string;
  code: string;
}

export interface RegionDong {
  id: string;
  district_code: string;
  name: string;
}

// 실제 데이터 구조에 맞춘 타입
export interface BannerDisplayData {
  id: string;
  display_type_id: string;
  region_gu_id: string;
  region_dong_id: string;
  address: string;
  nickname?: string;
  panel_status: string;
  created_at: string;
  updated_at: string;
  banner_panel_details: BannerPanelDetails;
  region_gu: RegionGu;
  region_dong: RegionDong;
}
