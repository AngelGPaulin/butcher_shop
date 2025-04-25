import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_NAME } from "@/constants";

// Carga de fuentes personalizadas
const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard | Carnicería",
  description: "Panel de gestión de la carnicería",
};

export default async function DashboardLayout({
  children,
  locations,
}: {
  children: React.ReactNode;
  locations: React.ReactNode;
}) {
  const token = (await cookies()).get(TOKEN_NAME)?.value;

  // Si no hay token, redirige al login
  if (!token) {
    redirect("/login");
  }

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-orange-50`}
      >
        <main className="w-full h-full flex">
          {children}
          {locations}
        </main>
      </body>
    </html>
  );
}
