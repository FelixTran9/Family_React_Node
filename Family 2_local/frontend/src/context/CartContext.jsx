import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('familyMartCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('familyMartCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product_code === product.product_code);
      if (existingItem) {
        return prev.map(item => 
          item.product_code === product.product_code 
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty, id: product.product_code }];
    });
  };

  const removeFromCart = (product_code) => {
    setCart(prev => prev.filter(item => item.product_code !== product_code));
  };

  const updateQuantity = (product_code, quantity) => {
    if (quantity <= 0) {
      removeFromCart(product_code);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product_code === product_code 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
