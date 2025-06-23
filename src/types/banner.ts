export interface BannerBillboard {
  id: number;
  type: string;
  district: string;
  name: string;
  address?: string;
  nickname?: string;
  neighborhood: string;
  period: string;
  price: string;
  price_unit?: string;
  size: string;
  faces?: number;
  lat?: number;
  lng?: number;
  panel_width?: number;
  panel_height?: number;
  is_for_admin?: boolean;
  status: string;
  panel_code?: number;
}
