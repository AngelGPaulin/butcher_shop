import { getUserInfo } from "@/helpers/authHeaders";
import Image from "next/image";
import "./dash.css";

export default async function DashboardHome() {
  const user = await getUserInfo();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500 p-8 bg-white rounded-lg shadow-md border border-red-100">
          No pudimos cargar tu información.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper background-meat">
      <div className="dashboard-card animate-entry">
        <div className="dashboard-image">
          <Image
            src="/logo.png"
            alt="Imagen de bienvenida"
            width={160}
            height={160}
            className="rounded-full shadow"
          />
        </div>

        <h1 className="dashboard-title">
          ¡Bienvenid@,{" "}
          <span className="capitalize highlight-text">
            {user.nombre_usuario}
          </span>
          !
        </h1>

        <p className="dashboard-role">
          Tu rol es:{" "}
          <span className="role-bold">{user.userRoles.join(", ")}</span>
        </p>

        <p className="dashboard-quote">
          “La calidad de la carne es nuestro orgullo. Gracias por formar parte.”
        </p>

        <div className="action-buttons">
          <a href="/dashboard/cart" className="confirm-button">
            Ver productos
          </a>
        </div>
      </div>
    </div>
  );
}
