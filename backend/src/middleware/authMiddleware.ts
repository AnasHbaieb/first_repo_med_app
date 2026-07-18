import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define a more specific user type here if needed
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const { data: user, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Supabase auth error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  if (user) {
    req.user = user.user;
    next();
  } else {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
