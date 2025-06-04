import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAME } from "./constants";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;

  // Protege todas las rutas que empiecen por /dashboard
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirección desde raíz (/) a dashboard
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
