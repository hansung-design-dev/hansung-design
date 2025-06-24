export interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  icon: string;
  size: string;
  sizeOfPeople: string;
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

export interface BannerBillboard {
  id: number;
  type: string;
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
  is_for_admin?: boolean;
  address?: string;
  nickname?: string;
  panel_code?: number;
  banner_type?: string;
  panel_type?: string;
}

// LED 전자게시대 타입
export interface LEDBillboard {
  id: number;
  type: 'led';
  district: string;
  name: string;
  address: string;
  nickname: string | null;
  neighborhood: string;
  period: string;
  price: string;
  size: string;
  faces: number;
  lat: number;
  lng: number;
  status: string;
  panel_width: number;
  panel_height: number;
  panel_code: number;
  panel_type: string;
  exposure_count: number;
  max_banners: number;
  slot_width_px: number;
  slot_height_px: number;
  total_price: number;
  tax_price: number;
  advertising_fee: number;
  road_usage_fee: number;
  administrative_fee: number;
  price_unit: string;
  panel_slot_status: string;
}

// 공통 타입 - Banner와 LED 모두 지원
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
