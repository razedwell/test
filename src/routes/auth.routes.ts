import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authValidators } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(authValidators.register), authController.register);
router.post('/verify-otp', validate(authValidators.verifyOTP), authController.verifyOTP);
router.post('/login', validate(authValidators.login), authController.login);
router.post('/refresh-token', validate(authValidators.refreshToken), authController.refreshToken);
router.post('/logout', validate(authValidators.refreshToken), authController.logout);
router.post('/resend-otp', validate(authValidators.resendOTP), authController.resendOTP);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;