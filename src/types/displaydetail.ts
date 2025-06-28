export interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  logo: string;
  src: string;
  code: string;
}

export interface DistrictItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  location: string;
  status: string;
  spots: number | string;
}

// 공통 베이스 타입
export interface BaseBillboard {
  id: number;
  district: string;
  name: string;
  neighborhood: string;
  period: string;
  price: string;
  size: string;
  faces: number;
  lat: number;
  lng: number;
  status: string;
  panel_width?: number;
  panel_height?: number;
  price_unit?: string;
  address?: string;
  nickname?: string | null; // null도 허용하도록 통일
  panel_code?: number;
  panel_type?: string;
}

// 현수막게시대 전용 타입
export interface BannerBillboard extends BaseBillboard {
  type: 'banner';
  is_for_admin?: boolean;
  banner_type?: string;
}

// LED 전자게시대 전용 타입
export interface LEDBillboard extends BaseBillboard {
  type: 'led';
  exposure_count: number;
  max_banners: number;
  slot_width_px: number;
  slot_height_px: number;
  total_price: number;
  tax_price: number;
  advertising_fee: number;
  road_usage_fee: number;
  administrative_fee: number;
  panel_slot_status: string;
}

// 통합 타입 (기존 DisplayBillboard와 동일)
export type DisplayBillboard = BannerBillboard | LEDBillboard;

export interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  date?: string;
  category?: string;
  price?: string;
  price_unit?: string;
  is_for_admin?: boolean;
  address?: string;
  nickname?: string;
}

export interface DropdownOption {
  id: number;
  option: string;
}
