"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-provider.css";
import { useRouter } from "next/navigation";

interface Provider {
  id?: string; // <- Usamos `id` en vez de `providerId`
  nombre: string;
  contacto: string;
  direccion: string;
  telefono: string;
}

export default function ProviderFormPage() {
  const [modo, setModo] = useState<"crear" | "actualizar" | "eliminar">(
    "crear"
  );
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Provider[]>([]);
  const [form, setForm] = useState<Provider>({
    id: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const proveedorYaExiste = (nombre: string, excluirId?: string): boolean => {
    return proveedores.some(
      (p) =>
        p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== excluirId
    );
  };

  const handleRedirect = (path: string) => router.push(path);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/providers`, {
        credentials: "include",
      });
      const raw = await res.json();
      const data: Provider[] = raw.map((doc: any) => ({
        ...doc,
        id: doc.id || doc.providerId, // fallback por si backend sigue usando providerId
        direccion: doc.direccion ?? "",
        telefono: doc.telefono ?? "",
        contacto: doc.contacto ?? "",
        nombre: doc.nombre ?? "",
      }));
      setProveedores(data);
    } catch (error) {
      setErrorMsg("Error cargando proveedores");
      console.error("Error cargando proveedores:", error);
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
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

    if (name === "nombre" && modo === "crear") {
      setErrorMsg(
        proveedorYaExiste(value)
          ? "⚠️ Ya existe un proveedor con este nombre"
          : ""
      );
    }
  };

  const cargarProveedor = (id: string) => {
    const proveedor = proveedores.find((p) => p.id === id);
    if (proveedor) {
      setForm({
        ...proveedor,
        nombre: proveedor.nombre || "",
        contacto: proveedor.contacto || "",
        direccion: proveedor.direccion || "",
        telefono: proveedor.telefono || "",
      });
      setErrorMsg("");
    } else {
      console.warn("Proveedor no encontrado:", id);
      resetForm();
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proveedorYaExiste(form.nombre)) {
      setErrorMsg("⚠️ Ya existe un proveedor con este nombre");
      return;
    }

    try {
      const dataToSend: Partial<Provider> = {
        nombre: form.nombre,
        contacto: form.contacto,
      };
      if (form.direccion !== "") dataToSend.direccion = form.direccion;
      if (form.telefono !== "") dataToSend.telefono = form.telefono;

      const res = await fetch(`${API_URL}/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        let msg = "Error al crear proveedor";
        if (err.code === "23505") {
          msg = "El nombre del proveedor ya existe.";
        } else if (err.message) {
          msg = Array.isArray(err.message)
            ? err.message.join("\n")
            : err.message;
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
    if (!form.id) return alert("Selecciona un proveedor");

    if (proveedorYaExiste(form.nombre, form.id)) {
      setErrorMsg("⚠️ Ya existe otro proveedor con este nombre");
      return;
    }

    try {
      const dataToSend: Partial<Provider> = {
        nombre: form.nombre,
        contacto: form.contacto,
      };
      if (form.direccion !== "") dataToSend.direccion = form.direccion;
      if (form.telefono !== "") dataToSend.telefono = form.telefono;

      const res = await fetch(`${API_URL}/providers/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        let msg = "Error al actualizar proveedor";
        if (err.code === "23505") {
          msg = "El nombre ya está en uso por otro proveedor.";
        } else if (err.message) {
          msg = Array.isArray(err.message)
            ? err.message.join("\n")
            : err.message;
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
    if (!form.id) return alert("Selecciona un proveedor");

    if (!confirm(`¿Eliminar definitivamente el proveedor "${form.nombre}"?`))
      return;

    try {
      const res = await fetch(`${API_URL}/providers/${form.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        let msg = "Error al eliminar el proveedor";
        if (err.message) {
          msg = Array.isArray(err.message)
            ? err.message.join("\n")
            : err.message;
        }
        throw new Error(msg);
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

        <div
          className="form-actions"
          style={{ justifyContent: "center", marginBottom: "20px" }}
        >
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
                  <li key={p.id!} onClick={() => cargarProveedor(p.id!)}>
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
          <div
            className={`error-message ${
              errorMsg.includes("Ya existe") ? "warning" : ""
            }`}
          >
            {errorMsg}
            {errorMsg.includes("Ya existe") &&
              proveedoresFiltrados.length > 0 && (
                <div className="duplicate-providers">
                  <p>Proveedores existentes con este nombre:</p>
                  <ul>
                    {proveedoresFiltrados.map((p) => (
                      <li key={p.id!}>
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
