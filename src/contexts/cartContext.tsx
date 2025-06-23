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
  console.log('🔍 Cart reducer called with action:', action);
  console.log('🔍 Current cart state:', state);

  let newState: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM':
      if (state.find((i) => i.id === action.item.id)) {
        console.log(
          '🔍 Item already exists in cart, skipping:',
          action.item.id
        );
        return state;
      }
      newState = [...state, action.item];
      console.log('🔍 New cart state after ADD_ITEM:', newState);
      return newState;
    case 'REMOVE_ITEM':
      newState = state.filter((i) => i.id !== action.id);
      console.log('🔍 New cart state after REMOVE_ITEM:', newState);
      return newState;
    case 'CLEAR_CART':
      console.log('🔍 Clearing cart');
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
