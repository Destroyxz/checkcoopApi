import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

// Tipado del cuerpo de la petición
interface AuthBody {
  email: string;
  password: string;
}

// Tipado de la fila de usuario desde la BD
interface UserRow {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password_hash: string;
  rol: string;
}

const router = Router();

// POST /auth/login: autentica usuario y devuelve JWT
router.post(
  '/login',
  async (
    req: Request<{}, {}, AuthBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios' });
      return;
    }

    try {
      // Recuperar usuario por email
      const [rows] = await db.execute(
        'SELECT id, nombre, apellidos, email, password_hash, rol FROM usuarios WHERE email = ?',
        [email]
      );
      const users = rows as UserRow[];
      if (users.length === 0) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }
      const user = users[0];

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Generar JWT
      const secret = process.env.JWT_SECRET!;
      const token = jwt.sign({ id: user.id, rol: user.rol }, secret, {
        expiresIn: '2h',
      });

      // Responder con token y datos de usuario (sin el hash)
      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
