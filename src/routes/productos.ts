// Importamos los componentes necesarios
import { Router, Request, Response } from 'express';
import db from '../db';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import verifyToken from '../middleware/verifytoken';

const router = Router();
router.use(verifyToken); // Proteger todas las rutas con JWT

// Parámetros de validación
const EXTENSIONES_VALIDAS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_TAMANO_IMAGEN = 2 * 1024 * 1024; // 2MB

function validarImagen(file: UploadedFile): string | null {
  const ext = path.extname(file.name).toLowerCase();
  if (!EXTENSIONES_VALIDAS.includes(ext)) return 'Extensión de imagen no válida.';
  if (file.size > MAX_TAMANO_IMAGEN) return 'Tamaño de imagen excedido (máx. 2MB).';
  return null;
}

function guardarImagen(file: UploadedFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadDir = path.resolve('uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const uploadPath = path.join(uploadDir, safeName);

    file.mv(uploadPath, err => {
      if (err) return reject(err);
      resolve(`/uploads/${safeName}`);
    });
  });
}

// Obtener todos los productos (filtrados por empresa si no es superadmin)
router.get('/', async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    let query = `
      SELECT p.*, e.nombre AS empresa
      FROM productos p
      LEFT JOIN empresas e ON p.numEmpresa = e.id
    `;
    const params: any[] = [];

    if (user.rol !== 'superadmin') {
      query += ' WHERE p.numEmpresa = ?';
      params.push(user.empresa_id);
    }

    const [rows]: any = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});


// Crear un nuevo producto
router.post('/', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;
  const file = req.files?.imagen;

  const numEmpresa = user.rol === 'superadmin' ? req.body.numEmpresa : user.empresa_id;

  if (!numEmpresa || !nombre || cantidad == null || !unidad || !categoria || precio == null) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }

  let imagePath = null;
  if (file && !Array.isArray(file)) {
    const errorValidacion = validarImagen(file as UploadedFile);
    if (errorValidacion) {
      res.status(400).json({ error: errorValidacion });
      return;
    }
    try {
      imagePath = await guardarImagen(file as UploadedFile);
    } catch (err) {
      console.error('Error al guardar la imagen:', err);
      res.status(500).json({ error: 'Error al guardar la imagen' });
      return;
    }
  }

  try {
    const [result]: any = await db.query(
      `INSERT INTO productos (numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio, imagePath]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno al crear producto' });
  }
});

// Actualizar un producto
router.put('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;
  const file = req.files?.imagen;

  const numEmpresa = user.rol === 'superadmin' ? req.body.numEmpresa : user.empresa_id;
  let imagePath = req.body.imagenActual;

  if (file && !Array.isArray(file)) {
    const errorValidacion = validarImagen(file as UploadedFile);
    if (errorValidacion) {
      res.status(400).json({ error: errorValidacion });
      return;
    }
    try {
      imagePath = await guardarImagen(file as UploadedFile);
    } catch (err) {
      console.error('Error al guardar la imagen:', err);
      res.status(500).json({ error: 'Error al guardar la imagen' });
      return;
    }
  }

  try {
    const [result]: any = await db.query(
      `UPDATE productos
       SET numEmpresa = ?, nombre = ?, descripcion = ?, cantidad = ?, unidad = ?, categoria = ?, precio = ?, imagen = ?
       WHERE id = ?`,
      [numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio, imagePath, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno al actualizar producto' });
  }
});

// Eliminar un producto
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result]: any = await db.query('DELETE FROM productos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
});

export default router;
