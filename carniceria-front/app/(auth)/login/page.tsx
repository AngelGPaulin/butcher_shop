"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/helpers/firebaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_URL, TOKEN_NAME } from "@/constants";
import "./login.css";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("contrasena") as string;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("✅ Login exitoso:", user.email);

      // Llamar a backend para obtener token
      const res = await fetch(`${API_URL}/auth/firebase-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
        credentials: "include",
      });
      console.log("🔽 Respuesta del backend:", res);
      console.log("🔽 Headers recibidos:", res.headers);
      if (!res.ok) {
        throw new Error("Usuario no registrado en el sistema");
      }

      const result = await res.json();

      // ✅ Guardar token como cookie (cliente)
      const token = result.token ?? result[TOKEN_NAME];
      document.cookie = `${TOKEN_NAME}=${token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`;

      // ✅ Guardar info útil
      localStorage.setItem("usuario", JSON.stringify(result));

      // ✅ Redirigir por rol
      if (result.rol === "Admin") {
        router.push("/admin");
      } else {
        router.push("/empleado");
      }
    } catch (err: any) {
      console.error("❌ Error de login:", err.message);
      setError("Credenciales incorrectas o usuario no registrado.");
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
        placeholder="Correo electrónico"
        name="email"
        type="email"
        required
      />
      <input
        className="input-custom"
        placeholder="Contraseña"
        name="contrasena"
        type="password"
        required
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button type="submit" className="button-custom" disabled={submitting}>
        {submitting ? "Verificando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
