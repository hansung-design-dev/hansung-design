'use client';
import React, { createContext, useContext, useReducer } from 'react';

export interface CartItem {
  id: number;
  type: 'led-display' | 'banner-display';
  name: string;
  district: string;
  price: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  cart: CartItem[];
  dispatch: React.Dispatch<CartAction>;
}>({ cart: [], dispatch: () => {} });

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.find((i) => i.id === action.item.id)) return state;
      return [...state, action.item];
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
