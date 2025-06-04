"use client";

import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authHeaders, getUserInfo } from "@/helpers/authHeaders";
import { useCart } from "../tempo/CartContext";
import "./cart.css";

interface Location {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio_por_kg: number;
  stock_actual: number;
  locationId: string;
  unidad_medida: string;
}

export default function CombinedPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      kg: number;
      price: number;
      unidad_medida: string;
    }>
  >([]);
  const [availableProducts, setAvailableProducts] = useState<Producto[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [loading, setLoading] = useState({
    locations: true,
    products: true,
  });
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading((prev) => ({ ...prev, locations: true }));
        const headers = await authHeaders();
        const [locRes, user] = await Promise.all([
          fetch(`${API_URL}/locations`, { headers }),
          getUserInfo(),
        ]);

        const locData = await locRes.json();
        setLocations(Array.isArray(locData) ? locData : []);
        setUserId(user?.userId || "");

        if (locData.length > 0) {
          setSelectedLocation(locData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading((prev) => ({ ...prev, locations: false }));
      }
    };

    fetchInitialData();

    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const fetchProducts = async () => {
        try {
          setLoading((prev) => ({ ...prev, products: true }));
          const res = await fetch(
            `${API_URL}/products?locationId=${selectedLocation}`,
            {
              headers: await authHeaders(),
            }
          );
          const data = await res.json();
          setAvailableProducts(Array.isArray(data) ? data : []);
          setSearchTerm("");
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading((prev) => ({ ...prev, products: false }));
          searchInputRef.current?.focus();
        }
      };

      fetchProducts();
    }
  }, [selectedLocation]);

  const filteredProducts = availableProducts
    .filter(
      (product) =>
        product.locationId === selectedLocation &&
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const addProductToCart = (product: Producto) => {
    if (quantity <= 0) return;

    const price = product.precio_por_kg * quantity;
    const existingIndex = products.findIndex((p) => p.id === product.id);

    if (existingIndex >= 0) {
      const updated = [...products];
      updated[existingIndex].kg += quantity;
      updated[existingIndex].price += price;
      setProducts(updated);
    } else {
      setProducts([
        ...products,
        {
          id: product.id,
          name: product.nombre,
          kg: quantity,
          price,
          unidad_medida: product.unidad_medida,
        },
      ]);
    }

    setTotal((prev) => prev + price);
    setQuantity(1);
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const updateProductQuantity = (index: number, newKg: number) => {
    if (newKg <= 0) return;

    const updated = [...products];
    const product = availableProducts.find((p) => p.id === updated[index].id);
    if (!product) return;

    const newPrice = product.precio_por_kg * newKg;
    updated[index].kg = newKg;
    updated[index].price = newPrice;
    setProducts(updated);

    const newTotal = updated.reduce((sum, p) => sum + p.price, 0);
    setTotal(newTotal);
  };

  const removeProduct = (index: number) => {
    const price = products[index].price;
    const newList = products.filter((_, i) => i !== index);
    setProducts(newList);
    setTotal((prev) => prev - price);
    searchInputRef.current?.focus();
  };

  const confirmarVenta = async () => {
    try {
      const headers = await authHeaders();
      const sale = {
        userId,
        locationId: selectedLocation,
        items: products.map((p) => ({
          productId: p.id,
          peso_kg: p.kg,
          precio_por_kg: p.price / p.kg,
          subtotal: p.price,
        })),
      };

      const res = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sale),
      });

      if (res.ok) {
        alert("✅ Venta registrada con éxito");
        setProducts([]);
        setTotal(0);
      } else {
        const err = await res.json();
        alert("Error al registrar venta: " + err.message);
      }
    } catch (err) {
      console.error("Error al confirmar venta:", err);
      alert("Error al confirmar venta");
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-logo-box">
          <img src="/logo.png" alt="Logo" className="cart-logo" />
        </div>
        <h1>Carnicería Karlita</h1>
      </div>

      <div className="cart-info-section">
        <div className="info-row">
          <div className="info-group">
            <label>Sucursal:</label>
            {loading.locations ? (
              <div className="loading-text">Cargando sucursales...</div>
            ) : (
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="info-group">
            <label>Fecha y Hora:</label>
            <input
              type="text"
              value={currentDateTime}
              readOnly
              className="read-only"
            />
          </div>
        </div>
      </div>

      <div className="product-search-section">
        <div className="search-group">
          <label>Buscar Producto:</label>
          <input
            type="text"
            placeholder="Escriba para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading.products}
            ref={searchInputRef}
            autoComplete="off"
          />
          {searchTerm && (
            <div className="search-results">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`result-item ${
                      product.stock_actual <= 0 ? "out-of-stock" : ""
                    }`}
                    onClick={() =>
                      product.stock_actual > 0 && addProductToCart(product)
                    }
                  >
                    <span className="product-name">{product.nombre}</span>
                    <span className="product-details">
                      ${product.precio_por_kg}/{product.unidad_medida}
                      {product.stock_actual > 0 ? (
                        <span className="stock-available">
                          (Stock: {product.stock_actual} {product.unidad_medida}
                          )
                        </span>
                      ) : (
                        <span className="stock-out"> (Agotado)</span>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  No se encontraron productos en esta sucursal
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="cart-table-container">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={`${product.id}-${index}`}>
                <td>{product.name}</td>
                <td>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={product.kg}
                    onChange={(e) =>
                      updateProductQuantity(
                        index,
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />{" "}
                  {product.unidad_medida}
                </td>
                <td>${product.price.toFixed(2)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => removeProduct(index)}
                    className="remove-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-cart">
                  No hay productos en el carrito
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="cart-total-section">
        <div className="total-row">
          <span>Total:</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
        <div className="action-buttons">
          <button
            className="confirm-button"
            disabled={products.length === 0}
            onClick={confirmarVenta}
          >
            Confirmar Venta
          </button>
          <button className="btn-cancel" onClick={() => router.push("/admin")}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
