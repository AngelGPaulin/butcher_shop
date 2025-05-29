"use client";

import React, { useState, useEffect } from 'react';
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import './reg-product.css';
import Link from 'next/link';

const initialState = {
  tipoEntidad: 'producto', // NUEVO: puede ser 'producto' o 'proveedor'
  
  // Campos de producto
  nombre: '',
  precio_por_kg: '',
  unidad_medida: 'kg',
  stock_actual: '',
  stock_minimo: '0',
  disponible: true,
  proveedor: '',
  locationId: '',
  cantidad: '',
  tipo: 'existente', // producto existente o nuevo
  
  // Campos de proveedor
  providerId: '',
  providerNombre: '',
  contacto: '',
  direccion: '',
  telefono: ''
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


  // useState para la lista de proveedores
  const [providers, setProviders] = useState<{ providerId: string; nombre: string }[]>([]); // NUEVO
  useEffect(() => {
    const fetchInitialData = async () => {
    try {
      const headers = await authHeaders();

      const [locationsRes, productsRes, providersRes] = await Promise.all([
        fetch(`${API_URL}/locations`, { headers }),
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/providers`, { headers }), // NUEVO
      ]);

      if (!locationsRes.ok) throw new Error('No se pudo cargar sucursales');
      if (!productsRes.ok) throw new Error('No se pudo cargar productos');
      if (!providersRes.ok) throw new Error('No se pudo cargar proveedores'); // NUEVO

      setSucursales(await locationsRes.json());
      setExistingProducts(await productsRes.json());
      setProviders(await providersRes.json()); // NUEVO

    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  fetchInitialData();
}, []); // hasta aqui termina el nuevo useEffect


  useEffect(() => {
    if (form.nombre && form.tipo === 'existente' && form.tipoEntidad === 'producto') {
      const exists = existingProducts.some(
        p => p.nombre.toLowerCase() === form.nombre.toLowerCase()
      );
      setProductExists(exists);

      if (exists && form.locationId) {
        fetchStock(form.nombre, form.locationId);
      }
    }
  }, [form.nombre, form.locationId, form.tipo, existingProducts, form.tipoEntidad]);

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

    try {
      const headers = await authHeaders();

      if (form.tipoEntidad === 'producto') {
        // Validación producto
        if (form.nombre.length > 100) {
          setError('El nombre no puede exceder los 100 caracteres');
          return;
        }

        let endpoint = `${API_URL}/products`;
        let method = 'POST';

        const bodyData = {
          nombre: form.nombre,
          precio_por_kg: Number(form.precio_por_kg),
          unidad_medida: form.unidad_medida,
          stock_actual: Number(form.stock_actual),
          stock_minimo: Number(form.stock_minimo),
          disponible: form.disponible,
          providerId: form.providerId, // Puede ser null si no se selecciona proveedor
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
      } else {
        // Validación y envío proveedor
        if (!form.providerNombre.trim()) {
          setError('El nombre del proveedor es obligatorio');
          return;
        }
        // Aquí puedes hacer validaciones adicionales para contacto, dirección y teléfono

        const providerData = {
          nombre: form.providerNombre,
          contacto: form.contacto,
          direccion: form.direccion,
          telefono: form.telefono
        };

        const res = await fetch(`${API_URL}/providers`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(providerData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al registrar proveedor');
        }

        alert('Proveedor registrado exitosamente');
      }

      setForm(initialState);
      setRealStock('');
      setError(null);

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
        {/* Selector entre Producto o Proveedor */}
        <div className="form-group radio-group">
          <label>
            <input
              type="radio"
              name="tipoEntidad"
              value="producto"
              checked={form.tipoEntidad === 'producto'}
              onChange={handleChange}
            />
            Productos
          </label>
          <label>
            <input
              type="radio"
              name="tipoEntidad"
              value="proveedor"
              checked={form.tipoEntidad === 'proveedor'}
              onChange={handleChange}
            />
            Proveedor
          </label>
        </div>

        {/* Campos para Producto */}
        {form.tipoEntidad === 'producto' && (
          <>
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
              <label htmlFor="nombre">Producto</label>
              {form.tipo === 'existente' ? (
                  <select
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un producto...</option>
                    {existingProducts.length > 0 &&
                      existingProducts.map((prod, index) => (
                    <option key={prod.id ?? index} value={prod.nombre}>
                      {prod.nombre}
                    </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                )}

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

          {form.tipo === 'nuevo' && (<>
              <div className="form-group">
                <label htmlFor="precio_por_kg">Precio por unidad:</label>
                <input
                  type="number"
                  id="precio_por_kg"
                  name="precio_por_kg"
                  value={form.precio_por_kg}
                  onChange={handleChange}
                  min={0}
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
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="unidad">unidad</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stock_actual">Stock inicial:</label>
                <input
                  type="number"
                  id="stock_actual"
                  name="stock_actual"
                  value={form.stock_actual}
                  onChange={handleChange}
                  min={0}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_minimo">Stock mínimo:</label>
                <input
                  type="number"
                  id="stock_minimo"
                  name="stock_minimo"
                  value={form.stock_minimo}
                  onChange={handleChange}
                  min={0}
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
                  ¿Disponible para la venta?
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="providerId">Proveedor:</label>
                <select
                  id="providerId"
                  name="providerId"
                  value={form.providerId}
                  onChange={handleChange}
                  required
                >
              
              <option value="">Selecciona un proveedor</option>
              {providers.map(provider => (
                <option key={provider.providerId} value={provider.providerId}>
                  {provider.nombre}
                </option>
              ))}
            </select>        
              </div>
            </>
          )}

            <div className="form-group">
              <label htmlFor="locationId">Sucursal:</label>
              <select
                id="locationId"
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                required
              >
              <option value="">Selecciona una sucursal</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.locationId} value={sucursal.locationId}>
                {sucursal.nombre}
                </option>
              ))}
              </select>
            </div>

            {form.tipo === 'existente' && (
              <>
                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad a agregar:</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    min={0}
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
                  <option value="kg">Kg</option>
                  <option value="g">gm</option>
                  <option value="unidad">Piezas</option>
                  <option value="unidad">Cajas</option>
                </select>
              </div>
                <div className="form-group">
                  <label>Stock actual en sucursal:</label>
                  <input type="text" value={realStock} readOnly />
                </div>
              </>
            )}

            
          </>
        )}

        {/* Campos para Proveedor */}
        {form.tipoEntidad === 'proveedor' && (
          <>
            <div className="form-group">
              <label htmlFor="providerNombre">Nombre del proveedor:</label>
              <input
                type="text"
                id="providerNombre"
                name="providerNombre"
                value={form.providerNombre}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contacto">Contacto:</label>
              <input
                type="text"
                id="contacto"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección:</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>


            
            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                pattern="\d{10}" 
                //maxLength="10" 
                required 
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit" className='btn-submit'>
              {form.tipoEntidad === 'proveedor'
                ? 'Registrar Proveedor'
                : form.tipo === 'existente'
                  ? 'Actualizar Stock'
                  : 'Registrar Producto'}
            </button>
            <Link href="/admin" passHref>
            <button type="button" className="btn-cancel" onClick={handleCancel}>Cancelar</button>
              </Link>
          </div>
      </form>
    </div>
  );
};

export default ProductForm;




/*

<label htmlFor="nombre">Producto</label>
{form.tipo === 'existente' ? (
  <>
    <input
      type="text"
      id="nombre"
      name="nombre"
      value={form.nombre}
      onChange={handleChange}
      autoComplete="off"
      required
      placeholder="Buscar producto..."
    />
    {form.nombre && (
      <ul className="bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto rounded shadow">
        {existingProducts
          .filter((prod) =>
            prod.nombre.toLowerCase().includes(form.nombre.toLowerCase())
          )
          .map((prod) => (
            <li
              key={prod.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleChange({
                  target: { name: 'nombre', value: prod.nombre }
                });
              }}
            >
              {prod.nombre}
            </li>
          ))}
      </ul>
    )}
  </>
) : (
  <input
    type="text"
    id="nombre"
    name="nombre"
    value={form.nombre}
    onChange={handleChange}
    maxLength={100}
    required
  />
)}


*/