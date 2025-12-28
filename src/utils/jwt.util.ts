import jwt from 'jsonwebtoken';
import { ITokenPayload, ITokens } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as string;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string;

export const jwtUtil = {
  generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  },

  generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  },

  generateTokens(payload: ITokenPayload): ITokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },

  verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, JWT_SECRET) as ITokenPayload;
  },

  verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as ITokenPayload;
  },

  getRefreshTokenExpiry(): Date {
    const expiry = JWT_REFRESH_EXPIRES_IN;
    const match = expiry.match(/^(\d+)([dhms])$/);
    
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers: Record<string, number> = {
      'd': 24 * 60 * 60 * 1000,
      'h': 60 * 60 * 1000,
      'm': 60 * 1000,
      's': 1000,
    };
    
    return new Date(Date.now() + value * multipliers[unit]);
  },
};