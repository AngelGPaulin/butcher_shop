import { getUserInfo } from "@/helpers/authHeaders";

export default async function DashboardHome() {
  const user = await getUserInfo();

  if (!user) {
    return (
      <div className="text-center mt-28 text-red-500">
        No pudimos cargar tu información.
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto mt-10 p-10 rounded-2xl shadow-lg bg-white text-center">
      <h1 className="text-4xl font-bold text-orange-600 mb-6">
        ¡Bienvenido, <span className="capitalize">{user.nombre_usuario}</span>!
      </h1>

      <h2 className="text-lg text-gray-700">
        Tu rol es:{" "}
        <span className="font-semibold text-black">
          {user.userRoles.join(", ")}
        </span>
      </h2>

      <div className="mt-10 flex justify-center gap-4">
        <a
          href="/dashboard/products"
          className="border border-orange-500 text-orange-600 hover:bg-orange-100 transition font-medium py-2 px-6 rounded-md"
        >
          Ver productos
        </a>
      </div>
    </section>
  );
}
