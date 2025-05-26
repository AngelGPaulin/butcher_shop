"use client";

import Link from 'next/link';
import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authHeaders } from "@/helpers/authHeaders";
import './prin-employee.css';

const PrincipalEmployee = () => {
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtros, setFiltros] = useState({
    sucursal: "todas",
    tipoCarne: "todas"
  });
  const [loading, setLoading] = useState({
    sucursales: true,
    productos: false
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
        setLoading(prev => ({ ...prev, sucursales: false }));
      }
    };

    fetchSucursales();
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Consultar productos con filtros
  const consultarProductos = async () => {
    setLoading(prev => ({ ...prev, productos: true }));
    setError(null);
    setTotalMerma(0);
    
    try {
      const headers = await authHeaders();
      let url = `${API_URL}/products`;
      const params = new URLSearchParams();

      if (filtros.sucursal !== "todas") {
        params.append('locationId', filtros.sucursal);
      }
      
      if (filtros.tipoCarne !== "todas") {
        params.append('type', filtros.tipoCarne);
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
          const merma = producto.merma || producto.waste || '0';
          
          // Extraer números incluyendo decimales
          const numericValue = parseFloat(merma.toString().replace(/[^0-9.]/g, ''));
          
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
      setLoading(prev => ({ ...prev, productos: false }));
    }
  };

  // Formatear merma para mostrar
  const formatMerma = (merma) => {
    if (typeof merma === 'number') return `${merma}%`;
    if (typeof merma === 'string' && merma.includes('%')) return merma;
    return `${merma || '0'}%`;
  };

  // Redirección a otras páginas
  const handleRedirect = (path) => {
    router.push(path);
  };

  return (
    <div className="employee-container">
      <div className="employee-header-4">
        <div className="employee-logo-box">
          <img src="/logo.png" alt="Logo" className="employee-logo" />
        </div>
        
        <div className="employee-header-right">
          {/* Sección de Filtros */}
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
                  <option key={suc.locationId} value={suc.locationId}>
                    {suc.nombre}
                  </option>
                ))}
              </select>
              {loading.sucursales && <span className="loading-text">Cargando sucursales...</span>}
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

          {/* Sección de Reportes */}
          <div className="employee-report-box">
              <button 
                className="btn-regVenta"
                onClick={() => handleRedirect("/reg-venta")}>
                Registrar venta
              </button>
            </div>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="employee-table-container">
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
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
                  const nombre = producto.nombre || producto.productName || '-';
                  const precio = producto.precioPorKg || producto.pricePerKg || 0;
                  const unidad = producto.unidadMedida || producto.unit || 'KG';
                  const stock = producto.stockActual || producto.currentStock || 0;
                  const merma = formatMerma(producto.merma || producto.waste);

                  return (
                    <tr key={producto.id || producto._id}>
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
                  <td colSpan="6" className="no-data">
                    {loading.productos ? 'Buscando productos...' : 'No hay productos para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
        </table>
        
        <div className="employee-total">
          <span>Total merma:</span>
          <input 
            type="text" 
            readOnly 
            value={`${totalMerma.toFixed(2)}%`} 
          />
        </div>
      </div>
    </div>
  );
};

export default PrincipalEmployee;