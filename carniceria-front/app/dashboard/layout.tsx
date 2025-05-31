import { CartProvider } from "./tempo/CartContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <main className="min-h-screen bg-orange-50 p-6">{children}</main>
    </CartProvider>
  );
}
