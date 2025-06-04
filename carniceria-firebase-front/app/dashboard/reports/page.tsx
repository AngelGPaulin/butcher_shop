import { getUserInfo } from "@/helpers/authHeaders";
import ReportesAdminClient from "./ReportesAdminCliente";

export default async function ReportsPage() {
  const user = await getUserInfo();

  console.log("👤 Usuario detectado:", user);

  if (!user || !user.userRoles.includes("Admin")) {
    console.log("⛔ Usuario no autorizado o no es admin");
    return <div>No autorizado</div>;
  }

  return <ReportesAdminClient />;
}
