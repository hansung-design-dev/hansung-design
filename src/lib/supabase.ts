import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// URL 유효성 검증 함수
function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  // placeholder 값 체크
  if (
    url.includes('your_supabase_url') ||
    url.includes('placeholder') ||
    url === 'your_supabase_url' ||
    url === 'your_supabase_url/'
  ) {
    return false;
  }
  // 실제 URL 형식 체크
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

// 디버깅을 위한 로그
console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');
console.log('🔍 Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Not set');

// 환경변수 검증
if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  const errorMsg =
    '❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았거나 유효하지 않습니다.\n' +
    '   .env.local 파일에 올바른 Supabase URL을 설정해주세요.\n' +
    `   현재 값: ${supabaseUrl || '(없음)'}\n` +
    '   예시: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co';
  console.error(errorMsg);
  throw new Error('Supabase URL이 설정되지 않았거나 유효하지 않습니다.');
}

if (
  !supabaseAnonKey ||
  supabaseAnonKey.includes('your_') ||
  supabaseAnonKey.includes('placeholder')
) {
  const errorMsg =
    '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았거나 유효하지 않습니다.\n' +
    '   .env.local 파일에 올바른 Supabase Anon Key를 설정해주세요.\n' +
    `   현재 값: ${supabaseAnonKey ? '(placeholder)' : '(없음)'}`;
  console.error(errorMsg);
  throw new Error('Supabase Anon Key가 설정되지 않았거나 유효하지 않습니다.');
}

if (
  !supabaseServiceKey ||
  supabaseServiceKey.includes('your_') ||
  supabaseServiceKey.includes('placeholder')
) {
  const errorMsg =
    '❌ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았거나 유효하지 않습니다.\n' +
    '   .env.local 파일에 올바른 Supabase Service Role Key를 설정해주세요.\n' +
    `   현재 값: ${supabaseServiceKey ? '(placeholder)' : '(없음)'}`;
  console.error(errorMsg);
  throw new Error(
    'Supabase Service Role Key가 설정되지 않았거나 유효하지 않습니다.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service Role Key를 사용하는 클라이언트 (관리자 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 타입 정의
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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
  panel_id: string;
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
  panel_id: string;
  slot_number: number;
  slot_name: string;
  max_width: number;
  max_height: number;
  total_price?: number;
  tax_price?: number;
  banner_type: '일반형' | '돌출형' | '지정게시대' | '자율게시대';
  price_unit?: '15 days' | 'month';
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
  banner_slots: BannerSlotInfo[];
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
