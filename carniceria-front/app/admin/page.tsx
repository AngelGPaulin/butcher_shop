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
  productId: string;
  nombre: string;
  precio_por_kg: number;
  stock_actual: number;
  locationId: string;
  sucursal?: { nombre: string };
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
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Producto>>({});
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

        const data: Sucursal[] = await res.json();
        setSucursales(data);

        if (data.length > 0) {
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

  const handleModificar = (producto: Producto) => {
    setEditingProduct(producto);
    setEditedValues({
      nombre: producto.nombre,
      precio_por_kg: producto.precio_por_kg,
      stock_actual: producto.stock_actual,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditedValues({});
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/products/${editingProduct.productId}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedValues),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      consultarProductos();
      setEditingProduct(null);
      setEditedValues({});
    } catch (err: any) {
      alert("Error al modificar producto: " + err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Producto) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleEliminar = async (productId: string, nombre: string) => {
    if (!confirm(`¿Eliminar producto ${nombre}? Esta acción no se puede deshacer.`))
      return;

    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      consultarProductos();
    } catch (err: any) {
      alert("Error al eliminar producto: " + err.message);
    }
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
                  {sucursales.map((suc) => (
                    <option key={suc.locationId} value={suc.locationId}>
                      {suc.nombre}
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
                onClick={() => handleRedirect("/reg-employee")}>
                Registrar empleado
              </button>

              <button
                className="btn-action"
                onClick={() => handleRedirect("/dashboard/reg-productos")}>
                Registrar Productos
              </button>

              <button
                className="btn-action"
                onClick={() => handleRedirect("/dashboard/reg-provider")}>
                Registrar Provedor
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
                onClick={() => handleRedirect("/dashboard")}
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos
                .filter(
                  (producto) =>
                    (sucursalSeleccionada === "todas" ||
                      producto.locationId === sucursalSeleccionada) &&
                    producto.nombre
                      .toLowerCase()
                      .includes(nombreProducto.toLowerCase())
                )
                .map((producto) => {
                  const sucursalNombre =
                    producto.sucursal?.nombre ||
                    sucursales.find((s) => s.locationId === producto.locationId)
                      ?.nombre ||
                    producto.locationId ||
                    "-";

                  const isEditing = editingProduct?.productId === producto.productId;
                  const nombre = producto.nombre || "-";
                  const precio = Number(producto.precio_por_kg) || 0;
                  const stock = Number(producto.stock_actual) || 0;
                  const mermaKg = stock * 0.2;
                  const stockNeto = stock - mermaKg;

                  return (
                    <tr key={producto.productId}>
                      <td>{sucursalNombre}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedValues.nombre || ""}
                            onChange={(e) => handleInputChange(e, "nombre")}
                            className="edit-input"
                          />
                        ) : (
                          nombre
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editedValues.precio_por_kg || ""}
                            onChange={(e) => handleInputChange(e, "precio_por_kg")}
                            className="edit-input"
                          />
                        ) : (
                          `$${precio.toFixed(2)}`
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editedValues.stock_actual || ""}
                            onChange={(e) => handleInputChange(e, "stock_actual")}
                            className="edit-input"
                          />
                        ) : (
                          stock
                        )}
                      </td>
                      <td>{mermaKg.toFixed(2)} kg</td>
                      <td>{stockNeto.toFixed(2)} kg</td>
                      <td style={{ textAlign: "center" }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="btn-accion-guardar"
                              style={{ display: "inline-block" }}
                            >
                              <img src="/guardar.png" alt="Guardar" width="30" style={{ display: "block" }} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-accion-cancelar"
                              style={{ display: "inline-block", marginLeft: "30px" }}
                            >
                              <img src="/cancelar.png" alt="Cancelar" width="30" style={{ display: "block" }} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleModificar(producto)}
                              className="btn-accion-modificar"
                              style={{ display: "inline-block" }}
                            >
                              <img src="/modificar.png" alt="Modificar" width="30" style={{ display: "block" }} />
                            </button>
                            <button
                              onClick={() => handleEliminar(producto.productId, nombre)}
                              className="btn-accion-eliminar"
                              style={{ display: "inline-block", marginLeft: "30px" }}
                            >
                              <img src="/eliminar.png" alt="Eliminar" width="30" style={{ display: "block" }} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {productos.length === 0 && !loading.productos && (
                <tr>
                  <td colSpan={7} className="no-data">
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
      <div className="form-actions-cerrar">
        <button type="button" className="btn-cerrar-sesion" onClick={() => handleRedirect("/login")}>
        Cerrar sesión
      </button>
    </div>
      </div>
    </>
  );
};

export default PrincipalAdmin;