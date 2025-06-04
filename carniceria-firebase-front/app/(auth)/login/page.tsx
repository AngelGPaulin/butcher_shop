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
      // ✅ Autenticación con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("✅ Login Firebase exitoso:", user.email);

      // ✅ Validar en backend + obtener token + rol
      const res = await fetch(`${API_URL}/auth/firebase-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
        credentials: "include", // 🔐 Para recibir cookie del token
      });

      if (!res.ok) throw new Error("Usuario no registrado en backend");

      const result = await res.json();

      // ✅ Guardar token manualmente por si el backend no envía cookie
      const token = result.token ?? result[TOKEN_NAME];
      if (token) {
        document.cookie = `${TOKEN_NAME}=${token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }`;
      }

      // ✅ Guardar el usuario localmente
      localStorage.setItem("usuario", JSON.stringify(result));

      // ✅ Redirigir según el rol
      if (result.rol === "Admin") {
        router.push("/admin");
      } else {
        router.push("/empleado");
      }
    } catch (err: any) {
      console.error("❌ Error en login:", err.message);
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
