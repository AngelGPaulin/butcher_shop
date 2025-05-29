"use client";

import Link from "next/link";
import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authHeaders } from "@/helpers/authHeaders";
import "./prin-admin.css";

const PrincipalAdmin = () => {
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtros, setFiltros] = useState({
    sucursal: "todas",
    tipoCarne: "todas",
  });
  const [loading, setLoading] = useState({
    sucursales: true,
    productos: false,
  });
  const [error, setError] = useState(null);
  const [totalMerma, setTotalMerma] = useState(0);
  const router = useRouter();

  // Obtener sucursales al cargar el componente
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/locations`, { headers });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setSucursales(data);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
        setError("No se pudieron cargar las sucursales");
      } finally {
        setLoading((prev) => ({ ...prev, sucursales: false }));
      }
    };

    fetchSucursales();
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Consultar productos con filtros
  const consultarProductos = async () => {
    setLoading((prev) => ({ ...prev, productos: true }));
    setError(null);
    setTotalMerma(0);

    try {
      const headers = await authHeaders();
      let url = `${API_URL}/products`;
      const params = new URLSearchParams();

      if (filtros.sucursal !== "todas") {
        params.append("locationId", filtros.sucursal);
      }

      if (filtros.tipoCarne !== "todas") {
        params.append("type", filtros.tipoCarne);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      setProductos(data);

      // Calcular total de merma
      if (data && data.length > 0) {
        const sumaMerma = data.reduce((total, producto) => {
          let mermaValue = 0;
          const merma = producto.merma || producto.waste || "0";

          // Extraer números incluyendo decimales
          const numericValue = parseFloat(
            merma.toString().replace(/[^0-9.]/g, "")
          );

          if (!isNaN(numericValue)) {
            mermaValue = numericValue;
          }

          return total + mermaValue;
        }, 0);

        setTotalMerma(sumaMerma);
      }
    } catch (err) {
      console.error("Error al consultar productos:", err);
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, productos: false }));
    }
  };

  // Formatear merma para mostrar
  const formatMerma = (merma) => {
    if (typeof merma === "number") return `${merma}%`;
    if (typeof merma === "string" && merma.includes("%")) return merma;
    return `${merma || "0"}%`;
  };

  // Redirección a otras páginas
  const handleRedirect = (path) => {
    router.push(path);
  };

  // Acciones para editar y eliminar producto
  const handleEditar = (productId) => {
    router.push(`/dashboard/editar-producto/${productId}`);
  };

  const handleEliminar = async (productId, nombre) => {
    if (!confirm(`¿Eliminar producto ${nombre}? Esta acción no se puede deshacer.`)) return;

    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      // Refrescar productos después de eliminar
      consultarProductos();
    } catch (err) {
      alert("Error al eliminar producto: " + err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header-4">
        <div className="admin-logo-box">
          <img src="/logo.png" alt="Logo" className="admin-logo" />
        </div>

        <div className="admin-header-right">
          {/* Sección de Filtros */}
          <div className="admin-filters-box">
            <div className="filter-group">
              <label>Sucursal:</label>
              <select
                name="sucursal"
                value={filtros.sucursal}
                onChange={handleFilterChange}
                disabled={loading.sucursales}
              >
                <option value="todas">Todas</option>
                {sucursales.map((suc) => (
                  <option key={suc.locationId} value={suc.locationId}>
                    {suc.nombre}
                  </option>
                ))}
              </select>
              {loading.sucursales && (
                <span className="loading-text">Cargando sucursales...</span>
              )}
            </div>

            <div className="filter-group">
              <label>Tipo de carne:</label>
              <select
                name="tipoCarne"
                value={filtros.tipoCarne}
                onChange={handleFilterChange}
              >
                <option value="todas">Todas</option>
                <option value="res">Res</option>
                <option value="cerdo">Cerdo</option>
                <option value="pollo">Pollo</option>
                <option value="cordero">Cordero</option>
              </select>
            </div>

            <button
              className="btn-consultar"
              onClick={consultarProductos}
              disabled={loading.productos || loading.sucursales}
            >
              {loading.productos ? (
                <span className="loading-spinner"></span>
              ) : (
                "Consultar"
              )}
            </button>
          </div>

          {/* Sección de Acciones */}
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
          </div>

          {/* Sección de Reportes */}
          <div className="admin-report-box">
            <button
              className="btn-report"
              onClick={() => handleRedirect("/dashboard/reports")}
            >
              Generar reportes
            </button>

            <button
              className="btn-repVenta"
              onClick={() => handleRedirect("/dashboard/consulta-ventas")}>
              Consultar ventas
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="admin-table-container">
        {error && <div className="error-message">Error: {error}</div>}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Sucursal</th>
              <th>Producto</th>
              <th>Precio (KG)</th>
              <th>Stock</th>
              <th>Merma</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((producto) => {
                const sucursalNombre =
                  producto.sucursal?.nombre ||
                  sucursales.find((s) => s.locationId === producto.locationId)
                    ?.nombre ||
                  producto.locationId ||
                  "-";

                const nombre = producto.nombre || "-";
                const precio = producto.precio_por_kg || 0;
                const stock = producto.stock_actual || 0;
                const merma = formatMerma(producto.merma || producto.waste);

                return (
                  <tr key={producto.productId}>
                    <td>{sucursalNombre}</td>
                    <td>{nombre}</td>
                    <td>${precio.toFixed(2)}</td>
                    <td>{stock}</td>
                    <td>{merma}</td>
                    <td>
                      <button
                        onClick={() => handleEditar(producto.productId)}
                        className="btn-accion editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleEliminar(producto.productId, nombre)
                        }
                        className="btn-accion eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  {loading.productos
                    ? "Buscando productos..."
                    : "No hay productos para mostrar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total de Merma */}
        <div className="admin-total">
          <span>Total Merma:</span> {totalMerma.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default PrincipalAdmin;
