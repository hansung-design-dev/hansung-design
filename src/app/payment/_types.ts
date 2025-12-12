import type { CartItem } from '@/src/contexts/cartContext';

// UserProfile 타입 정의
export interface UserProfile {
  id: string;
  user_auth_id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  fax_number?: string;
  is_default: boolean;
  is_public_institution?: boolean;
  is_company?: boolean;
  is_approved?: boolean;
  created_at: string;
}

// 묶음 결제를 위한 그룹화된 아이템 인터페이스
export interface GroupedCartItem {
  id: string;
  name: string;
  items: CartItem[];
  totalPrice: number;
  district: string;
  type: 'banner-display' | 'led-display' | 'digital-signage';
  panel_type: string;
  is_public_institution?: boolean;
  is_company?: boolean;
  user_profile_id?: string;
  contact_person_name?: string;
  phone?: string;
  company_name?: string;
  email?: string;
  selectedFile?: File | null;
  fileUploadMethod?: 'upload' | 'email' | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  emailAddress?: string | null;
  // 상하반기 정보 추가
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number;
  selectedMonth?: number;
  periodText?: string;
}

export type BankAccountInfo = {
  bankName: string;
  accountNumber: string;
  owner: string;
};


