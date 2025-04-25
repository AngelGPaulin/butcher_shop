"use client";

import { API_URL } from "@/constants";
import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

        router.push("/dashboard");
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
      className="bg-orange-500 px-10 py-2 rounded-md max-w-md mx-auto mt-20"
      onSubmit={handleSubmit}
    >
      <p className="text-2xl my-4 text-white text-center font-semibold">
        Iniciar sesión
      </p>

      <div className="flex flex-col gap-4 my-6">
        <Input
          label="Usuario"
          name="nombre_usuario"
          type="text"
          isRequired
          size="sm"
        />
        <Input
          label="Contraseña"
          name="contrasena"
          type="password"
          isRequired
          size="sm"
        />
      </div>

      <div className="text-white flex flex-col items-center gap-3">
        <Button type="submit" color="primary" isDisabled={submitting}>
          {submitting ? "Enviando..." : "Iniciar sesión"}
        </Button>

        <p className="text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-black underline font-semibold">
            Registrarse
          </Link>
        </p>
      </div>
    </form>
  );
}
