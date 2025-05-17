import { Router, Request, Response, NextFunction } from 'express';
import { ResultSetHeader } from 'mysql2';
import multer from 'multer';
import path from 'path';
import db from '../db';

const router = Router();

interface NewCompanyBody{
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
    // Ejecuta la consulta
    const [empresas] = await db.query('SELECT * FROM empresas');
    // Devuelve el resultado
    res.json(empresas);
  } catch (err) {
    console.error('Error al leer empresas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


router.post(
  '/newCompany',
  async (
    req: Request<{}, {}, NewCompanyBody>,
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


export default router;
