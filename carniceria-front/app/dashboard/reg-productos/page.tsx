"use client";

import React, { useState } from 'react';
import './reg-product.css'; // Archivo CSS para estilos
import Link from 'next/link';

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    pricePerKg: '',
    unit: '',
    stock: '',
    supplier: '',
    nomSucursal: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para registrar el producto
    console.log('Producto registrado:', product);
  };

  const handleCancel = () => {
    // Lógica para cancelar
    setProduct({
      name: '',
      pricePerKg: '',
      unit: '',
      stock: '',
      supplier: '',
      nomSucursal: ''
    });
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del producto:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pricePerKg">Precio por KG:</label>
          <input
            type="number"
            id="pricePerKg"
            name="pricePerKg"
            value={product.pricePerKg}
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
            value={product.unit}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="kg">Kilogramos (kg)</option>
            <option value="g">Gramos (g)</option>
            <option value="lb">Libras (lb)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock Actual:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="supplier">Proveedor</label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={product.supplier}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nomSucursal">Nombre de sucursal:</label>
          <select
            id="nomSucursal"
            name="nomSucursal"
            value={product.nomSucursal}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {/* debe consulta la base de datos para poder mostrar la lista */}
            <option value="sucursal1">Sucursal 1</option>
            <option value="sucursal2">Sucursal 2</option>
            <option value="sucursal3">Sucursal 3</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">Registrar</button>
          <Link href="/admin">
          <button type="button" className="btn-cancel" onClick={handleCancel}>Cancelar</button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;