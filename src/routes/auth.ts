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
  activo: number;
}

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'UseroNoTieneNiIdeaDeAngular';  // Clave secreta para firmar el token

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
        'SELECT id, nombre, apellidos, email, password_hash, rol, activo FROM usuarios WHERE email = ?',
        [email]
      );
      const users = rows as UserRow[];

      if (users.length === 0) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      const user = users[0];

      // Verificar si el usuario está activo
      if (user.activo !== 1) {
        res.status(403).json({ message: 'Usuario inactivo' });
        return;
      }

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Generar el token JWT
      const payload = {
        sub: user.id,  // ID del usuario
        nombre: user.nombre,
        rol: user.rol,
        iat: Math.floor(Date.now() / 1000),  // Fecha de emisión
        exp: Math.floor(Date.now() / 1000) + 60 * 60,  // Expiración de 1 hora
      };

      const token = jwt.sign(payload, JWT_SECRET);  // Generar el token JWT

      // Responder con el token y los datos del usuario (sin el hash)
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

// POST /auth/register: crea un nuevo usuario
router.post(
  '/register',
  async (
    req: Request<{}, {}, { username: string; surname: string; email: string; password: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, surname, email, password } = req.body;

    if (!username || !surname || !email || !password) {
      res.status(400).json({ message: 'Todos los campos son obligatorios' });
      return;
    }

    try {
      // Verificar si ya existe un usuario con ese email
      const [existing] = await db.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      if ((existing as any[]).length > 0) {
        res.status(409).json({ message: 'El correo ya está registrado' });
        return;
      }

      // Hashear la contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Insertar nuevo usuario (activo por defecto en 1)
      await db.execute(
        'INSERT INTO usuarios (empresa_id, nombre, apellidos, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, username, surname, email, password_hash, 'usuario', 1]
      );
      
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
