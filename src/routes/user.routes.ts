import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { userValidators } from '../validators/user.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(Role.ADMIN),
  validate(userValidators.getUsers, 'query'),
  userController.getAllUsers
);

router.get(
  '/:id',
  validate(userValidators.getUserById, 'params'),
  userController.getUserById
);

router.patch(
  '/:id/block',
  validate(userValidators.blockUser, 'params'),
  userController.blockUser
);

export default router;