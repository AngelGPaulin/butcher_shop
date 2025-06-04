"use client";

import Link from "next/link";
import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authHeaders } from "@/helpers/authHeaders";
import "./prin-employee.css";

type Sucursal = {
  id: string;
  nombre: string;
};

type Producto = {
  id: string;
  nombre?: string;
  productName?: string;
  precioPorKg?: number;
  pricePerKg?: number;
  unidadMedida?: string;
  unit?: string;
  stockActual?: number;
  currentStock?: number;
  merma?: string | number;
  waste?: string | number;
};

const PrincipalEmployee = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtros, setFiltros] = useState({
    sucursal: "todas",
    tipoCarne: "todas",
  });
  const [loading, setLoading] = useState({
    sucursales: true,
    productos: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [totalMerma, setTotalMerma] = useState<number>(0);
  const router = useRouter();

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      const data: Producto[] = await res.json();
      setProductos(data);

      const sumaMerma = data.reduce((total, producto) => {
        const rawMerma = producto.merma || producto.waste || "0";
        const numericValue = parseFloat(
          rawMerma.toString().replace(/[^0-9.]/g, "")
        );
        return total + (isNaN(numericValue) ? 0 : numericValue);
      }, 0);

      setTotalMerma(sumaMerma);
    } catch (err: any) {
      console.error("Error al consultar productos:", err);
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, productos: false }));
    }
  };

  const formatMerma = (merma: string | number | undefined) => {
    if (typeof merma === "number") return `${merma}%`;
    if (typeof merma === "string" && merma.includes("%")) return merma;
    return `${merma || "0"}%`;
  };

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  return (
    <div className="employee-container">
      <div className="employee-header-4">
        <div className="employee-logo-box">
          <img src="/logo.png" alt="Logo" className="employee-logo" />
        </div>

        <div className="employee-header-right">
          <div className="employee-filters-box">
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
                  <option key={suc.id} value={suc.id}>
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

          <div className="employee-report-box">
            <button
              className="btn-regVenta"
              onClick={() => handleRedirect("/reg-venta")}
            >
              Registrar venta
            </button>
          </div>
        </div>
      </div>

      <div className="employee-table-container">
        {error && <div className="error-message">Error: {error}</div>}

        <table className="employee-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio por KG</th>
              <th>Unidad</th>
              <th>Stock</th>
              <th>Merma</th>
            </tr>
          </thead>
          <tbody>
            {productos.length > 0 ? (
              productos.map((producto) => {
                const nombre = producto.nombre || producto.productName || "-";
                const precio = producto.precioPorKg || producto.pricePerKg || 0;
                const unidad = producto.unidadMedida || producto.unit || "KG";
                const stock =
                  producto.stockActual || producto.currentStock || 0;
                const merma = formatMerma(producto.merma || producto.waste);

                return (
                  <tr key={producto.id}>
                    <td>{nombre}</td>
                    <td>${precio.toFixed(2)}</td>
                    <td>{unidad}</td>
                    <td>{stock}</td>
                    <td>{merma}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
                  {loading.productos
                    ? "Buscando productos..."
                    : "No hay productos para mostrar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="employee-total">
          <span>Total merma:</span>
          <input type="text" readOnly value={`${totalMerma.toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
};

export default PrincipalEmployee;
