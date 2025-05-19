import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';
import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = Router();

interface user {
  nombre: string;
  apellidos?: string;
  email: string;
  telefono: string;
  rol: 'usuario' | 'admin' | 'superadmin';
  empresa_id: number;
  password: string;
  activo: boolean;
  horaInicio: string;      
  horaSalida: string;        
  turnoPartido: boolean;    
  horaInicio2?: string;      
  horaSalida2?: string;     
}

// 1) Crear usuario 
router.post(
  '/newUser',
  async (
    req: Request<{}, {}, user>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const {
      nombre, apellidos, email, telefono,
      rol, empresa_id, password, activo,
      horaInicio, horaSalida,
      turnoPartido, horaInicio2, horaSalida2
    } = req.body;

    // campos obligatorios
    if (!nombre || !email || !password || !rol || !empresa_id
        || !horaInicio || !horaSalida) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    // validar formato HH:MM
    const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRe.test(horaInicio) || !timeRe.test(horaSalida)) {
      res.status(400).json({ message: 'Formato de horaInicio/horaSalida inválido' });
      return;
    }
    // si es turno partido, validar segundo bloque
    if (turnoPartido) {
      if (!horaInicio2 || !horaSalida2) {
        res.status(400).json({ message: 'Faltan horas del segundo turno' });
        return;
      }
      if (!timeRe.test(horaInicio2) || !timeRe.test(horaSalida2)) {
        res.status(400).json({ message: 'Formato de horaInicio2/horaSalida2 inválido' });
        return;
      }
    }

    // teléfono a 9 dígitos
    if (!/^\d{9}$/.test(telefono)) {
      res.status(400).json({ message: 'Teléfono debe tener 9 dígitos' });
      return;
    }

    try {
      // hash contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO usuarios
          (empresa_id, nombre, apellidos, email, telefono,
           password_hash, rol, activo,
           hora_inicio_1, hora_fin_1,
           hora_inicio_2, hora_fin_2)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empresa_id,
          nombre,
          apellidos || null,
          email,
          telefono,
          hash,
          rol,
          activo ? 1 : 0,
          horaInicio,
          horaSalida,
          turnoPartido ? horaInicio2 : null,
          turnoPartido ? horaSalida2 : null
        ]
      );

      res.status(201).json({
        id: result.insertId,
        nombre,
        apellidos,
        email,
        telefono,
        rol,
        empresa_id,
        activo,
        horario: {
          inicio1: horaInicio,
          fin1:   horaSalida,

          ...(turnoPartido && {
            inicio2: horaInicio2,
            fin2:    horaSalida2
          })
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// Obtener todos los usuarios 
router.get(
  '/users',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT
           u.id,
           u.empresa_id,
           e.nombre      AS empresaNombre,
           u.nombre,
           u.apellidos,
           u.email,
           u.telefono,
           u.rol,
           u.activo,
           u.hora_inicio_1 AS horaInicio1,
           u.hora_fin_1    AS fin1,
           u.hora_inicio_2 AS horaInicio2,
           u.hora_fin_2    AS fin2
         FROM usuarios u
         LEFT JOIN empresas e
           ON u.empresa_id = e.id`
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener usuarios de una empresa
router.get(
  '/users/company/:empresa_id',
  async (
    req: Request<{ empresa_id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const empresaId = Number(req.params.empresa_id);
    if (isNaN(empresaId)) {
      res.status(400).json({ message: 'empresa_id inválido' });
      return;
    }

    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT
           u.id,
           u.empresa_id,
           e.nombre      AS empresaNombre,
           u.nombre,
           u.apellidos,
           u.email,
           u.telefono,
           u.rol,
           u.activo,
           u.hora_inicio_1 AS horaInicio1,
           u.hora_fin_1    AS fin1,
           u.hora_inicio_2 AS horaInicio2,
           u.hora_fin_2    AS fin2
         FROM usuarios u
         LEFT JOIN empresas e
           ON u.empresa_id = e.id
         WHERE u.empresa_id = ?
           AND u.rol IN ('admin', 'usuario')`,
        [empresaId]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// Eliminar usuario
router.delete(
  '/users/:id',
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID de usuario inválido' });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);


export default router;
