import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Role } from '@prisma/client';

export const requireRoles = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (req.user.role === 'ADMIN' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Requires one of [${roles.join(', ')}] role. You have [${req.user.role}].`,
    });
  };
};
