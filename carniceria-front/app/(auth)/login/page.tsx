"use client";

import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./login.css";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const authData = {
      nombre_usuario: formData.get("nombre_usuario"),
      contrasena: formData.get("contrasena"),
    };
    console.log("🔁 Enviando datos de login:", authData);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(authData),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔁 STATUS DE LOGIN:", res.status);

      if (res.ok) {
        const result = await res.json();
        console.log("✅ Login success:", result);
        localStorage.setItem("usuario", JSON.stringify(result));

        // Redirección según el rol
        if (result.rol === "Admin") {
          router.push("/admin");
        } else {
          router.push("/empleado");
        }
      } else {
        const errorText = await res.text();
        console.error("❌ Login fallido. Respuesta:", errorText);
      }
    } catch (err) {
      console.error("🚨 Error real al hacer login:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="bg-white px-10 py-2 rounded-md max-w-md mx-auto mt-10"
      onSubmit={handleSubmit}
    >
      <div className="form-header">
        <img src="/logo.png" alt="Logo" className="logo" />
      </div>

      <input
        className="input-custom"
        placeholder="Usuario"
        name="nombre_usuario"
        type="text"
        required
      />
      <input
        className="input-custom"
        placeholder="Contraseña"
        name="contrasena"
        type="password"
        required
      />

      <button type="submit" className="button-custom" disabled={submitting}>
        {submitting ? "Enviando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
