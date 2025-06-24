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
  panel_code?: number;
  created_at: string;
  updated_at: string;
}

export interface BannerPanelDetails {
  id: string;
  panel_info_id: string;
  max_banners: number;
  panel_height: number;
  panel_width: number;
  is_for_admin?: boolean;
  created_at: string;
  updated_at: string;
  panel_code?: number;
  address: string;
  nickname?: string;
  panel_status: string;
}

export interface BannerSlotInfo {
  id: string;
  panel_info_id: string;
  slot_number: number;
  slot_name: string;
  max_width: number;
  max_height: number;
  total_price?: number;
  tax_price?: number;
  banner_type: '일반형' | '돌출형' | '지정게시대' | '자율게시대';
  price_unit?: '15 days' | 'month';
  is_premium: boolean;
  panel_slot_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  banner_panel_details: BannerPanelDetails;
  id: number;
  title: string;
  subtitle?: string;
  region_dong?: string;
  status: string;
  quantity?: number;
  panel_width?: number;
  panel_height?: number;
  price?: string;
  address?: string;
  nickname?: string;
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
  panel_code?: number;
  panel_type?: string;
  created_at: string;
  updated_at: string;
  banner_panel_details: BannerPanelDetails;
  banner_slot_info: BannerSlotInfo[];
  region_gu: RegionGu;
  region_dong: RegionDong;
  price?: string;
  price_unit?: string;
  panel_width?: number;
  panel_height?: number;
}

export interface Billboard {
  id: number;
  type: string;
  district: string;
  name: string;
  address?: string;
  nickname?: string;
  neighborhood: string;
  period: string;
  price: string;
  size: string;
  faces?: number;
  lat?: number;
  lng?: number;
  panel_width?: number;
  panel_height?: number;
  is_for_admin?: boolean;
  status: string;
}
