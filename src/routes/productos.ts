// routes/productos.ts
import { Router } from 'express';
import db from '../db';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ✅ NUEVO: POST /productos para agregar productos
router.post('/', async (req, res) => {
  const { numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;

  if (!numEmpresa || !nombre || cantidad == null || !unidad || !categoria || precio == null) {
   res.status(400).json({ error: 'Faltan campos obligatorios (incluyendo precio)' })
   return ;
  }
  

  try {
    const [result]: any = await db.query(
      `INSERT INTO productos (numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio]
    );
    res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno al crear producto' });
  }
});

export default router;
