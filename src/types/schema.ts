import React from 'react';

// Type definitions for the application
export type Category =
  | '전체'
  | '공공디자인'
  | 'LED전자게시대'
  | '현수막'
  | '디지털사이니지';

export type ViewType = 'location' | 'gallery' | 'list';

export type Status = '진행중' | '송출중' | '완료' | '대기중';

// Database Schema for Supabase
export const schema = {
  // Districts table
  districts: {
    id: 'uuid',
    name: 'text',
    description: 'text',
    count: 'integer',
    bg_color: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // District Items table
  district_items: {
    id: 'uuid',
    district_id: 'uuid references districts(id)',
    title: 'text',
    subtitle: 'text',
    image: 'text',
    location: 'text',
    status: 'text',
    spots: 'integer',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Tags table
  tags: {
    id: 'uuid',
    name: 'text',
    created_at: 'timestamp with time zone',
  },

  // District Item Tags (junction table)
  district_item_tags: {
    district_item_id: 'uuid references district_items(id)',
    tag_id: 'uuid references tags(id)',
    created_at: 'timestamp with time zone',
  },

  // Gallery Images table
  gallery_images: {
    id: 'uuid',
    src: 'text',
    title: 'text',
    subtitle: 'text',
    keyword: 'text',
    main_keyword: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Projects table
  projects: {
    id: 'uuid',
    image_src: 'text',
    title: 'text',
    subtitle: 'text',
    description: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // FAQ Categories table
  faq_categories: {
    id: 'uuid',
    name: 'text',
    created_at: 'timestamp with time zone',
  },

  // FAQ Items table
  faq_items: {
    id: 'uuid',
    category_id: 'uuid references faq_categories(id)',
    question: 'text',
    answer: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Products table
  products: {
    id: 'uuid',
    title: 'text',
    subtitle: 'text',
    image: 'text',
    price: 'integer',
    tag_type: 'text',
    tag_district: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // Users table (for authentication)
  users: {
    id: 'uuid',
    email: 'text',
    full_name: 'text',
    avatar_url: 'text',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },

  // User Orders table
  orders: {
    id: 'uuid',
    user_id: 'uuid references users(id)',
    product_id: 'uuid references products(id)',
    status: 'text',
    start_date: 'timestamp with time zone',
    end_date: 'timestamp with time zone',
    created_at: 'timestamp with time zone',
    updated_at: 'timestamp with time zone',
  },
};

// TypeScript Interfaces
export interface District {
  id: string;
  name: string;
  description: string;
  count: number;
  bg_color?: string;
  created_at: string;
  updated_at: string;
}

export interface DistrictItem {
  id: string;
  district_id: string;
  title: string;
  subtitle: string;
  image: string;
  location: string;
  status: Status;
  spots: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  subtitle?: string;
  keyword?: string;
  main_keyword?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  image_src: string;
  title: string;
  subtitle?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  category?: FAQCategory;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  tag_type: string;
  tag_district: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  user?: User;
  product?: Product;
}

// 어드민 인증 타입
export interface AdminAuth {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// 어드민 프로필 타입
export interface AdminProfile {
  id: string;
  admin_auth_id: string;
  name: string;
  department?: string;
  position?: string;
  phone?: string;
  role: 'admin' | 'super_admin' | 'designer' | 'sales';
  permissions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_auth?: AdminAuth;
}

// 시안 교환 통합 타입
export interface DesignDraft {
  id: string;
  order_id: string;
  sender_user_profile_id?: string;
  sender_admin_profile_id?: string;
  receiver_user_profile_id?: string;
  receiver_admin_profile_id?: string;
  file_name?: string;
  file_url?: string;
  file_extension?: string;
  file_size?: number;
  draft_category: 'initial' | 'feedback' | 'revision' | 'final';
  notes?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// 결제 제공업체 타입
export type PaymentProvider =
  | 'naver_pay'
  | 'kakao_pay'
  | 'credit_card'
  | 'bank_transfer'
  | 'admin_approval';

// 결제수단 관련 타입
export interface PaymentMethod {
  id: string;
  name: string;
  method_type: string;
  method_code: string;
  is_active: boolean;
  description?: string;
  is_online: boolean;
  requires_admin_approval: boolean;
  created_at: string;
  updated_at: string;
}

// 결제 정보 타입
export interface Payment {
  id: string;
  order_id: string;
  payment_method_id: string;
  payment_provider?: PaymentProvider;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transaction_id?: string;
  payment_date?: string;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  depositor_name?: string;
  deposit_date?: string;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod;
}

// 주문 검증 정보 타입
export interface AdminOrderVerification {
  id: string;
  order_id: string;
  is_paid: boolean;
  is_checked: boolean;
  is_received_order: boolean;
  is_received_payment: boolean;
  is_draft_sent: boolean;
  is_draft_received: boolean;
  is_address_verified: boolean;
  is_draft_verified: boolean;
  received_payment_at?: string;
  admin_notes?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

// 주문 상태 확장
export interface OrderWithPayment extends Order {
  order_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  admin_approval_required: boolean;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  draft_upload_required: boolean;
  order_verifications?: AdminOrderVerification;
  payments?: Payment[];
  design_drafts?: DesignDraft[];
}

// 결제 플로우 상태
export type PaymentFlowStatus =
  | 'cart' // 장바구니
  | 'payment' // 결제 페이지
  | 'pending' // 결제 대기
  | 'waiting_admin' // 어드민 승인 대기
  | 'approved' // 어드민 승인됨
  | 'completed' // 결제 완료
  | 'cancelled'; // 취소됨

// 사용자 프로필 타입 (공공기관/기관용 구분)
export interface UserProfile {
  id: string;
  user_auth_id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  is_public_institution: boolean; // 공공기관 여부
  is_company: boolean; // 기관용 여부
  created_at: string;
  updated_at: string;
}

// Component Props Interfaces
export interface ViewTypeButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface NavProps {
  className?: string;
  isbg?: boolean;
  TextInvert?: boolean;
  variant?: 'default' | 'photo' | 'mixed';
}

export interface SectionProps {
  title: React.ReactNode;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  list: string[];
}

export interface ItemTableProps {
  items: DistrictItem[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  renderAction?: (item: DistrictItem) => React.ReactNode;
  onItemSelect?: (id: string, checked: boolean) => void;
}

export interface FilterableListProps {
  items: DistrictItem[];
  onItemSelect?: (selectedItems: string[]) => void;
  showCategoryFilter?: boolean;
}

export interface DateLocationFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  showStartCalendar: boolean;
  setShowStartCalendar: (open: boolean) => void;
  showEndCalendar: boolean;
  setShowEndCalendar: (open: boolean) => void;
}

export interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export interface RollingGalleryProps {
  images: GalleryImage[];
  autoPlayInterval?: number;
}

export interface ProjectRowProps {
  projects: Project[];
  largeCardFirst?: boolean;
  splitSmallSection?: boolean;
  className?: string;
}
