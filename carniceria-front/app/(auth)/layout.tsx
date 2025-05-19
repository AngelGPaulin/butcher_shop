import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-red-100 w-screen h-screen overflow-hidden grid">
      <div className="place-content-center place-self-center place-items-center text-center">
        {/* 
        <div className="flex flex-col items-center bottom-10 relative">
          <Image
            src="/logo.png"
            alt="Logo Carnicería"
            width={200}
            height={200}
            className="mb-6"
          />
          <h1 className="text-3xl font-bold text-red-700 mb-2">Carnicería Karlita</h1>
        </div>
        */}
        {children}
      </div>
    </div>
  );
}
