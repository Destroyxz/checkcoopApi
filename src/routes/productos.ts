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
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio } = req.body;

  if (!numEmpresa || !nombre || cantidad == null || !unidad || !categoria || precio == null) {
    res.status(400).json({ error: 'Faltan campos obligatorios para actualizar' });
    return;
  }

  try {
    const [result]: any = await db.query(
      `UPDATE productos 
       SET numEmpresa = ?, nombre = ?, descripcion = ?, cantidad = ?, unidad = ?, categoria = ?, precio = ?
       WHERE id = ?`,
      [numEmpresa, nombre, descripcion, cantidad, unidad, categoria, precio, id]
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

// ✅ Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result]: any = await db.query(
      `DELETE FROM productos WHERE id = ?`,
      [id]
    );

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
