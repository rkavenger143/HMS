import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local demo / development mode, allow proceeding if mock auth is used
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized token' });
    }
    req.user = user;
    next();
  } catch (err) {
    next();
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Fallback for local demo
    }
    const role = req.user.user_metadata?.role || req.user.role;
    if (allowedRoles.includes('*') || allowedRoles.includes(role)) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
  };
}
