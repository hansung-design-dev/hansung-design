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
}
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
