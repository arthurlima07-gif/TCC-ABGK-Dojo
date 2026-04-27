// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) return res.redirect('/login');
  next();
}

export function ensureRole(role: 'aluno' | 'professor') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) return res.redirect('/login');
    if (req.session.user.role !== role) return res.status(403).send('Acesso negado');
    next();
  };
}