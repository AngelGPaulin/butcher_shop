"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-product.css";
import { useRouter } from "next/navigation";

interface Producto {
  id?: string;
  nombre: string;
  pricePerKg: number;
  unit: string;
  currentStock: number;
  minStock: number;
  available: boolean; // Aunque siempre será true en el frontend, la interfaz lo mantiene
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

  const [form, setForm] = useState<Producto>({
    id: "",
    nombre: "",
    pricePerKg: 0,
    unit: "Kg",
    currentStock: 0,
    minStock: 0,
    available: true, // Siempre true por defecto
    locationId: "",
    providerId: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleRedirect = (path: string) => router.push(path);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      let newValue: string | number = value;

      if (["pricePerKg", "currentStock", "minStock"].includes(name)) {
        newValue = Number(value);
        // Asegúrate de que no sea NaN; si lo es, usa 0
        if (isNaN(newValue)) {
          newValue = 0;
        }
      }

      return {
        ...prevForm,
        [name]: newValue,
      };
    });
  };

  const resetForm = () => {
    setForm({
      id: "",
      nombre: "",
      pricePerKg: 0,
      unit: "Kg",
      currentStock: 0,
      minStock: 0,
      available: true, // Siempre true al resetear
      locationId: sucursales[0]?.id || "",
      providerId: proveedores[0]?.id || "",
    });
    setErrorMsg("");
  };

  const cargarDatos = async () => {
    try {
      const [locRes, provRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/locations`, { credentials: "include" }),
        fetch(`${API_URL}/providers`, { credentials: "include" }),
        fetch(`${API_URL}/products`, { credentials: "include" }),
      ]);

      if (!locRes.ok) throw new Error("Failed to fetch locations");
      if (!provRes.ok) throw new Error("Failed to fetch providers");
      if (!prodRes.ok) throw new Error("Failed to fetch products");

      const locData = await locRes.json();
      const provData = await provRes.json();
      const prodData = await prodRes.json();

      setSucursales(locData);
      setProveedores(provData);
      setProductos(prodData);

      setForm((prevForm) => {
        const updatedForm = { ...prevForm };
        if (!prevForm.locationId && locData.length > 0) {
          updatedForm.locationId = locData[0].id;
        }
        if (!prevForm.providerId && provData.length > 0) {
          updatedForm.providerId = provData[0].id;
        }
        return updatedForm;
      });
    } catch (error: any) {
      console.error("Error al cargar datos iniciales:", error);
      setErrorMsg(error.message || "Error al cargar datos iniciales.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const data: any = {
      nombre: form.nombre,
      precio_por_kg: Number(form.pricePerKg),
      unidad_medida: form.unit,
      stock_actual: Number(form.currentStock),
      stock_minimo: Number(form.minStock),
      disponible: true, // Siempre true
      locationId: form.locationId,
      providerId: form.providerId,
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = Array.isArray(err.message)
          ? err.message.join("\n")
          : err.message;
        throw new Error(msg);
      }

      alert("✅ Producto agregado");
      resetForm();
      cargarDatos();
    } catch (err: any) {
      console.error("Error al crear producto:", err);
      setErrorMsg(err.message || "Error desconocido al crear producto.");
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) {
      setErrorMsg("Por favor, selecciona un producto para actualizar.");
      return;
    }
    setErrorMsg("");

    const dataToSend = {
      nombre: form.nombre,
      precio_por_kg: Number(form.pricePerKg),
      unidad_medida: form.unit,
      stock_actual: Number(form.currentStock),
      stock_minimo: Number(form.minStock),
      disponible: true, // Siempre true
      locationId: form.locationId,
      providerId: form.providerId,
    };

    try {
      const res = await fetch(`${API_URL}/products/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = Array.isArray(err.message)
          ? err.message.join("\n")
          : err.message;
        throw new Error(msg);
      }

      alert("✅ Producto actualizado");
      resetForm();
      cargarDatos();
    } catch (err: any) {
      console.error("Error al actualizar producto:", err);
      setErrorMsg(err.message || "Error desconocido al actualizar producto.");
    }
  };

  const handleEliminar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id) {
      setErrorMsg("Por favor, selecciona un producto para eliminar.");
      return;
    }

    const confirmar = confirm(`¿Eliminar producto "${form.nombre}"?`);
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/products/${form.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = Array.isArray(err.message)
          ? err.message.join("\n")
          : err.message;
        throw new Error(msg);
      }

      alert("🗑️ Producto eliminado");
      resetForm();
      cargarDatos();
    } catch (err: any) {
      console.error("Error al eliminar producto:", err);
      setErrorMsg(err.message || "Error desconocido al eliminar producto.");
    }
  };

  const cargarProducto = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      // Asegúrate de que todos los campos numéricos sean números válidos
      setForm({
        ...producto,
        pricePerKg: Number(producto.pricePerKg) || 0, // Si es NaN, que sea 0
        currentStock: Number(producto.currentStock) || 0,
        minStock: Number(producto.minStock) || 0,
        available: true, // Siempre true al cargar
      });
    } else {
      console.warn("Producto no encontrado:", id);
      resetForm();
    }
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
            className={`btn-submit ${modo === "crear" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setModo("crear");
              resetForm();
            }}
          >
            Crear Producto
          </button>
          <button
            className={`btn-submit ${modo === "actualizar" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setModo("actualizar");
              resetForm();
            }}
          >
            Actualizar Producto
          </button>
          <button
            className={`btn-cancel ${modo === "eliminar" ? "active" : ""}`}
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
        {(modo === "actualizar" || modo === "eliminar") && (
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
                    key={prod.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => cargarProducto(prod.id!)}
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
                name="pricePerKg"
                type="number"
                value={form.pricePerKg}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Unidad de medida</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                <option value="Kg">Kg</option>
                <option value="g">g</option>
                <option value="unidad">Unidad</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock actual</label>
              <input
                name="currentStock"
                type="number"
                value={form.currentStock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock mínimo</label>
              <input
                name="minStock"
                type="number"
                value={form.minStock}
                onChange={handleChange}
                required
              />
            </div>

            {/* Eliminado el checkbox 'disponible' */}

            <div className="form-group">
              <label>Sucursal</label>
              <select
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
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
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <div className="form-actions">
          <button className="btn-submit" type="submit">
            {modo === "crear"
              ? "Agregar"
              : modo === "actualizar"
              ? "Actualizar"
              : "Eliminar"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => handleRedirect("admin")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
