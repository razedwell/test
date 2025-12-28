import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { IAuthRequest } from '../types';

export class UserController {
  async getUserById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if user has access (admin or self)
      await userService.checkAccess(req.user!.id, id, req.user!.role);
      
      const user = await userService.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await userService.getAllUsers(
        Number(page) || 1,
        Number(limit) || 10
      );
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if user has access (admin or self)
      await userService.checkAccess(req.user!.id, id, req.user!.role);
      
      const user = await userService.blockUser(id);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User blocked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();