// 팝업 공지사항 JSON 구조 타입 정의

export interface PopupNoticeContent {
  // 기본 정보
  title: string;
  subtitle?: string;

  // 내용 타입 (팝업 스타일 결정)
  contentType: 'checklist' | 'guide' | 'notice' | 'custom';

  // 섹션들 (여러 섹션으로 구성 가능)
  sections: PopupSection[];

  // 푸터 정보
  footer?: {
    text?: string;
    contact?: string;
    links?: Array<{
      text: string;
      url?: string;
      action?: string;
    }>;
  };

  // 스타일 옵션
  style?: {
    headerColor?: string;
    accentColor?: string;
    highlightColor?: string;
  };
}

export interface PopupSection {
  type: 'text' | 'checklist' | 'highlight' | 'button' | 'divider';
  content:
    | ChecklistSection['content']
    | HighlightSection['content']
    | ButtonSection['content']
    | DividerSection['content']
    | string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
  };
}

// 체크리스트 섹션
export interface ChecklistSection extends PopupSection {
  type: 'checklist';
  content: {
    items: Array<{
      text: string;
      highlighted?: string[];
      subItems?: string[];
      important?: boolean;
    }>;
  };
}

// 하이라이트 텍스트 섹션
export interface HighlightSection extends PopupSection {
  type: 'highlight';
  content: {
    text: string;
    highlights: Array<{
      text: string;
      color?: string;
      bold?: boolean;
    }>;
  };
}

// 버튼 섹션
export interface ButtonSection extends PopupSection {
  type: 'button';
  content: {
    text: string;
    action: string;
    url?: string;
    style?: 'primary' | 'secondary' | 'danger';
  };
}

// 구분선 섹션
export interface DividerSection extends PopupSection {
  type: 'divider';
  content: {
    color?: string;
    height?: number;
  };
}

// 팝업 공지사항 전체 타입
export interface PopupNotice {
  id: string;
  display_category_id?: string;
  title: string;
  hide_oneday: boolean;
  content: PopupNoticeContent;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  region_gu_id?: string;
  notice_categories_id?: string;
  created_at: string;
  updated_at: string;
}
