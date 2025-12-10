'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  type:
    | 'led-display'
    | 'banner-display'
    | 'digital-signage'
    | 'public-design'
    | 'digital-product';
  name: string;
  district: string;
  price: number;
  // 상담신청 중복 방지를 위한 공통 키 (타입별 + 실제 식별자 조합)
  consultationKey?: string;
  total_price?: number; // LED 전자게시대의 실제 가격 정보
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number; // 선택한 년도 (예: 2025)
  selectedMonth?: number; // 선택한 월 (예: 7)
  panel_type?: string;
  panel_id?: string; // panels 테이블의 실제 ID
  isTopFixed?: boolean; // 상단광고 여부
  is_public_institution?: boolean; // 공공기관용 여부
  is_company?: boolean; // 기업용 여부
  is_for_admin?: boolean; // 행정용 패널 여부
  panel_code?: string; // 패널 코드(번호)
  photo_url?: string; // 게시대 사진 URL
  // 기간 데이터 추가 (구별 카드에서 전달받은 데이터)
  periodData?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  };
  // 선택된 기간의 시작/종료 날짜
  selectedPeriodFrom?: string;
  selectedPeriodTo?: string;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
  // 사용자 정보 추가
  contact_person_name?: string;
  phone?: string;
  company_name?: string;
  email?: string;
  user_profile_id?: string; // 실제 user_profiles 테이블의 ID
  user_auth_id?: string; // 사용자 인증 ID
  led_slot_id?: string;
  digitalProductUuid?: string;
  // 파일 업로드 관련 정보 추가
  selectedFile?: File | null;
  fileUploadMethod?: 'upload' | 'email' | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  emailAddress?: string | null;
  draftId?: string | null;
  designDraftId?: string | null;
  // 아이템이 장바구니에 추가된 시간 (밀리초)
  addedAt?: number;
}

interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_CART'; items: CartItem[] }
  | { type: 'REMOVE_ITEMS'; ids: string[] }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; state: CartState };

const CartContext = createContext<{
  cart: CartItem[];
  dispatch: React.Dispatch<CartAction>;
}>({ cart: [], dispatch: () => {} });

// localStorage 키
const CART_STORAGE_KEY = 'hansung_cart';

// 20분을 밀리초로 변환
const CART_EXPIRY_TIME = 20 * 60 * 1000;

const buildCartDebugMetadata = (
  label: string,
  details: Record<string, unknown> = {}
) => {
  if (typeof window === 'undefined') {
    return {
      label,
      timestamp: new Date().toISOString(),
      ...details,
    };
  }

  return {
    label,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    host: window.location.host,
    ...details,
  };
};

const logCartDebug = (label: string, details: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;
  const title = `🧭 [장바구니 디버그] ${label}`;
  console.groupCollapsed(title);
  console.log(buildCartDebugMetadata(label, details));
  console.groupEnd();
};

// localStorage에서 장바구니 로드 (무한루프 방지)
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], lastUpdated: Date.now() };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], lastUpdated: Date.now() };
    }

    const cartState: CartState = JSON.parse(stored);
    const now = Date.now();

    // 각 아이템별로 20분이 지났는지 확인
    // addedAt이 없으면 lastUpdated를 기준으로 판단 (기존 아이템 호환성)
    const validItems = cartState.items.filter((item) => {
      // 상담신청 아이템은 항상 유지
      if (item.price === 0) return true;

      // 아이템 추가 시간 확인 (addedAt이 없으면 lastUpdated 사용)
      const itemAddedAt = item.addedAt || cartState.lastUpdated;
      const timeSinceAdded = now - itemAddedAt;

      // 20분이 지나지 않은 아이템만 유지
      return timeSinceAdded <= CART_EXPIRY_TIME;
    });

    // 만료된 아이템이 있으면 필터링된 아이템으로 업데이트
    if (validItems.length !== cartState.items.length) {
      console.log('🔍 Some cart items expired, filtering...', {
        originalCount: cartState.items.length,
        validCount: validItems.length,
        expiredCount: cartState.items.length - validItems.length,
      });
      return {
        items: validItems,
        lastUpdated: now,
      };
    }

    console.log('🔍 Cart loaded from storage:', cartState);
    console.log('🔍 [Cart 복원] 아이템 user_profile_id 확인:', {
      itemsCount: cartState.items.length,
      items:
        cartState.items.map((item) => ({
          id: item.id,
          name: item.name,
          user_profile_id: item.user_profile_id,
          user_auth_id: item.user_auth_id,
          hasUserProfileId: !!item.user_profile_id,
        })) || [],
    });
    logCartDebug('장바구니 저장소에서 로드됨', {
      action: 'LOAD_CART',
      items: cartState.items.map((item) => ({
        id: item.id,
        user_profile_id: item.user_profile_id,
      })),
    });
    return cartState;
  } catch (error) {
    console.error('🔍 Error loading cart from storage:', error);
    logCartDebug('장바구니 로드 실패', { error });
    return { items: [], lastUpdated: Date.now() };
  }
};

// localStorage에 장바구니 저장
const saveCartToStorage = (state: CartState) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    console.log('🔍 Cart saved to storage:', state);
    console.log('🔍 [Cart 저장] 아이템 user_profile_id 확인:', {
      itemsCount: state.items.length,
      items:
        state.items.map((item) => ({
          id: item.id,
          name: item.name,
          user_profile_id: item.user_profile_id,
          user_auth_id: item.user_auth_id,
          hasUserProfileId: !!item.user_profile_id,
        })) || [],
    });
  } catch (error) {
    console.error('🔍 Error saving cart to storage:', error);
  }
};

function cartReducer(state: CartState, action: CartAction): CartState {
  console.log('🔍 Cart reducer called with action:', action);
  console.log('🔍 Current cart state:', state);

  let newState: CartState;

  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.find((i) => i.id === action.item.id)) {
        console.log(
          '🔍 Item already exists in cart, skipping:',
          action.item.id
        );
        return state;
      }
      console.log('🔍 Adding item to cart:', {
        id: action.item.id,
        panel_id: action.item.panel_id,
        name: action.item.name,
        price: action.item.price,
        halfPeriod: action.item.halfPeriod,
        selectedYear: action.item.selectedYear,
        selectedMonth: action.item.selectedMonth,
        displayPeriod:
          action.item.selectedYear &&
          action.item.selectedMonth &&
          action.item.halfPeriod
            ? `${action.item.selectedYear}년 ${action.item.selectedMonth}월 ${
                action.item.halfPeriod === 'first_half' ? '상반기' : '하반기'
              }`
            : '기간 미설정',
        user_profile_id: action.item.user_profile_id,
        user_auth_id: action.item.user_auth_id,
        hasUserProfileId: !!action.item.user_profile_id,
      });
      // 아이템 추가 시 현재 시간을 addedAt으로 설정
      const itemWithTimestamp = {
        ...action.item,
        addedAt: Date.now(),
      };
      newState = {
        items: [...state.items, itemWithTimestamp],
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after ADD_ITEM:', newState);
      logCartDebug('아이템 추가됨', {
        action: 'ADD_ITEM',
        itemId: action.item.id,
        totalItems: newState.items.length,
      });
      saveCartToStorage(newState);
      return newState;

    case 'REMOVE_ITEM':
      newState = {
        items: state.items.filter((i) => i.id !== action.id),
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after REMOVE_ITEM:', newState);
      logCartDebug('아이템 제거됨', {
        action: 'REMOVE_ITEM',
        removedId: action.id,
        totalItems: newState.items.length,
      });
      saveCartToStorage(newState);
      return newState;

    case 'UPDATE_CART':
      // 기존 아이템의 addedAt을 유지하고, 새로 추가된 아이템에는 현재 시간 설정
      const updatedItems = action.items.map((newItem) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem && existingItem.addedAt) {
          // 기존 아이템이면 addedAt 유지
          return { ...newItem, addedAt: existingItem.addedAt };
        }
        // 새로 추가된 아이템이면 현재 시간 설정
        return { ...newItem, addedAt: newItem.addedAt || Date.now() };
      });
      newState = {
        items: updatedItems,
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after UPDATE_CART:', newState);
      logCartDebug('장바구니 갱신됨', {
        action: 'UPDATE_CART',
        totalItems: newState.items.length,
      });
      saveCartToStorage(newState);
      return newState;

    case 'REMOVE_ITEMS': {
      if (action.ids.length === 0) {
        return state;
      }
      const idsToRemove = new Set(action.ids);
      const filteredItems = state.items.filter(
        (item) => !idsToRemove.has(item.id)
      );
      const newState = {
        items: filteredItems,
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after REMOVE_ITEMS:', newState);
      logCartDebug('여러 아이템 제거됨', {
        action: 'REMOVE_ITEMS',
        removedIds: action.ids,
        totalItems: newState.items.length,
      });
      saveCartToStorage(newState);
      return newState;
    }

    case 'CLEAR_CART':
      console.log('🔍 Clearing cart');
      logCartDebug('장바구니 초기화됨', {
        action: 'CLEAR_CART',
      });
      newState = { items: [], lastUpdated: Date.now() };
      saveCartToStorage(newState);
      return newState;

    case 'LOAD_CART':
      console.log('🔍 Loading cart from storage');
      return action.state;

    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    lastUpdated: Date.now(),
  });

  //   // 컴포넌트 마운트 시 localStorage에서 장바구니 로드
  useEffect(() => {
    console.log('🔄 CartContext: Loading cart from storage...');
    const savedCart = loadCartFromStorage();
    console.log('🔄 CartContext: Saved cart loaded:', savedCart);
    dispatch({ type: 'LOAD_CART', state: savedCart });
  }, []);

  // 1분마다 장바구니 만료 체크 (각 아이템별로 20분이 지났는지 확인)
  useEffect(() => {
    console.log('🔄 CartContext: Setting up expiry check interval...');
    const checkExpiry = () => {
      const now = Date.now();
      console.log('🔄 CartContext: Checking expiry, current state:', state);

      // 각 아이템별로 20분이 지났는지 확인
      // addedAt이 없으면 lastUpdated를 기준으로 판단 (기존 아이템 호환성)
      const validItems = state.items.filter((item) => {
        // 상담신청 아이템은 항상 유지
        if (item.price === 0) return true;

        // 아이템 추가 시간 확인 (addedAt이 없으면 lastUpdated 사용)
        const itemAddedAt = item.addedAt || state.lastUpdated;
        const timeSinceAdded = now - itemAddedAt;

        // 20분이 지나지 않은 아이템만 유지
        return timeSinceAdded <= CART_EXPIRY_TIME;
      });

      // 만료된 아이템이 있으면 필터링된 아이템으로 업데이트
      if (validItems.length !== state.items.length) {
        console.log(
          '🔍 Regular cart items expired during session, filtering...',
          {
            originalCount: state.items.length,
            validCount: validItems.length,
            expiredCount: state.items.length - validItems.length,
          }
        );
        dispatch({
          type: 'LOAD_CART',
          state: { items: validItems, lastUpdated: now },
        });
      }
    };
    const interval = setInterval(checkExpiry, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [state]); // state를 의존성에 추가하여 최신 상태 확인

  return (
    <CartContext.Provider value={{ cart: state.items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  const addToCart = (
    item: Omit<CartItem, 'id'>,
    halfPeriod?: 'first_half' | 'second_half',
    selectedYear?: number,
    selectedMonth?: number
  ) => {
    const newItem: CartItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      halfPeriod,
      selectedYear,
      selectedMonth,
    };
    context.dispatch({ type: 'ADD_ITEM', item: newItem });
  };

  return {
    ...context,
    addToCart,
  };
};
