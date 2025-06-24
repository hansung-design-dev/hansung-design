'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: number;
  type: 'led-display' | 'banner-display';
  name: string;
  district: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: number }
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

    // 15분이 지났으면 장바구니 리셋
    if (now - cartState.lastUpdated > CART_EXPIRY_TIME) {
      console.log('🔍 Cart expired, clearing...');
      localStorage.removeItem(CART_STORAGE_KEY);
      return { items: [], lastUpdated: now };
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
        console.log('🔍 Cart expired during session, clearing...');
        dispatch({ type: 'CLEAR_CART' });
      }
    };

    const interval = setInterval(checkExpiry, 60000); // 1분마다 체크
    return () => clearInterval(interval);
  }, [state.lastUpdated]);

  return (
    <CartContext.Provider value={{ cart: state.items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
