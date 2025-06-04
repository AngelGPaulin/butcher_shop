"use client";

import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authHeaders } from "@/helpers/authHeaders";
import "./prin-admin.css";

interface Sucursal {
  locationId: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio_por_kg: number;
  stock_actual: number;
  locationId: string;
}

const PrincipalAdmin = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("todas");
  const [nombreProducto, setNombreProducto] = useState("");
  const [loading, setLoading] = useState({
    sucursales: true,
    productos: false,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMerma, setTotalMerma] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const consultarProductos = async () => {
    setLoading((prev) => ({ ...prev, productos: true }));
    setError(null);
    setTotalMerma(0);

    try {
      const headers = await authHeaders();
      let url = `${API_URL}/products`;
      if (sucursalSeleccionada !== "todas") {
        url += `?locationId=${sucursalSeleccionada}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

      const data: Producto[] = await res.json();
      setProductos(data);

      const sumaMerma = data.reduce((total, producto) => {
        const stock = Number(producto.stock_actual) || 0;
        const mermaKg = stock * 0.2;
        return total + mermaKg;
      }, 0);

      setTotalMerma(sumaMerma);
    } catch (err: any) {
      console.error("Error al consultar productos:", err);
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, productos: false }));
    }
  };

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/locations`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();

        // ✅ Mapea id a locationId correctamente
        const sucursalesConId: Sucursal[] = data.map((s: any) => ({
          locationId: s.id,
          nombre: s.nombre,
        }));

        setSucursales(sucursalesConId);

        if (sucursalesConId.length > 0) {
          await consultarProductos();
        }

        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
        setError("No se pudieron cargar las sucursales");
      } finally {
        setLoading((prev) => ({ ...prev, sucursales: false }));
        setIsInitialLoading(false);
      }
    };

    fetchSucursales();
  }, []);

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {isInitialLoading && (
        <div className="loading-overlay">
          <img src="/logo.png" alt="Logo" className="loading-logo" />
          <div className="spinner" />
          <p className="loading-text">Cargando la aplicación...</p>
        </div>
      )}

      <div className="admin-container">
        <div className="admin-header-4">
          <div className="admin-logo-box">
            <img src="/logo.png" alt="Logo" className="admin-logo" />
          </div>

          <div className="admin-header-right">
            <div className="admin-filters-box">
              <div className="filter-group">
                <label>Sucursal:</label>
                <select
                  name="sucursal"
                  value={sucursalSeleccionada}
                  onChange={(e) => {
                    setSucursalSeleccionada(e.target.value);
                    consultarProductos();
                  }}
                  disabled={loading.sucursales}
                >
                  <option value="todas">Todas</option>
                  {sucursales.map((suc, index) => (
                    <option
                      key={suc.locationId || index}
                      value={suc.locationId}
                    >
                      {suc.nombre || `Sucursal ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Producto:</label>
                <input
                  type="text"
                  name="nombreProducto"
                  placeholder="Buscar producto por nombre..."
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                  autoComplete="off"
                  ref={inputRef}
                />
              </div>
            </div>

            <div className="admin-actions-box">
              <button
                className="btn-action"
                onClick={() => handleRedirect("/reg-employee")}
              >
                Registrar empleado
              </button>
              <button
                className="btn-action"
                onClick={() => handleRedirect("/dashboard/reg-productos")}
              >
                Registrar Productos
              </button>
              <button
                className="btn-action"
                onClick={() => handleRedirect("/dashboard/reg-provider")}
              >
                Registrar Proveedor
              </button>
            </div>

            <div className="admin-report-box">
              <button
                className="btn-report"
                onClick={() => handleRedirect("/dashboard/reports")}
              >
                Generar reportes
              </button>
              <button
                className="btn-genVenta"
                onClick={() => handleRedirect("/dashboard/cart")}
              >
                Generar Venta
              </button>
            </div>
          </div>
        </div>

        <div className="admin-table-container">
          {error && <div className="error-message">Error: {error}</div>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Producto</th>
                <th>Precio (KG)</th>
                <th>Stock</th>
                <th>Merma (kg)</th>
                <th>Stock Neto</th>
              </tr>
            </thead>
            <tbody>
              {productos
                .filter(
                  (p) =>
                    (sucursalSeleccionada === "todas" ||
                      p.locationId === sucursalSeleccionada) &&
                    p.nombre
                      .toLowerCase()
                      .includes(nombreProducto.toLowerCase())
                )
                .map((p) => {
                  const sucursalNombre =
                    sucursales.find((s) => s.locationId === p.locationId)
                      ?.nombre || "-";

                  const precio = Number(p.precio_por_kg) || 0;
                  const stock = Number(p.stock_actual) || 0;
                  const mermaKg = stock * 0.2;
                  const stockNeto = stock - mermaKg;

                  return (
                    <tr key={p.id}>
                      <td>{sucursalNombre}</td>
                      <td>{p.nombre}</td>
                      <td>${precio.toFixed(2)}</td>
                      <td>{stock}</td>
                      <td>{mermaKg.toFixed(2)} kg</td>
                      <td>{stockNeto.toFixed(2)} kg</td>
                    </tr>
                  );
                })}

              {productos.length === 0 && !loading.productos && (
                <tr>
                  <td colSpan={6} className="no-data">
                    No hay productos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="admin-total">
            <span>Total Merma:</span> {totalMerma.toFixed(2)} kg
          </div>
        </div>
      </div>
    </>
  );
};

export default PrincipalAdmin;
