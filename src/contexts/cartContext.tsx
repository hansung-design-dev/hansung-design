'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  type: 'led-display' | 'banner-display';
  name: string;
  district: string;
  price: number;
  halfPeriod?: 'first_half' | 'second_half';
  selectedYear?: number; // 선택한 년도 (예: 2025)
  selectedMonth?: number; // 선택한 월 (예: 7)
  panel_type?: string;
  panel_info_id?: string; // panel_info 테이블의 실제 ID
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    is_premium: boolean | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_info_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
}

interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; state: CartState };

const CartContext = createContext<{
  cart: CartItem[];
  dispatch: React.Dispatch<CartAction>;
}>({ cart: [], dispatch: () => {} });

// localStorage 키
const CART_STORAGE_KEY = 'hansung_cart';

// 15분을 밀리초로 변환
const CART_EXPIRY_TIME = 15 * 60 * 1000;

// localStorage에서 장바구니 로드
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

    // 상담신청 아이템(price가 0인 아이템)과 일반 아이템 분리
    const consultingItems = cartState.items.filter((item) => item.price === 0);

    // 15분이 지났으면 일반 아이템만 리셋, 상담신청 아이템은 유지
    if (now - cartState.lastUpdated > CART_EXPIRY_TIME) {
      console.log('🔍 Regular cart items expired, clearing...');
      const updatedState = {
        items: consultingItems, // 상담신청 아이템만 유지
        lastUpdated: now,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedState));
      return updatedState;
    }

    console.log('🔍 Cart loaded from storage:', cartState);
    return cartState;
  } catch (error) {
    console.error('🔍 Error loading cart from storage:', error);
    return { items: [], lastUpdated: Date.now() };
  }
};

// localStorage에 장바구니 저장
const saveCartToStorage = (state: CartState) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    console.log('🔍 Cart saved to storage:', state);
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
        panel_info_id: action.item.panel_info_id,
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
      });
      newState = {
        items: [...state.items, action.item],
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after ADD_ITEM:', newState);
      saveCartToStorage(newState);
      return newState;

    case 'REMOVE_ITEM':
      newState = {
        items: state.items.filter((i) => i.id !== action.id),
        lastUpdated: Date.now(),
      };
      console.log('🔍 New cart state after REMOVE_ITEM:', newState);
      saveCartToStorage(newState);
      return newState;

    case 'CLEAR_CART':
      console.log('🔍 Clearing cart');
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

  // 컴포넌트 마운트 시 localStorage에서 장바구니 로드
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    dispatch({ type: 'LOAD_CART', state: savedCart });
  }, []);

  // 15분마다 장바구니 만료 체크
  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      if (now - state.lastUpdated > CART_EXPIRY_TIME) {
        console.log(
          '🔍 Regular cart items expired during session, clearing...'
        );
        // 상담신청 아이템만 유지하고 일반 아이템 제거
        const consultingItems = state.items.filter((item) => item.price === 0);
        dispatch({
          type: 'LOAD_CART',
          state: { items: consultingItems, lastUpdated: now },
        });
      }
    };

    const interval = setInterval(checkExpiry, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [state.lastUpdated, state.items]);

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
