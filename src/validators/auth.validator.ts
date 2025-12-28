import Joi from 'joi';

export const authValidators = {
  register: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    birthDate: Joi.date().max('now').required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  verifyOTP: Joi.object({
    userId: Joi.string().uuid().required(),
    otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  resendOTP: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
};
