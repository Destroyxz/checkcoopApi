//Importamos las dependencias necesarias
import { Router, Request, Response } from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';
import verifyToken from '../middleware/verifytoken';

const router = Router();
router.use(verifyToken); // Protegemos todas las rutas

// Función para formatear la fecha correctamente
function formatFecha(fechaIso: string): string {
  const date = new Date(fechaIso);
  if (isNaN(date.getTime())) throw new Error('Fecha inválida');
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
}

// Obtener todas las tareas con información del usuario asignado
router.get('/', async (req: Request, res: Response) => {
  const user = (req as any).user;

  try {
    let query = `
  SELECT t.*, u.nombre AS asignadoNombre, e.nombre AS empresa
  FROM tareas t
  LEFT JOIN usuarios u ON t.usuario_id = u.id
  LEFT JOIN empresas e ON t.empresa_id = e.id
`;

    const params: any[] = [];

    if (user.rol !== 'superadmin') {
      query += ' WHERE t.empresa_id = ?';
      params.push(user.empresa_id);
    }

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener tareas:', err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Crear nueva tarea
router.post('/', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { usuario_id, fecha, titulo, descripcion, estado, prioridad } = req.body;

  if (!usuario_id || !fecha || !titulo) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }

  let fechaFormateada: string;
  try {
    fechaFormateada = formatFecha(fecha);
  } catch (e) {
    res.status(400).json({ error: 'Formato de fecha inválido' });
    return;
  }

  // Si es superadmin se permite definir empresa_id, si no se fuerza su empresa
  const empresa_id = user.rol === 'superadmin' ? req.body.empresa_id : user.empresa_id;

  try {
    const [result]: any = await db.query(
      `INSERT INTO tareas (usuario_id, empresa_id, fecha, titulo, descripcion, estado, prioridad)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, empresa_id, fechaFormateada, titulo, descripcion || null, estado || 'pendiente', prioridad || 'media']
    );

    res.status(201).json({ id: result.insertId, mensaje: 'Tarea creada correctamente' });
  } catch (err) {
    console.error('Error al crear tarea:', err);
    res.status(500).json({ error: 'Error interno al crear tarea' });
  }
});

// Eliminar tarea
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [result]: any = await db.query('DELETE FROM tareas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

// Editar tarea
router.put('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id, 10);
  const { usuario_id, fecha, titulo, descripcion, estado, prioridad } = req.body;

  if (!usuario_id || !fecha || !titulo) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }

  const empresa_id = user.rol === 'superadmin' ? req.body.empresa_id : user.empresa_id;

  let fechaFormateada: string;
  try {
    fechaFormateada = formatFecha(fecha);
  } catch (e) {
    res.status(400).json({ error: 'Formato de fecha inválido' });
    return;
  }

  try {
    const [result]: any = await db.query(
      `UPDATE tareas 
       SET usuario_id = ?, empresa_id = ?, fecha = ?, titulo = ?, descripcion = ?, estado = ?, prioridad = ?, updated_at = NOW()
       WHERE id = ?`,
      [usuario_id, empresa_id, fechaFormateada, titulo, descripcion || null, estado || 'pendiente', prioridad || 'media', id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }

    res.json({ mensaje: 'Tarea actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Obtener tareas de un usuario específico
router.get('/usuario/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'ID de usuario inválido' });
    return;
  }

  try {
    let query = `
      SELECT t.*, u.nombre AS asignadoNombre
      FROM tareas t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.usuario_id = ?
    `;
    const params: any[] = [userId];

    if (user.rol !== 'superadmin') {
      query += ' AND t.empresa_id = ?';
      params.push(user.empresa_id);
    }

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener tareas por usuario:', err);
    res.status(500).json({ error: 'Error al obtener tareas por usuario' });
  }
});

export default router;
