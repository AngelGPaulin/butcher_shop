"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type UnidadMedida = "kg" | "g";

interface CartItem {
  productId: string;
  nombre: string;
  precio_por_kg: number;
  cantidad: number;
  unidad: UnidadMedida;
}

interface CartContextProps {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const found = prev.find((item) => item.productId === newItem.productId);
      if (found) {
        return prev.map((item) =>
          item.productId === newItem.productId
            ? { ...item, cantidad: item.cantidad + newItem.cantidad }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
