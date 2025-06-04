"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { TOKEN_NAME } from "@/constants";

export const authHeaders = async () => {
  const token = (await cookies()).get(TOKEN_NAME)?.value;
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getUserInfo = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get(TOKEN_NAME)?.value;

  if (!token || !process.env.JWT_KEY) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY) as {
      userId: string;
      nombre_usuario: string;
      rol: string | string[];
    };

    return {
      userId: decoded.userId,
      nombre_usuario: decoded.nombre_usuario,
      userRoles: Array.isArray(decoded.rol) ? decoded.rol : [decoded.rol],
    };
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    return null;
  }
};
