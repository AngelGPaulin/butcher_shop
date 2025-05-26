"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import './reg-product.css';
import Link from 'next/link';

const initialState = {
  nombre: '', // Cambiado de 'name'
  precio_por_kg: '', // Cambiado de 'pricePerKg'
  unidad_medida: 'kg', // Cambiado de 'unit'
  stock_actual: '', // Cambiado de 'stock'
  stock_minimo: '0', // Nuevo campo requerido
  disponible: true, // Nuevo campo requerido
  proveedor: '', // Cambiado de 'supplier'
  locationId: '', // Mantenido para selección de sucursal
  cantidad: '', // Cambiado de 'newQuantity'
  tipo: 'existente' // Cambiado de 'productType'
};

const ProductForm = () => {
  const [form, setForm] = useState(initialState);
  const [sucursales, setSucursales] = useState<{ locationId: string; nombre: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [realStock, setRealStock] = useState('');
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
  const [productExists, setProductExists] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const headers = await authHeaders();
        
        const locationsRes = await fetch(`${API_URL}/locations`, { headers });
        if (!locationsRes.ok) throw new Error('No se pudo cargar sucursales');
        setSucursales(await locationsRes.json());
        
        const productsRes = await fetch(`${API_URL}/products`, { headers });
        if (!productsRes.ok) throw new Error('No se pudo cargar productos');
        setExistingProducts(await productsRes.json());
        
      } catch (err: any) {
        setError(err.message);
        console.error('Error al cargar datos iniciales:', err);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (form.nombre && form.tipo === 'existente') {
      const exists = existingProducts.some(
        p => p.nombre.toLowerCase() === form.nombre.toLowerCase()
      );
      setProductExists(exists);
      
      if (exists && form.locationId) {
        fetchStock(form.nombre, form.locationId);
      }
    }
  }, [form.nombre, form.locationId, form.tipo, existingProducts]);

  const fetchStock = async (productName: string, locationId: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_URL}/products/stock?nombre=${encodeURIComponent(productName)}&location=${encodeURIComponent(locationId)}`,
        { headers }
      );
      
      if (!res.ok) throw new Error('No se pudo obtener el stock');
      
      const data = await res.json();
      setRealStock(data.stock_actual?.toString() || '0');
    } catch (err: any) {
      setRealStock('0');
      console.error('Error al obtener stock:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación adicional
    if (form.nombre.length > 100) {
      setError('El nombre no puede exceder los 100 caracteres');
      return;
    }

    try {
      const headers = await authHeaders();
      let endpoint = `${API_URL}/products`;
      let method = 'POST';
      
      const bodyData = {
        nombre: form.nombre,
        precio_por_kg: Number(form.precio_por_kg),
        unidad_medida: form.unidad_medida,
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
        disponible: form.disponible,
        proveedor: form.proveedor,
        locationId: form.locationId
      };

      if (form.tipo === 'existente') {
        endpoint = `${API_URL}/products/stock`;
        method = 'PATCH';
        bodyData.stock_actual = Number(form.cantidad);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar producto');
      }

      alert('Producto registrado exitosamente');
      setForm(initialState);
      setRealStock('');
      
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
    setRealStock('');
    setError(null);
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group radio-group">
          <label>
            <input
              type="radio"
              name="tipo"
              value="existente"
              checked={form.tipo === 'existente'}
              onChange={handleChange}
            />
            Producto Existente
          </label>
          <label>
            <input
              type="radio"
              name="tipo"
              value="nuevo"
              checked={form.tipo === 'nuevo'}
              onChange={handleChange}
            />
            Nuevo Producto
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre del producto (max 100 caracteres):</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            maxLength={100}
            required
          />
          {form.tipo === 'existente' && form.nombre && (
            <div className="product-exists-message">
              {productExists ? (
                <span className="exists">✔ Este producto existe</span>
              ) : (
                <span className="not-exists">✘ Producto no encontrado</span>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="locationId">Sucursal:</label>
          <select
            id="locationId"
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {sucursales.map((suc) => (
              <option key={suc.locationId} value={suc.locationId}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>

        {form.tipo === 'existente' && (
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad a agregar:</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              min="0"
              step="0.01"
              required={form.tipo === 'existente'}
            />
          </div>
        )}

        {form.tipo === 'existente' && (
          <div className="form-group">
            <label htmlFor="stock_actual">Stock Actual:</label>
            <input
              type="number"
              id="stock_actual"
              name="stock_actual"
              value={realStock}
              readOnly
            />
          </div>
        )}

        {form.tipo === 'nuevo' && (
          <>
            <div className="form-group">
              <label htmlFor="precio_por_kg">Precio por KG:</label>
              <input
                type="number"
                id="precio_por_kg"
                name="precio_por_kg"
                value={form.precio_por_kg}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unidad_medida">Unidad de medida:</label>
              <select
                id="unidad_medida"
                name="unidad_medida"
                value={form.unidad_medida}
                onChange={handleChange}
                required
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="lb">Libras (lb)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stock_actual">Stock Inicial:</label>
              <input
                type="number"
                id="stock_actual"
                name="stock_actual"
                value={form.stock_actual}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock_minimo">Stock Mínimo:</label>
              <input
                type="number"
                id="stock_minimo"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="disponible"
                  checked={form.disponible}
                  onChange={handleCheckboxChange}
                />
                Disponible
              </label>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="proveedor">Proveedor:</label>
          <input
            type="text"
            id="proveedor"
            name="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {form.tipo === 'existente' ? 'Actualizar Stock' : 'Registrar Producto'}
          </button>
          <Link href="/admin" passHref>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </Link>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ProductForm;






{/*
  
"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import './reg-product.css';
import Link from 'next/link';

const initialState = {
  name: '',
  pricePerKg: '',
  unit: 'kg',
  stock: '',
  supplier: '',
  locationId: '',
  newQuantity: '',
  productType: 'existing'
};

const ProductForm = () => {
  const [form, setForm] = useState(initialState);
  const [sucursales, setSucursales] = useState<{ locationId: string; nombre: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [realStock, setRealStock] = useState('');
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
  const [productExists, setProductExists] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const headers = await authHeaders();
        
        const locationsRes = await fetch(`${API_URL}/locations`, { headers });
        if (!locationsRes.ok) throw new Error('No se pudo cargar sucursales');
        setSucursales(await locationsRes.json());
        
        const productsRes = await fetch(`${API_URL}/products`, { headers });
        if (!productsRes.ok) throw new Error('No se pudo cargar productos');
        setExistingProducts(await productsRes.json());
        
      } catch (err: any) {
        setError(err.message);
        console.error('Error al cargar datos iniciales:', err);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (form.name && form.productType === 'existing') {
      const exists = existingProducts.some(
        p => p.nombre.toLowerCase() === form.name.toLowerCase()
      );
      setProductExists(exists);
      
      if (exists && form.locationId) {
        fetchStock(form.name, form.locationId);
      }
    }
  }, [form.name, form.locationId, form.productType, existingProducts]);

  const fetchStock = async (productName: string, locationId: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_URL}/products/stock?name=${encodeURIComponent(productName)}&location=${encodeURIComponent(locationId)}`,
        { headers }
      );
      
      if (!res.ok) throw new Error('No se pudo obtener el stock');
      
      const data = await res.json();
      setRealStock(data.stock?.toString() || '0');
    } catch (err: any) {
      setRealStock('0');
      console.error('Error al obtener stock:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const headers = await authHeaders();
      let endpoint = `${API_URL}/products`;
      let method = 'POST';
      let body = JSON.stringify(form);

      if (form.productType === 'existing') {
        endpoint = `${API_URL}/products/stock`;
        method = 'PATCH';
        body = JSON.stringify({
          productName: form.name,
          locationId: form.locationId,
          quantity: form.newQuantity
        });
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar producto');
      }

      alert('Producto registrado exitosamente');
      setForm(initialState);
      setRealStock('');
      
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
    setRealStock('');
    setError(null);
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group radio-group">
          <label>
            <input
              type="radio"
              name="productType"
              value="existing"
              checked={form.productType === 'existing'}
              onChange={handleChange}
            />
            Producto Existente
          </label>
          <label>
            <input
              type="radio"
              name="productType"
              value="new"
              checked={form.productType === 'new'}
              onChange={handleChange}
            />
            Nuevo Producto
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="name">Nombre del producto:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {form.productType === 'existing' && form.name && (
            <div className="product-exists-message">
              {productExists ? (
                <span className="exists">✔ Este producto existe</span>
              ) : (
                <span className="not-exists">✘ Producto no encontrado</span>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="locationId">Sucursal:</label>
          <select
            id="locationId"
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {sucursales.map((suc) => (
              <option key={suc.locationId} value={suc.locationId}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>

        {form.productType === 'existing' && (
          <div className="form-group">
            <label htmlFor="newQuantity">Cantidad a agregar:</label>
            <input
              type="number"
              id="newQuantity"
              name="newQuantity"
              value={form.newQuantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required={form.productType === 'existing'}
            />
          </div>
        )}

        {form.productType === 'existing' && (
          <div className="form-group">
            <label htmlFor="stock">Stock Actual:</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={realStock}
              readOnly
            />
          </div>
        )}

        {form.productType === 'new' && (
          <>
            <div className="form-group">
              <label htmlFor="pricePerKg">Precio por KG:</label>
              <input
                type="number"
                id="pricePerKg"
                name="pricePerKg"
                value={form.pricePerKg}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unidad de medida:</label>
              <select
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="lb">Libras (lb)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Inicial:</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="supplier">Proveedor:</label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {form.productType === 'existing' ? 'Actualizar Stock' : 'Registrar Producto'}
          </button>
          <Link href="/admin" passHref>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </Link>
        </div>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ProductForm;

  */}