import Joi from 'joi';

export const userValidators = {
  getUserById: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  getUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  blockUser: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};