import { Router, Request, Response } from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Iniciar jornada o nuevo tramo
router.post('/iniciar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id; // Cambiado a user.id

  try {
    // Buscar jornada hoy para ese usuario
    const [jornadaRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = CURDATE()',
      [userId]
    );

    let jornadaId = jornadaRows[0]?.id;

    if (!jornadaId) {
      // Crear nueva jornada hoy
      const [result]: any = await db.query(
        'INSERT INTO jornadas (usuario_id, fecha) VALUES (?, CURDATE())',
        [userId]
      );
      jornadaId = result.insertId;
    }

    // Verificar si hay tramo activo
    const [tramoAbierto] = await db.query<RowDataPacket[]>(
      'SELECT id FROM jornada_tramos WHERE jornada_id = ? AND hora_fin IS NULL',
      [jornadaId]
    );

    if (tramoAbierto.length > 0) {
      res.status(400).json({ error: 'Ya tienes un tramo activo. Finalízalo antes.' });
      return;
    }

    // Insertar tramo nuevo
    await db.query(
      'INSERT INTO jornada_tramos (jornada_id, hora_inicio) VALUES (?, NOW())',
      [jornadaId]
    );

    res.json({ mensaje: 'Tramo iniciado correctamente', jornadaId });
  } catch (err) {
    console.error('Error al iniciar jornada:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Finalizar tramo activo
router.put('/finalizar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id; // Cambiado a user.id

  try {
    const [tramoRows] = await db.query<RowDataPacket[]>(
      `SELECT jt.id, jt.jornada_id
       FROM jornada_tramos jt
       JOIN jornadas j ON jt.jornada_id = j.id
       WHERE j.usuario_id = ? AND jt.hora_fin IS NULL`,
      [userId]
    );

    const tramo = tramoRows[0];
    if (!tramo) {
      res.status(400).json({ error: 'No hay tramo activo para finalizar.' });
      return;
    }

    await db.query(
      'UPDATE jornada_tramos SET hora_fin = NOW() WHERE id = ?',
      [tramo.id]
    );

    res.json({ mensaje: 'Tramo finalizado', jornadaId: tramo.jornada_id });
  } catch (err) {
    console.error('Error al finalizar tramo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Ver si hay jornada activa
router.get('/activa', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id; // Cambiado a user.id

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT j.fecha, jt.hora_inicio 
       FROM jornada_tramos jt
       JOIN jornadas j ON jt.jornada_id = j.id
       WHERE j.usuario_id = ? AND jt.hora_fin IS NULL`,
      [userId]
    );

    if (rows.length === 0) {
      res.json({ activa: false });
      return;
    }

    const tramoActivo = rows[0];
    res.json({
      activa: true,
      fecha: tramoActivo.fecha,
      horaInicio: tramoActivo.hora_inicio
    });
  } catch (err) {
    console.error('Error consultando jornada activa:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener resumen de jornada de hoy
router.get('/hoy', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id; // Cambiado a user.id

  try {
    const [jornadaRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = CURDATE()',
      [userId]
    );

    const jornada = jornadaRows[0];
    if (!jornada) {
      res.json({ jornada: null });
      return;
    }

    const [tramos] = await db.query<RowDataPacket[]>(
      'SELECT hora_inicio, hora_fin FROM jornada_tramos WHERE jornada_id = ? ORDER BY hora_inicio',
      [jornada.id]
    );

    let totalMinutos = 0;
    for (const t of tramos) {
      if (t.hora_fin) {
        const inicio = new Date(t.hora_inicio);
        const fin = new Date(t.hora_fin);
        totalMinutos += Math.floor((fin.getTime() - inicio.getTime()) / 60000);
      }
    }

    const horasTrabajadas = (totalMinutos / 60).toFixed(2);
    const completa = totalMinutos >= 7 * 60;
    const partida = tramos.length > 1;

    res.json({
      fecha: new Date().toISOString().slice(0, 10),
      horasTrabajadas: parseFloat(horasTrabajadas),
      completa,
      incompleta: !completa,
      partida,
      tramos: tramos.map((t: any) => ({
        inicio: t.hora_inicio,
        fin: t.hora_fin
      }))
    });
  } catch (err) {
    console.error('Error al obtener jornada de hoy:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener todas las jornadas con datos del usuario
router.get('/todas', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
         j.id,
         j.usuario_id,
         u.nombre,
         j.fecha,
         MIN(jt.hora_inicio) AS hora_entrada,
         MAX(jt.hora_fin) AS hora_salida,
         CASE 
           WHEN COUNT(jt.id) > 1 THEN 'Partida' 
           ELSE 'Normal' 
         END AS tipo_jornada,
         CASE 
           WHEN TIMESTAMPDIFF(MINUTE, MIN(jt.hora_inicio), MAX(jt.hora_fin)) >= 420 THEN 'Completada'
           WHEN MAX(jt.hora_fin) IS NULL THEN 'Incompleta'
           ELSE 'Con retraso'
         END AS estado
       FROM jornadas j
       JOIN usuarios u ON j.usuario_id = u.id
       LEFT JOIN jornada_tramos jt ON jt.jornada_id = j.id
       GROUP BY j.id
       ORDER BY j.fecha DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener todas las jornadas:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/usuarios', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, apellidos, email, rol FROM usuarios WHERE activo = 1');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});
router.get('/:id/tramos', async (req: Request, res: Response) => {
  const jornadaId = parseInt(req.params.id, 10);

  try {
    const [tramos] = await db.query<RowDataPacket[]>(
      'SELECT hora_inicio AS inicio, hora_fin AS fin FROM jornada_tramos WHERE jornada_id = ? ORDER BY hora_inicio',
      [jornadaId]
    );

    res.json(tramos);
  } catch (err) {
    console.error('Error al obtener tramos:', err);
    res.status(500).json({ message: 'Error al obtener tramos' });
  }
});
router.put('/editar-tramos', async (req: Request, res: Response) => {
  const { jornadaId, tramos } = req.body;

  try {
    await db.query('DELETE FROM jornada_tramos WHERE jornada_id = ?', [jornadaId]);

    for (const t of tramos) {
      await db.query(
        'INSERT INTO jornada_tramos (jornada_id, hora_inicio, hora_fin) VALUES (?, ?, ?)',
        [jornadaId, t.inicio, t.fin || null]
      );
    }

    res.json({ mensaje: 'Tramos actualizados correctamente' });
  } catch (err) {
    console.error('Error actualizando tramos:', err);
    res.status(500).json({ error: 'Error al actualizar tramos' });
  }
});
router.delete('/:id', async (req: Request, res: Response) => {
  const jornadaId = parseInt(req.params.id, 10);

  try {
    // Borra primero los tramos (por FK si corresponde)
    await db.query('DELETE FROM jornada_tramos WHERE jornada_id = ?', [jornadaId]);

    // Luego la jornada
    await db.query('DELETE FROM jornadas WHERE id = ?', [jornadaId]);

    res.json({ mensaje: 'Jornada eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar jornada:', err);
    res.status(500).json({ error: 'Error interno al eliminar jornada' });
  }
});

export default router;
