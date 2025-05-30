"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/constants";
import "./reg-provider.css";

interface Provider {
  providerId?: string;
  nombre: string;
  contacto: string;
  direccion?: string;
  telefono?: string;
}

export default function ProviderFormPage() {
  const [modo, setModo] = useState<"crear" | "actualizar" | "eliminar">(
    "crear"
  );
  const [proveedores, setProveedores] = useState<Provider[]>([]);
  const [form, setForm] = useState<Provider>({
    providerId: "",
    nombre: "",
    contacto: "",
    direccion: "",
    telefono: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

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
    } catch {
      setErrorMsg("Error cargando proveedores");
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
  };

  const cargarProveedor = (id: string) => {
    const proveedor = proveedores.find((p) => p.providerId === id);
    if (proveedor) setForm({ ...proveedor });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const { providerId, ...dataToSend } = form;

    const res = await fetch(`${API_URL}/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      alert("✅ Proveedor creado");
      resetForm();
      cargarProveedores();
    } else {
      const err = await res.json();
      setErrorMsg(err.message || "Error al crear proveedor");
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.providerId) return alert("Selecciona un proveedor");

    const { providerId, ...dataToSend } = form;

    const res = await fetch(`${API_URL}/providers/${form.providerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      alert("✅ Proveedor actualizado");
      resetForm();
      cargarProveedores();
    } else {
      const err = await res.json();
      setErrorMsg(err.message || "Error al actualizar proveedor");
    }
  };

  const handleEliminar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.providerId) return alert("Selecciona un proveedor");

    const confirmar = confirm(`¿Eliminar proveedor "${form.nombre}"?`);
    if (!confirmar) return;

    const res = await fetch(`${API_URL}/providers/${form.providerId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      alert("🗑️ Proveedor eliminado");
      resetForm();
      cargarProveedores();
    } else {
      const err = await res.json();
      setErrorMsg(err.message || "Error al eliminar proveedor");
    }
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(form.nombre.toLowerCase())
  );

  return (
    <div className="provider-form-container">
      <div className="form-header">
        <h1>
          {modo === "crear"
            ? "Crear Proveedor"
            : modo === "actualizar"
            ? "Actualizar Proveedor"
            : "Eliminar Proveedor"}
        </h1>
        <div
          className="form-actions"
          style={{ justifyContent: "center", marginBottom: "20px" }}
        >
          <button
            className="btn-submit"
            type="button"
            onClick={() => {
              setModo("crear");
              resetForm();
            }}
          >
            Crear Proveedor
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              setModo("actualizar");
              resetForm();
            }}
          >
            Actualizar Proveedor
          </button>
          <button
            className="btn-delete"
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
              <ul className="bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto rounded shadow">
                {proveedoresFiltrados.map((p) => (
                  <li
                    key={p.providerId}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => cargarProveedor(p.providerId!)}
                  >
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(modo === "crear" || modo === "actualizar") && (
          <>
            <div className="form-group">
              <label>Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contacto</label>
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
          <div style={{ color: "red", fontWeight: "bold" }}>⚠️ {errorMsg}</div>
        )}

        <div className="form-actions">
          <button className="btn-submit" type="submit">
            {modo === "crear"
              ? "Agregar"
              : modo === "actualizar"
              ? "Actualizar"
              : "Eliminar"}
          </button>
          <button className="btn-cancel" type="reset" onClick={resetForm}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
