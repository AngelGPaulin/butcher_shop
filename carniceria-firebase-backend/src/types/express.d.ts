// src/types/express.d.ts

import { User } from 'src/auth/dto/interfaces/user.interface';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
