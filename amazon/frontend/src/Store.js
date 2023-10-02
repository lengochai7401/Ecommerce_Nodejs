import React, { createContext, useEffect, useState } from 'react';

export const Store = createContext();

const initialState = {
  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
  },
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

export function StoreProvider(props) {
  const [state, setState] = useState(initialState);

  // Add a useEffect hook to save cartItems to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cart.cartItems));
  }, [state.cart.cartItems]);

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

      case 'CART_REMOVE_ITEM': {
        const cartItems = state.cart.cartItems.filter(
          (item) => item._id !== action.payload._id
        );
        setState({
          ...state,
          cart: {
            ...state.cart,
            cartItems: cartItems,
          },
        });

        break;
      }

      case 'CART_CLEAR': {
        setState({ ...state, cart: { ...state.cart, cartItems: [] } });
        break;
      }

      case 'USER_SIGNIN':
        setState({ ...state, userInfo: action.payload });
        break;
      case 'USER_SIGNOUT':
        setState({
          ...state,
          userInfo: null,
          cart: {
            ...state.cart,
            shippingAddress: {},
            cartItems: [],
            paymentMethod: '',
          },
        });

        break;
      case 'SAVE_SHIPPING_ADDRESS': {
        setState({
          ...state,
          cart: { ...state.cart, shippingAddress: action.payload },
        });
        break;
      }
      case 'SAVE_PAYMENT_METHOD': {
        setState({
          ...state,
          cart: {
            ...state.cart,
            paymentMethod: action.payload,
          },
        });
        break;
      }
      default:
        return state;
    }
  };

  const value = { state, dispatch };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
