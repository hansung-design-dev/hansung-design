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
  title: JSX.Element;
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
