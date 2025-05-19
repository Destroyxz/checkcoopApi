import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import multer from 'multer';
import path from 'path';
import db from '../db';

const router = Router();

interface company{
    nombre: string,
    razon_social: string,
    cif: string,
    telefono: string,
    direccion: string,
    email: string,
    numero: number,
}

router.get('/allcompanies', async (req, res) => {
  try {
    const [empresas] = await db.query('SELECT * FROM empresas');
    res.json(empresas);
  } catch (err) {
    console.error('Error al leer empresas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Crear una empresa
router.post(
  '/newCompany',
  async (
    req: Request<{}, {}, company>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const {
      nombre,
      razon_social,
      cif,
      email,
      telefono,
      direccion,
    } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !razon_social || !direccion || !cif) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }
    if (!/^\d{9}$/.test(telefono)) {
      res.status(400).json({ message: 'Teléfono debe tener 9 dígitos' });
      return;
    }

    try {
      // Insertar nueva empresa
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO empresas
          (nombre, razon_social, nif_cif, direccion, email_contacto, telefono)
         VALUES (?, ?, ?, ?, ?, ?)`, 
        [
          nombre,
          razon_social,
          cif,
          direccion,
          email,
          telefono
        ]
      );

      // Respuesta
      res.status(201).json({
        id: result.insertId,
        nombre,
        razon_social,
        cif,
        email_contacto: email,
        telefono,
        direccion,
      });
    } catch (err) {
      next(err);
    }
  }
);


//Obtener todas las empresas
router.get(
  '/empresas',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT
          e.id,
          e.nombre,
          e.razon_social,
          e.nif_cif,
          e.direccion,
          e.email_contacto,
          e.telefono,
          e.created_at,
          e.updated_at,
          COALESCE(u.cnt,0) AS userCount
        FROM empresas e
        /* derivamos un map empresa_id → count */
        LEFT JOIN (
          SELECT empresa_id, COUNT(*) AS cnt
          FROM usuarios
          GROUP BY empresa_id
        ) AS u ON u.empresa_id = e.id
        `
      );

      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener una empresa por ID con el recuento de usuarios
router.get(
  '/empresas/:empresa_id',
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
        `
        SELECT
          e.id,
          e.nombre,
          e.razon_social,
          e.nif_cif,
          e.direccion,
          e.email_contacto,
          e.telefono,
          e.created_at,
          e.updated_at,
          COALESCE(u.cnt,0) AS userCount
        FROM empresas e
        LEFT JOIN (
          SELECT empresa_id, COUNT(*) AS cnt
          FROM usuarios
          GROUP BY empresa_id
        ) AS u ON u.empresa_id = e.id
        WHERE e.id = ?
        `,
        [empresaId]
      );
      if (rows.length === 0) {
        res.status(404).json({ message: 'Empresa no encontrada' });
        return;
      }
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

//Elimina una empresa por ID
router.delete(
  '/empresas/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: 'ID de empresa inválido' });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM empresas WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Empresa no encontrada' });
        return;
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
