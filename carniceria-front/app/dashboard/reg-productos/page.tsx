"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-product.css";

interface Producto {
  productId: string;
  nombre: string;
  precio_por_kg: number;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  disponible: boolean;
  locationId: string;
  providerId: string;
}

export default function ProductoFormPage() {
  const [modo, setModo] = useState<"crear" | "actualizar">("crear");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);

  const [form, setForm] = useState<Producto>({
    productId: "",
    nombre: "",
    precio_por_kg: 0,
    unidad_medida: "Kg",
    stock_actual: 0,
    stock_minimo: 0,
    disponible: true,
    locationId: "",
    providerId: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name.includes("stock") || name.includes("precio")
          ? Number(value)
          : value,
    });
  };

  const resetForm = () => {
    setForm({
      productId: "",
      nombre: "",
      precio_por_kg: 0,
      unidad_medida: "Kg",
      stock_actual: 0,
      stock_minimo: 0,
      disponible: true,
      locationId: sucursales[0]?.locationId || "",
      providerId: proveedores[0]?.providerId || "",
    });
    setErrorMsg("");
  };

  useEffect(() => {
    const fetchData = async () => {
      const [locRes, provRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/locations`, { credentials: "include" }),
        fetch(`${API_URL}/providers`, { credentials: "include" }),
        fetch(`${API_URL}/products`, { credentials: "include" }),
      ]);
      const locData = await locRes.json();
      const provData = await provRes.json();
      const prodData = await prodRes.json();

      setSucursales(locData);
      setProveedores(provData);
      setProductos(prodData);

      if (!form.locationId && locData.length) {
        setForm((prev) => ({ ...prev, locationId: locData[0].locationId }));
      }
      if (!form.providerId && provData.length) {
        setForm((prev) => ({ ...prev, providerId: provData[0].providerId }));
      }
    };

    fetchData();
  }, []);

  const getProductoData = () => {
    return {
      ...form,
      precio_por_kg: Number(form.precio_por_kg),
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      disponible: true,
    };
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(getProductoData()),
    });

    if (res.ok) {
      alert("✅ Producto agregado");
      resetForm();
    } else {
      const err = await res.json();
      const msg = Array.isArray(err.message)
        ? err.message.join("\n")
        : err.message;
      setErrorMsg(msg);
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) return alert("Selecciona un producto");
    setErrorMsg("");

    const res = await fetch(`${API_URL}/products/${form.productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(getProductoData()),
    });

    if (res.ok) {
      alert("✅ Producto actualizado");
      resetForm();
    } else {
      const err = await res.json();
      const msg = Array.isArray(err.message)
        ? err.message.join("\n")
        : err.message;
      setErrorMsg(msg);
    }
  };

  const cargarProducto = (productId: string) => {
    const producto = productos.find((p) => p.productId === productId);
    if (producto) setForm({ ...producto });
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>{modo === "crear" ? "Crear Producto" : "Actualizar Producto"}</h1>
        <div
          className="form-actions"
          style={{ justifyContent: "center", marginBottom: "20px" }}
        >
          <button
            className="btn-submit"
            type="button"
            onClick={() => {
              setModo("crear");
              resetForm();
            }}
          >
            Crear Producto
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              setModo("actualizar");
              resetForm();
            }}
          >
            Actualizar Producto
          </button>
        </div>
      </div>

      <form
        className="product-form"
        onSubmit={modo === "crear" ? handleCrear : handleActualizar}
      >
        {modo === "actualizar" && (
          <div className="form-group">
            <label>Producto</label>
            <select
              name="productId"
              value={form.productId}
              onChange={(e) => cargarProducto(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Precio por Kg</label>
          <input
            name="precio_por_kg"
            type="number"
            value={form.precio_por_kg}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Unidad de medida</label>
          <select
            name="unidad_medida"
            value={form.unidad_medida}
            onChange={handleChange}
          >
            <option value="Kg">Kg</option>
            <option value="g">g</option>
            <option value="unidad">Unidad</option>
          </select>
        </div>

        <div className="form-group">
          <label>Stock actual</label>
          <input
            name="stock_actual"
            type="number"
            value={form.stock_actual}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Stock mínimo</label>
          <input
            name="stock_minimo"
            type="number"
            value={form.stock_minimo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Sucursal</label>
          <select
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
          >
            {sucursales.map((s) => (
              <option key={s.locationId} value={s.locationId}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Proveedor</label>
          <select
            name="providerId"
            value={form.providerId}
            onChange={handleChange}
          >
            {proveedores.map((p) => (
              <option key={p.providerId} value={p.providerId}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {errorMsg && (
          <div style={{ color: "red", fontWeight: "bold" }}>⚠️ {errorMsg}</div>
        )}

        <div className="form-actions">
          <button className="btn-submit" type="submit">
            {modo === "crear" ? "Agregar" : "Actualizar"}
          </button>
          <button className="btn-cancel" type="reset" onClick={resetForm}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
