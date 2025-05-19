"use client";

import Link from 'next/link';
import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import './prin-admin.css';

const PrincipalAdmin = () => {
// const [productos, setProductos] = useState([]);

// useEffect(() => {
//   fetch("http://localhost:3001/products")
//     .then(res => res.json())
//     .then(data => setProductos(data))
//     .catch(err => console.error("Error al obtener productos:", err));
// }, []);

  return (
    <div className="admin-container">
      <div className="admin-header-4">
        <div className="admin-logo-box">
          <img src="/logo.png" alt="Logo" className="admin-logo" />
        </div>
        <div className="admin-header-right">
          <div className="admin-filters-box">
            <div className="filter-group">
              <label>Sucursal:</label>
              <select>
                <option value="todas">Todas</option>
                <option value="suc1">Sucursal 1</option>
                <option value="suc2">Sucursal 2</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Carnes rojas:</label>
              <select>
                <option value="todas">Todas</option>
                <option value="res">Res</option>
                <option value="cerdo">Cerdo</option>
              </select>
            </div>
            <button className="btn-consultar">Consultar</button>
          </div>
          <div className="admin-actions-box">
            <Link href="/reg-employee">
              <button className="btn-action">Registrar empleado</button>
            </Link>
            <Link href="/dashboard/reg-productos">
            <button className="btn-action">Registrar Productos</button>
            </Link>
          </div>
          <div className="admin-report-box">
            <button className="btn-report">Generar reportes</button>
          </div>
        </div>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sucursal</th>
              <th>Carnes rojas</th>
              <th>Precio por KG</th>
              <th>Unidad de medida</th>
              <th>Stock actual</th>
              <th>Merma</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-total">
          <span>Total:</span>
          <input type="text" readOnly />
        </div>
      </div>
    </div>
  );
};

export default PrincipalAdmin;