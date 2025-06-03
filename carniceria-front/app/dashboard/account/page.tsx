"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/constants";
import { authHeaders } from "@/helpers/authHeaders";
import { useRouter } from "next/navigation";
import "./acc.css";


const initialConfig = {
  nombre: "",
  apellido: "",
  telefono: "",
  direccion: "",
  correo: "",
  nombre_usuario: "",
};

const ConfiguracionPerfil = () => {
  const router = useRouter();
  const [perfil, setPerfil] = useState(initialConfig);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modo, setModo] = useState<"cambiar-contra" | "cambiar-usuario" | null>(null);
  const [form, setForm] = useState({
    usuario_actual: "",
    nuevo_usuario: "",
    confirmar_usuario: "",
    contrasena_actual: "",
    nueva_contrasena: "",
    confirmar_contrasena: ""
  });

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setForm({
      usuario_actual: "",
      nuevo_usuario: "",
      confirmar_usuario: "",
      contrasena_actual: "",
      nueva_contrasena: "",
      confirmar_contrasena: ""
    });
    setErrorMsg("");
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/usuario/perfil`, { headers });
        if (!res.ok) throw new Error("Error al cargar perfil");
        const data = await res.json();
        setPerfil(data);
        setForm(prev => ({
          ...prev,
          usuario_actual: data.nombre_usuario || ""
        }));
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };
    cargarPerfil();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/usuario/actualizar-perfil`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(perfil),
      });

      if (res.ok) {
        setMensaje("Perfil actualizado con éxito");
      } else {
        const error = await res.json();
        setMensaje(`Error: ${error.message || "No se pudo actualizar"}`);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setMensaje("Error de red al guardar perfil");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarCredenciales = async () => {
    if (modo === "cambiar-usuario") {
      if (form.nuevo_usuario !== form.confirmar_usuario) {
        setErrorMsg("Los usuarios no coinciden");
        return;
      }
      // aplicar logica para cambiar el usuario
      
    } else if (modo === "cambiar-contra") {
      if (form.nueva_contrasena !== form.confirmar_contrasena) {
        setErrorMsg("Las contraseñas no coinciden");
        return;
      }
      // aplicar logica para cambiar la contraseña
    }
    
    resetForm();
    setModo(null);
    setErrorMsg("");
    setMensaje("Cambios guardados con éxito");
  };

  return ( 
    <form className="perfil-form" onSubmit={handleGuardar}>
      <div className="logo-container">
        <img src="/logo.png" alt="Carnicería Karlita" className="logo" />
        <h2>Configuración de Perfil</h2>
        <hr className="section-divider" />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Apellido:</label>
          <input
            type="text"
            name="apellido"
            value={perfil.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico:</label>
          <input
            type="email"
            name="correo"
            value={perfil.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={perfil.direccion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Usuario Actual:</label>
          <input
            type="text"
            name="nombre_usuario"
            value={perfil.nombre_usuario}
            onChange={handleChange}
            readOnly
          />
        </div>
      </div>

      <hr className="section-divider" />
      <div className="form-actions" style={{ justifyContent: "center", marginBottom: "20px" }}>
        <button
          className="btn-submit"
          type="button"
          onClick={() => {
            setModo(modo === "cambiar-contra" ? null : "cambiar-contra");
            resetForm();
          }}
          style={{
            justifyContent: "center", opacity: 0.9,
            backgroundColor: modo === "cambiar-contra" ? "#b71c1c" : "" // cambiamos al color del boton 
          }}
        >
          {modo === "cambiar-contra" ? "Cancelar" : "Cambiar Contraseña"}
        </button>

        
        <button
          className="btn-submit"
          type="button"
          onClick={() => {
            setModo(modo === "cambiar-usuario" ? null : "cambiar-usuario");
            resetForm();
          }}
          style={{ 
            justifyContent: "center", opacity: 0.9,
            backgroundColor: modo === "cambiar-usuario" ? "#b71c1c" : "" // cambiamos al color del boton
          }}
        >
          {modo === "cambiar-usuario" ? "Cancelar" : "Cambiar Usuario"}
        </button>
      </div>

      <hr className="section-divider" />
      {modo === "cambiar-usuario" && (
        
        <div className="form-grid">

          <div className="form-group">
            <label>Usuario actual:</label>
            <input
              type="text"
              name="nuevo_usuario"
              value={form.nuevo_usuario}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nuevo usuario:</label>
            <input
              type="text"
              name="nuevo_usuario"
              value={form.nuevo_usuario}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirma nuevo usuario:</label>
            <input
              type="text"
              name="confirmar_usuario"
              value={form.confirmar_usuario}
              onChange={handleFormChange}
              required
            />
          </div>
        </div>
      )}

      {modo === "cambiar-contra" && (
        <div className="form-grid">
          <div className="form-group">
            <label>Contraseña Actual:</label>
            <input
              type="password"
              name="contrasena_actual"
              value={form.contrasena_actual}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nueva contraseña:</label>
            <input
              type="password"
              name="nueva_contrasena"
              value={form.nueva_contrasena}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirma nueva contraseña:</label>
            <input
              type="password"
              name="confirmar_contrasena"
              value={form.confirmar_contrasena}
              onChange={handleFormChange}
              required
            />
          </div>

        </div>
        
      )}

      {errorMsg && <div style={{ color: "red", textAlign: "center" }}>{errorMsg}</div>}
      {mensaje && <div style={{ color: "green", textAlign: "center" }}>{mensaje}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" className="btn-cancel" onClick={() => handleRedirect("/admin")}>
          Cancelar
        </button>
      </div>
      <div className="form-actions-cerrar">
        
<button type="button" className="btn-cerrar-sesion" onClick={() => handleRedirect("/login")}>
Cerrar sesión
</button>
</div>
    </form>
  );
};


export default ConfiguracionPerfil;