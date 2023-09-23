import React, { createContext, useState } from 'react';

export const Store = createContext();

const initialState = {
  cart: {
    cartItems: [],
  },
};

export function StoreProvider(props) {
  const [state, setState] = useState(initialState);

  const dispatch = (action) => {
    switch (action.type) {
      case 'CART_ADD_ITEM':
        // add to cart
        const newItem = action.payload;
        const existItemIndex = state.cart.cartItems.findIndex(
          (item) => item._id === newItem._id
        );

        if (existItemIndex !== -1) {
          const updatedCartItems = [...state.cart.cartItems];
          updatedCartItems[existItemIndex] = newItem;
          setState({
            ...state,
            cart: {
              ...state.cart,
              cartItems: updatedCartItems,
            },
          });
        } else {
          setState({
            ...state,
            cart: {
              ...state.cart,
              cartItems: [...state.cart.cartItems, newItem],
            },
          });
        }
        break;

      default:
        return state;
    }
  };

  const value = { state, dispatch };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
