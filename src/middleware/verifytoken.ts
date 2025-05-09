import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'UseroNoTieneNiIdeaDeAngular';

function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Obtener la cabecera de autorización
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No se recibió token' });
  }

  // Extraer el token del formato "Bearer <token>"
  const [scheme, token] = authHeader.split(' ');

  // Verificar si el esquema es 'Bearer' y si el token está presente
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  // Verificar el token utilizando la clave secreta
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido o expirado' });
    }

    // Guardar el payload decodificado en req.user
    (req as any).user = payload;
    next();
  });
}

export default verifyToken;

