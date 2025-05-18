import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'UseroNoTieneNiIdeaDeAngular';

function verifyToken(req: Request, res: Response, next: NextFunction): void { // 👈 AÑADIDO ": void"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ message: 'No se recibió token' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(403).json({ message: 'Token no válido o expirado' });
      return;
    }

    (req as any).user = payload;
    next(); // ✅ llamado correctamente
  });
}

export default verifyToken;
