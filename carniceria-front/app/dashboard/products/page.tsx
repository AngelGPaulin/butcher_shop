"use client";

import { useEffect, useState } from "react";
import { Product } from "@/entities";
import { authHeaders } from "@/helpers/authHeaders";
import { API_URL } from "@/constants";
import { useCart } from "../cart/CartContext";
import { CartProvider } from "../cart/CartContext";

export default function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [units, setUnits] = useState<Record<string, "kg" | "g">>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/products`, {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
      } else {
        console.error("Error al obtener productos");
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">
        Productos disponibles
      </h1>

      {products.map((product) => {
        const quantity = quantities[product.productId] ?? 0;
        const unit = units[product.productId] ?? "kg";
        const step = unit === "g" ? 100 : 1;

        const total =
          product.precio_por_kg * (unit === "g" ? quantity / 1000 : quantity);

        return (
          <div
            key={product.productId}
            className="bg-white rounded-xl shadow p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-orange-500 mb-2">
              {product.nombre}
            </h2>
            <h2 className="text-lg font-semibold text-orange-500 mb-2">
              {product.precio_por_kg} $/kg
            </h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                step={step}
                value={quantity}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [product.productId]: Number(e.target.value),
                  }))
                }
                className="w-20 px-2 py-1 border rounded text-center"
              />

              <select
                value={unit}
                onChange={(e) =>
                  setUnits((prev) => ({
                    ...prev,
                    [product.productId]: e.target.value as "kg" | "g",
                  }))
                }
                className="px-2 py-1 border rounded"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>

              <span className="text-sm text-gray-700">
                Total: <strong>${total.toFixed(2)}</strong>
              </span>

              <button
                onClick={() =>
                  addItem({
                    ...product,
                    cantidad: quantity,
                    unidad: unit,
                  })
                }
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Agregar
              </button>
            </div>
          </div>
        );
      })}
      <div className="mt-10 flex justify-center gap-4">
        <a
          href="/dashboard/cart"
          className="border border-orange-500 text-orange-600 hover:bg-orange-100 transition font-medium py-2 px-6 rounded-md"
        >
          Ver carrito
        </a>
      </div>
    </main>
  );
}
