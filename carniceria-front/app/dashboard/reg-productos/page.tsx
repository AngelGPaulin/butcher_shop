"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-product.css";
import { useRouter } from "next/navigation";

interface Producto {
  productId?: string;
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
  const [modo, setModo] = useState<"crear" | "actualizar" | "eliminar">(
    "crear"
  );
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const router = useRouter();
  const handleRedirect = (path: string) => { //funcion para redirigir a otra ruta
  router.push(path);};

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

  const cargarDatos = async () => {
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

  useEffect(() => {
    cargarDatos();
  }, []);

  const getProductoData = () => {
    const data = {
      ...form,
      precio_por_kg: Number(form.precio_por_kg),
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      disponible: true,
    };

    if (!data.productId) {
      delete data.productId;
    }

    return data;
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const data = getProductoData();
    delete data.productId;

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("✅ Producto agregado");
      resetForm();
      cargarDatos();
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

    const { productId, ...dataToSend } = getProductoData();

    const res = await fetch(`${API_URL}/products/${form.productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      alert("✅ Producto actualizado");
      resetForm();
      cargarDatos();
    } else {
      const err = await res.json();
      const msg = Array.isArray(err.message)
        ? err.message.join("\n")
        : err.message;
      setErrorMsg(msg);
    }
  };

  const handleEliminar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) return alert("Selecciona un producto");

    const confirmar = confirm(`¿Eliminar producto "${form.nombre}"?`);
    if (!confirmar) return;

    const res = await fetch(`${API_URL}/products/${form.productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      alert("🗑️ Producto eliminado");
      resetForm();
      cargarDatos();
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

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(form.nombre.toLowerCase())
  );

  return (
    <div className="product-form-container">
      <div className="form-header">
        <div className="regProd-logo-box">
          <img src="/logo.png" alt="Logo" className="regProd-logo" />
        </div>
        
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
            className="btn-crear"
            type="button"
            onClick={() => {
              setModo("actualizar");
              resetForm();
            }}
          >
            Actualizar Producto
          </button>
          <button
            className="btn-delete"
            type="button"
            onClick={() => {
              setModo("eliminar");
              resetForm();
            }}
          >
            Eliminar Producto
          </button>
        </div>
      </div>

      <form
        className="product-form"
        onSubmit={
          modo === "crear"
            ? handleCrear
            : modo === "actualizar"
            ? handleActualizar
            : handleEliminar
        }
      >
        {modo !== "crear" && (
          <div className="form-group">
            <label>Buscar Producto</label>
            <input
              type="text"
              value={form.nombre}
              name="nombre"
              onChange={handleChange}
              placeholder="Buscar producto por nombre..."
              autoComplete="off"
              required
            />
            {form.nombre && productosFiltrados.length > 0 && (
              <ul className="bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto rounded shadow">
                {productosFiltrados.map((prod) => (
                  <li
                    key={prod.productId}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => cargarProducto(prod.productId!)}
                  >
                    {prod.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(modo === "crear" || modo === "actualizar") && (
          <>
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
          </>
        )}

        {errorMsg && (
          <div style={{ color: "red", fontWeight: "bold" }}>⚠️ {errorMsg}</div>
        )}

        <div className="form-actions">
          <button className="btn-submit" type="submit">
            {modo === "crear"
              ? "Agregar"
              : modo === "actualizar"
              ? "Actualizar"
              : "Eliminar"}
          </button>
          <button type="button" className="btn-cancel" onClick={() => handleRedirect("/admin")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
