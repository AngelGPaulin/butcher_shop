"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-provider.css";
import { useRouter } from "next/navigation";

interface Provider {
  providerId?: string;
  nombre: string;
  contacto: string;
  direccion?: string;
  telefono?: string;
}

export default function ProviderFormPage() {
  const [modo, setModo] = useState<"crear" | "actualizar" | "eliminar">("crear");
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Provider[]>([]);
  const [form, setForm] = useState<Provider>({
    providerId: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Función para verificar duplicados
  const proveedorYaExiste = (nombre: string, excluirId?: string): boolean => {
    return proveedores.some(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase() && 
             p.providerId !== excluirId
    );
  };

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/providers`, {
        credentials: "include",
      });
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      setErrorMsg("Error cargando proveedores");
      console.error("Error cargando proveedores:", error);
    }
  };

  const resetForm = () => {
    setForm({
      providerId: "",
      nombre: "",
      contacto: "",
      direccion: "",
      telefono: "",
    });
    setErrorMsg("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validación en tiempo real para el nombre
    if (name === "nombre" && modo === "crear") {
      setErrorMsg(
        proveedorYaExiste(value) 
          ? "⚠️ Ya existe un proveedor con este nombre" 
          : ""
      );
    }
  };

  const cargarProveedor = (id: string) => {
    const proveedor = proveedores.find((p) => p.providerId === id);
    if (proveedor) {
      setForm({ ...proveedor });
      setErrorMsg("");
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación final antes de enviar
    if (proveedorYaExiste(form.nombre)) {
      setErrorMsg("⚠️ Ya existe un proveedor con este nombre");
      return;
    }

    try {
      const { providerId, ...dataToSend } = form;
      const res = await fetch(`${API_URL}/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        let msg = "Error al crear proveedor";
        
        if (err.code === '23505') {
          msg = "El nombre del proveedor ya existe. Por favor, elija otro.";
        } else if (err.message) {
          msg = Array.isArray(err.message) ? err.message.join("\n") : err.message;
        }
        
        throw new Error(msg);
      }

      alert("✅ Proveedor creado exitosamente");
      resetForm();
      await cargarProveedores();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.providerId) {
      alert("Selecciona un proveedor");
      return;
    }

    if (proveedorYaExiste(form.nombre, form.providerId)) {
      setErrorMsg("⚠️ Ya existe otro proveedor con este nombre");
      return;
    }

    try {
      const { providerId, ...dataToSend } = form;
      const res = await fetch(`${API_URL}/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        let msg = "Error al actualizar proveedor";
        
        if (err.code === '23505') {
          msg = "No se puede actualizar: el nombre ya está en uso por otro proveedor.";
        }
        
        throw new Error(msg);
      }

      alert("✅ Proveedor actualizado exitosamente");
      resetForm();
      await cargarProveedores();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEliminar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.providerId) {
      alert("Selecciona un proveedor");
      return;
    }

    if (!confirm(`¿Eliminar definitivamente el proveedor "${form.nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/providers/${form.providerId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el proveedor");
      }

      alert("🗑️ Proveedor eliminado exitosamente");
      resetForm();
      await cargarProveedores();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(form.nombre.toLowerCase())
  );

  return (
    <div className="provider-form-container">
      <div className="form-header">
        <div className="regProv-logo-box">
          <img src="/logo.png" alt="Logo" className="regProv-logo" />
        </div>

        <div className="form-actions"
          style={{ justifyContent: "center", marginBottom: "20px" }}>
          <button
            className={`btn-submit ${modo === "crear" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setModo("crear");
              resetForm();
            }}
          >
            Crear Proveedor
          </button>
          <button
            className={`btn-submit ${modo === "actualizar" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setModo("actualizar");
              resetForm();
            }}
          >
            Actualizar Proveedor
          </button>
          <button
            className={`btn-cancel ${modo === "eliminar" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setModo("eliminar");
              resetForm();
            }}
          >
            Eliminar Proveedor
          </button>
        </div>
      </div>

      <form
        className="provider-form"
        onSubmit={
          modo === "crear"
            ? handleCrear
            : modo === "actualizar"
            ? handleActualizar
            : handleEliminar
        }
      >
        {(modo === "actualizar" || modo === "eliminar") && (
          <div className="form-group">
            <label>Buscar Proveedor</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Buscar proveedor..."
              autoComplete="off"
              required
            />
            {form.nombre && proveedoresFiltrados.length > 0 && (
              <ul className="provider-suggestions">
                {proveedoresFiltrados.map((p) => (
                  <li
                    key={p.providerId}
                    onClick={() => cargarProveedor(p.providerId!)}
                  >
                    {p.nombre} - {p.contacto}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(modo === "crear" || modo === "actualizar") && (
          <>
            <div className="form-group">
              <label>Nombre del Proveedor*</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label>Persona de Contacto*</label>
              <input
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 5512345678"
              />
            </div>
          </>
        )}

        {errorMsg && (
          <div className={`error-message ${errorMsg.includes("Ya existe") ? "warning" : ""}`}>
            {errorMsg}
            {errorMsg.includes("Ya existe") && proveedoresFiltrados.length > 0 && (
              <div className="duplicate-providers">
                <p>Proveedores existentes con este nombre:</p>
                <ul>
                  {proveedoresFiltrados.map((p) => (
                    <li key={p.providerId}>
                      {p.nombre} - Contacto: {p.contacto}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button
            className="btn-submit"
            type="submit"
            disabled={!!errorMsg && errorMsg.includes("Ya existe")}
          >
            {modo === "crear"
              ? "Crear Proveedor"
              : modo === "actualizar"
              ? "Actualizar Proveedor"
              : "Eliminar Proveedor"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => handleRedirect("/admin")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}