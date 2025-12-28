import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN = parseInt(process.env.OTP_EXPIRES_IN || '300000');

export const otpUtil = {
  generate(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  getExpiryDate(): Date {
    return new Date(Date.now() + OTP_EXPIRES_IN);
  },

  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  },
};