"use client";

import { useCart } from "./CartContext";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();

  const calcularTotal = () => {
    return items.reduce((acc, item) => {
      const cantidadEnKg =
        item.unidad === "g" ? item.cantidad / 1000 : item.cantidad;
      return acc + cantidadEnKg * item.precio_por_kg;
    }, 0);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-orange-50">
        <p className="text-xl text-gray-600">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50 p-10">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-10">
        Carrito de compras
      </h1>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.nombre}</h2>
              <p className="text-gray-600 text-sm">
                {item.cantidad} {item.unidad}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-red-500 font-semibold hover:underline text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xl font-bold">
          Total:{" "}
          <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
        </p>

        <button
          onClick={clearCart}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Vaciar carrito
        </button>
      </div>
    </main>
  );
}
