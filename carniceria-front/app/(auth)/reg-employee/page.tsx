"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import "./reg-usu.css";
import { useRouter } from "next/navigation";

const initialState = {
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  direccion: "",
  nombre_usuario: "",
  contrasena: "",
  rol: "Employee",
  locationId: "",
};

const RegUsua = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [sucursales, setSucursales] = useState<
    { locationId: string; nombre: string }[]
  >([]);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/locations`, { headers });

        if (!res.ok) throw new Error("No se pudo cargar sucursales");

        const data = await res.json();
        setSucursales(data);
      } catch (err) {
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
    // Limpiar error de username cuando se modifica
    if (name === "nombre_usuario") {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setUsernameError(null);
    
    try {
      const headers = await authHeaders();

      // Asegúrate que estos nombres coincidan con los esperados por el backend
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
        correo: form.correo,
        nombre_usuario: form.nombre_usuario,
        contrasena: form.contrasena,
        rol: form.rol,
        locationId: form.locationId, // Cambiado de "location" a "locationId"
      };

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Cambiado de form a payload
      });

      const responseData = await res.json();

      if (res.ok) {
        alert("Usuario registrado correctamente");
        setForm(initialState);
        router.push("/admin");
      } else {
        // Manejo específico para error de username duplicado
        if (responseData.code === "23505") {
          setUsernameError("Este nombre de usuario ya está en uso. Por favor elija otro.");
        } else {
          alert(`Error al registrar usuario: ${responseData.message || "Error desconocido"}`);
        }
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de conexión al intentar registrar el usuario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
    router.push("/admin");
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>

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
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            required
            className={usernameError ? "input-error" : ""}
          />
          {usernameError && <div className="error-message">{usernameError}</div>}
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
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
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
          <label>Correo:</label>
          <input
            type="text"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="contrasena"
            value={form.contrasena}
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
          <label htmlFor="locationId">Nombre de sucursal:</label>
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
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? "Registrando..." : "Registrar"}
        </button>
        <button type="button" className="btn-cancel" onClick={handleCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default RegUsua;