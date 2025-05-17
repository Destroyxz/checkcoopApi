import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db';
import bcrypt from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';

const router = Router();


// Definición de los campos esperados en el body
interface NewUserBody {
  nombre: string;
  apellidos?: string;
  email: string;
  telefono: string;
  rol: 'superadmin' | 'admin' | 'usuario';
  empresa_id: number;
  password: string;
  activo: boolean;
}


/**
 * POST /api/users/newUser
 * Crea un nuevo usuario en la base de datos.
 */
router.post(
  '/newUser',
  async (
    req: Request<{}, {}, NewUserBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const {
      nombre,
      apellidos,
      email,
      telefono,
      rol,
      empresa_id,
      password,
      activo
    } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !rol || !empresa_id) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }
    if (!/^\d{9}$/.test(telefono)) {
      res.status(400).json({ message: 'Teléfono debe tener 9 dígitos' });
      return;
    }

    try {
      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Insertar nuevo usuario
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO usuarios
          (empresa_id, nombre, apellidos, email, telefono, password_hash, rol, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empresa_id,
          nombre,
          apellidos || null,
          email,
          telefono,
          hash,
          rol,
          activo ? 1 : 0
        ]
      );

      // Devolver respuesta con el nuevo ID y datos relevantes
      res.status(201).json({
        id: (result.insertId as number),
        nombre,
        apellidos,
        email,
        telefono,
        rol,
        empresa_id,
        activo
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;