import { Router } from 'express';
import db from '../db';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';

const router = Router();

// 🧪 Parámetros de validación
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

// ✅ GET productos
router.get('/', async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ✅ POST producto nuevo
router.post('/', async (req, res) => {
  const { numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;
  const file = req.files?.imagen;

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

// ✅ PUT actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;
  const file = req.files?.imagen;

  let imagePath = req.body.imagenActual; // mantener imagen anterior si no se sube nueva

  if (file && !Array.isArray(file)) {
    const errorValidacion = validarImagen(file as UploadedFile);
    if (errorValidacion) {
      res.status(400).json({ error: errorValidacion });
      return ;
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

// ✅ DELETE producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result]: any = await db.query(
      `DELETE FROM productos WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
     res.status(404).json({ error: 'Producto no encontrado' });
      return ;
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
});

export default router;
