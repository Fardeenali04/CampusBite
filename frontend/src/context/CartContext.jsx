import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campusbite_cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("campusbite_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(item, restaurant) {
    if (
      cartItems.length > 0 &&
      cartItems[0].restaurantId !== restaurant.id
    ) {
      return {
        success: false,
        message: "Your cart contains items from another restaurant. Clear it first.",
      };
    }

    setCartItems((current) => {
      const existing = current.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          image_url: item.image_url,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          quantity: 1,
        },
      ];
    });

    return { success: true };
  }

  function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }

  function removeFromCart(itemId) {
    setCartItems((current) =>
      current.filter((item) => item.id !== itemId)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}