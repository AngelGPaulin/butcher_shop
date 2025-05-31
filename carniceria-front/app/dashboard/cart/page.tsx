'use client';

import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authHeaders } from "@/helpers/authHeaders";
import "./cart.css";

interface Product {
  productId: string;
  nombre: string;
  precio_por_kg: number;
  unidad_medida: string;
  stock_actual: number;
  locationId: string;
}

interface Location {
  locationId: string;
  nombre: string;
}

interface Employee {
  employeeId: string;
  nombre: string;
  apellido: string;
  locationId: string;
  nombre_usuario: string;
}

export default function CartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{
    productId: string;
    name: string;
    kg: number;
    price: number;
    unidad_medida: string;
  }>>([]);
  
  const [total, setTotal] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [loading, setLoading] = useState({
    locations: true,
    employees: true,
    products: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({...prev, locations: true, employees: true}));
        
        const [locRes, empRes] = await Promise.all([
          fetch(`${API_URL}/locations`, { credentials: "include" }),
          fetch(`${API_URL}/employees`, { 
            headers: await authHeaders(),
            credentials: "include"
          })
        ]);
        
        const locData = await locRes.json();
        const empData = await empRes.json();
        
        setLocations(Array.isArray(locData) ? locData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
        
        if (locData.length > 0) {
          setSelectedLocation(locData[0].locationId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(prev => ({...prev, locations: false, employees: false}));
      }
    };
    
    fetchInitialData();
    
    // Actualizar fecha y hora cada segundo
    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Cargar productos cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (selectedLocation) {
      const fetchProducts = async () => {
        try {
          setLoading(prev => ({...prev, products: true}));
          const res = await fetch(`${API_URL}/products?locationId=${selectedLocation}`, {
            credentials: "include"
          });
          const data = await res.json();
          setAvailableProducts(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(prev => ({...prev, products: false}));
        }
      };
      
      fetchProducts();
    }
  }, [selectedLocation]);

  // Filtrar productos según término de búsqueda
  const filteredProducts = availableProducts.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar empleados por sucursal seleccionada
  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter(emp => emp.locationId === selectedLocation)
    : [];

  // Agregar producto al carrito
  const addProductToCart = (product: Product) => {
    if (quantity <= 0) return;
    
    const price = product.precio_por_kg * quantity;
    const existingIndex = products.findIndex(p => p.productId === product.productId);
    
    if (existingIndex >= 0) {
      // Actualizar producto existente
      const updatedProducts = [...products];
      updatedProducts[existingIndex].kg += quantity;
      updatedProducts[existingIndex].price += price;
      setProducts(updatedProducts);
    } else {
      // Agregar nuevo producto
      const newProduct = {
        productId: product.productId,
        name: product.nombre,
        kg: quantity,
        price: price,
        unidad_medida: product.unidad_medida
      };
      setProducts([...products, newProduct]);
    }
    
    setTotal(total + price);
    setQuantity(1);
    setSearchTerm("");
  };

  // Actualizar cantidad de producto en el carrito
  const updateProductQuantity = (index: number, newKg: number) => {
    if (newKg <= 0) return;
    
    const updatedProducts = [...products];
    const oldPrice = updatedProducts[index].price;
    updatedProducts[index].kg = newKg;
    updatedProducts[index].price = (newKg * oldPrice) / updatedProducts[index].kg;
    setProducts(updatedProducts);
    
    // Recalcular total
    const newTotal = updatedProducts.reduce((sum, p) => sum + p.price, 0);
    setTotal(newTotal);
  };

  // Eliminar producto del carrito
  const removeProduct = (index: number) => {
    const removedPrice = products[index].price;
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
    setTotal(total - removedPrice);
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
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="info-group">
            <label>Vendedor:</label>
            {loading.employees ? (
              <div className="loading-text">Cargando vendedores...</div>
            ) : (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={!selectedLocation || filteredEmployees.length === 0}
              >
                <option value="">Seleccione vendedor</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {`${emp.nombre} ${emp.apellido} (${emp.nombre_usuario})`}
                  </option>
                ))}
              </select>
            )}
            {selectedLocation && filteredEmployees.length === 0 && !loading.employees && (
              <div className="warning-message">No hay empleados en esta sucursal</div>
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
          />
          
          {searchTerm && filteredProducts.length > 0 && (
            <div className="search-results">
              {filteredProducts.map(product => (
                <div 
                  key={product.productId}
                  className="result-item"
                  onClick={() => addProductToCart(product)}
                >
                  {product.nombre} - ${product.precio_por_kg}/{product.unidad_medida}
                  {product.stock_actual > 0 ? (
                    <span className="stock-available"> (Stock: {product.stock_actual} {product.unidad_medida})</span>
                  ) : (
                    <span className="stock-out"> (Agotado)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quantity-group">
          <label>Cantidad:</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            disabled={loading.products}
          />
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
              <tr key={`${product.productId}-${index}`}>
                <td>{product.name}</td>
                <td>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={product.kg}
                    onChange={(e) => updateProductQuantity(index, parseFloat(e.target.value) || 0)}
                  /> {product.unidad_medida}
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
            disabled={!selectedEmployee || products.length === 0}
          >
            Confirmar Venta
          </button>
          <button 
            className="btn-cancel"
            onClick={() => router.push("/admin")}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}