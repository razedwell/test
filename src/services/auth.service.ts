import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { jwtUtil } from '../utils/jwt.util';
import { otpUtil } from '../utils/otp.util';
import { emailService } from './email.service';
import { Role } from '@prisma/client';

export class AuthService {
  async register(data: {
    fullName: string;
    birthDate: Date;
    email: string;
    password: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        birthDate: new Date(data.birthDate),
        email: data.email,
        password: hashedPassword,
        role: Role.USER,
        isActive: false,
      },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    const otpCode = otpUtil.generate();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt: otpUtil.getExpiryDate(),
      },
    });

    await emailService.sendOTP(user.email, otpCode);

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user.id,
    };
  }

  async verifyOTP(userId: string, otpCode: string) {
    const otp = await prisma.oTP.findFirst({
      where: {
        userId,
        code: otpCode,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw ApiError.badRequest('Invalid OTP code');
    }

    if (otpUtil.isExpired(otp.expiresAt)) {
      throw ApiError.badRequest('OTP code has expired');
    }

    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: otp.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    const tokens = jwtUtil.generateTokens({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user!.id,
        token: tokens.refreshToken,
        expiresAt: jwtUtil.getRefreshTokenExpiry(),
      },
    });

    return { user, tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is blocked or not verified');
    }

    const tokens = jwtUtil.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: jwtUtil.getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        birthDate: user.birthDate,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = jwtUtil.verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw ApiError.forbidden('Account is blocked');
    }

    const tokens = jwtUtil.generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id },
      }),
      prisma.refreshToken.create({
        data: {
          userId: payload.userId,
          token: tokens.refreshToken,
          expiresAt: jwtUtil.getRefreshTokenExpiry(),
        },
      }),
    ]);

    return tokens;
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async resendOTP(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.isActive) {
      throw ApiError.badRequest('User is already verified');
    }

    await prisma.oTP.updateMany({
      where: {
        userId,
        verified: false,
      },
      data: { verified: true },
    });

    const otpCode = otpUtil.generate();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt: otpUtil.getExpiryDate(),
      },
    });

    await emailService.sendOTP(user.email, otpCode);

    return { message: 'OTP sent successfully' };
  }
}

export const authService = new AuthService();