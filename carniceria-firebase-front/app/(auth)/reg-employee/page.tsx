"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/helpers/authHeaders";
import "./reg-usu.css";

const initialState = {
  nombre: "",
  apellido: "",
  telefono: "",
  direccion: "",
  nombre_usuario: "",
  email: "", // ✅ corregido (antes era "correo")
  contrasena: "",
  rol: "EMPLOYEE", // frontend usa mayúsculas, luego se mapea
  locationId: "",
};

const RegUsua = () => {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [sucursales, setSucursales] = useState<
    { locationId: string; nombre: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/locations`, { headers });
        if (!res.ok) throw new Error("No se pudo cargar sucursales");
        const data = await res.json();

        const mapped = data.map((s: any) => ({
          locationId: s.id,
          nombre: s.nombre,
        }));

        setSucursales(mapped);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
        setError("Error al cargar sucursales.");
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "nombre_usuario") {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setUsernameError(null);

    try {
      const headers = await authHeaders();

      const payload = {
        ...form,
        rol: form.rol === "ADMIN" ? "Admin" : "Employee", // ✅ correcto formato
      };

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.code === "23505") {
          setUsernameError(
            "Este nombre de usuario ya está en uso. Por favor elija otro."
          );
        } else {
          const msg = data?.message || "Error desconocido";
          setError(typeof msg === "string" ? msg : msg.join("\n"));
        }
        return;
      }

      alert("✅ Empleado registrado correctamente");
      setForm(initialState);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError("Error de red al intentar registrar el empleado.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>

      <div className="form-grid">
        {[
          { label: "Nombre", name: "nombre" },
          { label: "Apellido", name: "apellido" },
          { label: "Teléfono", name: "telefono", type: "tel" },
          { label: "Dirección", name: "direccion" },
          { label: "Nombre de usuario", name: "nombre_usuario" },
          { label: "Correo", name: "email", type: "email" }, // ✅ email correcto
          { label: "Contraseña", name: "contrasena", type: "password" },
        ].map(({ label, name, type = "text" }) => (
          <div className="form-group" key={name}>
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={(form as any)[name]}
              onChange={handleChange}
              required
              className={
                name === "nombre_usuario" && usernameError ? "input-error" : ""
              }
            />
            {name === "nombre_usuario" && usernameError && (
              <div className="error-message">{usernameError}</div>
            )}
          </div>
        ))}

        <div className="form-group">
          <label>Rol:</label>
          <select name="rol" value={form.rol} onChange={handleChange} required>
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sucursal:</label>
          <select
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una sucursal</option>
            {sucursales.map((s) => (
              <option key={s.locationId} value={s.locationId}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

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
