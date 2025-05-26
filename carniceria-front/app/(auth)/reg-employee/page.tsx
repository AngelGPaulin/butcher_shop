"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import "./reg-usu.css";
import Link from "next/link";

const initialState = {
  nombre: "",
  apellido: "",
  telefono: "",
  direccion: "",
  username: "",
  rol: "Empleado",
  password: "",
  nomSucursal: "",
};

const RegEmployee = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [sucursales, setSucursales] = useState<
    { locationId: string; nombre: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar sucursales al montar
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/locations`, { headers });

        if (!res.ok) throw new Error("No se pudo cargar sucursales");

        const data = await res.json();
        setSucursales(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error al cargar sucursales:", err);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const headers = await authHeaders();

      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
        nombre_usuario: form.username, // nombre del campo esperado por el backend
        contrasena: form.password, // nombre del campo esperado por el backend
        rol: form.rol,
        location: form.nomSucursal, // debe coincidir con la relación ManyToOne
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Usuario registrado correctamente");
        setForm(initialState);
      } else {
        const errorText = await res.text();
        alert("Error al registrar usuario: " + errorText);
      }
    } catch (err) {
      alert("Error de red al registrar usuario");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Nombre de usuario:</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Apellido:</label>
          <input
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol:</label>
          <select name="rol" value={form.rol} onChange={handleChange} required>
            <option value="Empleado">Empleado</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nomSucursal">Nombre de sucursal:</label>
          <select
            id="nomSucursal"
            name="nomSucursal"
            value={form.nomSucursal}
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
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? "Registrando..." : "Registrar"}
        </button>
        <Link href="/admin">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
        </Link>
      </div>
    </form>
  );
};

export default RegEmployee;
