// jwt.constants.ts
import { config } from 'dotenv';
config(); // para asegurarte de que process.env esté cargado

export const JWT_KEY = process.env.JWT_KEY || 'fallback_key';
export const EXPIRES_IN = process.env.EXPIRES_IN || '7d';
export const TOKEN_NAME = process.env.TOKEN_NAME || 'auth_token_carniceria';
