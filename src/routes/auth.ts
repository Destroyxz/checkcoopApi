/*
Este componente gestiona el login de usuarios: verifica las credenciales recibidas (email y contraseña),
comprueba si el usuario está activo, y si todo es correcto, genera y devuelve un token JWT junto con
los datos básicos del usuario.
*/

//Importamos las interfaces necesarias de los modulos
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
  empresa_id: number;
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
        'SELECT id, empresa_id, nombre, apellidos, email, password_hash, rol, activo FROM usuarios WHERE email = ?',
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

      // Actualizar last_login a la hora actual
      await db.execute(
        'UPDATE usuarios SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Generar el token JWT
      const payload = {
        id: user.id,
        empresa_id: user.empresa_id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      };
      const token = jwt.sign(payload, JWT_SECRET);

      // Responder con el token y los datos del usuario (sin el hash)
      res.json({
        token,
        user: {
          id: user.id,
          empresa_id: user.empresa_id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol,
        }
      });

    } catch (err) {
      next(err);
    }
  }
);



export default router;
