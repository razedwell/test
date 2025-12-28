import { Request } from 'express';
import { Role } from '@prisma/client';

export interface IUser {
  id: string;
  fullName: string;
  birthDate: Date;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}