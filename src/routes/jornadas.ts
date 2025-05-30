/*Componente que permite iniciar tramos y jornadas, modificarlas
detenerlas, obtener datos y eliminarlas.  */

//Importamos las interfaces necesarias de los modulos
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

    //Mensaje de error si hay tramos activos
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
  const userId = user.id;

  try {
    // Obtener tramo activo
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

    // Cerrar tramo actual
    await db.query('UPDATE jornada_tramos SET hora_fin = NOW() WHERE id = ?', [tramo.id]);

    // Obtener tramos completos
    const [tramos] = await db.query<RowDataPacket[]>(
      'SELECT hora_inicio, hora_fin FROM jornada_tramos WHERE jornada_id = ? ORDER BY hora_inicio',
      [tramo.jornada_id]
    );

    // Obtener horario esperado del usuario
    const [usuarioRows] = await db.query<RowDataPacket[]>(
      'SELECT hora_inicio_1, hora_fin_1, hora_inicio_2, hora_fin_2 FROM usuarios WHERE id = ?',
      [userId]
    );
    const horario = usuarioRows[0];

    const calcularMinutos = (ini: string, fin: string) => {
      const [h1, m1] = ini.split(':').map(Number);
      const [h2, m2] = fin.split(':').map(Number);
      return (h2 * 60 + m2) - (h1 * 60 + m1);
    };

    let esperados = 0;
    if (horario.hora_inicio_1 && horario.hora_fin_1)
      esperados += calcularMinutos(horario.hora_inicio_1, horario.hora_fin_1);
    if (horario.hora_inicio_2 && horario.hora_fin_2)
      esperados += calcularMinutos(horario.hora_inicio_2, horario.hora_fin_2);

    let totalMin = 0;
    for (const t of tramos) {
      if (t.hora_fin) {
        const ini = new Date(t.hora_inicio);
        const fin = new Date(t.hora_fin);
        totalMin += Math.floor((fin.getTime() - ini.getTime()) / 60000);
      }
    }

    const completa = totalMin >= esperados;
    const partida = tramos.length > 1;
    const llegoTarde = tramos.length > 0 && new Date(tramos[0].hora_inicio).getHours() > parseInt(horario.hora_inicio_1.split(':')[0]);

    await db.query(
      `UPDATE jornadas SET 
        hora_entrada = ?, 
        hora_salida = ?, 
        total_minutos = ?, 
        cumplio_jornada = ?, 
        llego_tarde = ?, 
        partida = ? 
       WHERE id = ?`,
      [
        tramos[0]?.hora_inicio || null,
        tramos[tramos.length - 1]?.hora_fin || null,
        totalMin,
        completa ? 1 : 0,
        llegoTarde ? 1 : 0,
        partida ? 1 : 0,
        tramo.jornada_id
      ]
    );

    res.json({ mensaje: 'Tramo finalizado y jornada actualizada', jornadaId: tramo.jornada_id });
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
  const userId = user.id;

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

    const [usuarioRows] = await db.query<RowDataPacket[]>(
      'SELECT hora_inicio_1, hora_fin_1, hora_inicio_2, hora_fin_2 FROM usuarios WHERE id = ?',
      [userId]
    );

    const userHorario = usuarioRows[0];

    // Calcula los minutos esperados según el horario
    const calcularMinutos = (ini: string, fin: string) => {
      const [h1, m1] = ini.split(':').map(Number);
      const [h2, m2] = fin.split(':').map(Number);
      return (h2 * 60 + m2) - (h1 * 60 + m1);
    };

    let minutosEsperados = 0;
    if (userHorario.hora_inicio_1 && userHorario.hora_fin_1) {
      minutosEsperados += calcularMinutos(userHorario.hora_inicio_1, userHorario.hora_fin_1);
    }
    if (userHorario.hora_inicio_2 && userHorario.hora_fin_2) {
      minutosEsperados += calcularMinutos(userHorario.hora_inicio_2, userHorario.hora_fin_2);
    }

    // Total de minutos reales trabajados
    let totalMinutos = 0;
    for (const t of tramos) {
      if (t.hora_fin) {
        const inicio = new Date(t.hora_inicio);
        const fin = new Date(t.hora_fin);
        totalMinutos += Math.floor((fin.getTime() - inicio.getTime()) / 60000);
      }
    }

    const horasTrabajadas = parseFloat((totalMinutos / 60).toFixed(2));
    const completa = totalMinutos >= minutosEsperados;
    const partida = tramos.length > 1;
    const llegoTarde = tramos.length > 0 && new Date(tramos[0].hora_inicio).getHours() > parseInt(userHorario.hora_inicio_1.split(':')[0]);

    res.json({
  fecha: new Date().toISOString().slice(0, 10),
  horasTrabajadas,
  completa,
  incompleta: !completa,
  partida,
  llegoTarde,
  jornadaPartida: userHorario.hora_inicio_2 !== null && userHorario.hora_fin_2 !== null,
  hora_inicio_1: userHorario.hora_inicio_1,
  hora_fin_1: userHorario.hora_fin_1,
  hora_inicio_2: userHorario.hora_inicio_2,
  hora_fin_2: userHorario.hora_fin_2,
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
  const user = (req as any).user;
  const empresaId = user.empresa_id;

  try {
       const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         j.id AS jornada_id,
         j.usuario_id,
         j.fecha,
         u.nombre,
         u.hora_inicio_1,
         u.hora_fin_1,
         u.hora_inicio_2,
         u.hora_fin_2
       FROM jornadas j
       JOIN usuarios u ON j.usuario_id = u.id
       WHERE u.empresa_id = ?
       ORDER BY j.fecha DESC`,
      [empresaId]
    );


    const resultados = [];

    for (const jornada of rows) {
      // Obtener tramos de la jornada
      const [tramos] = await db.query<RowDataPacket[]>(
        'SELECT hora_inicio, hora_fin FROM jornada_tramos WHERE jornada_id = ? ORDER BY hora_inicio',
        [jornada.jornada_id]
      );

      // Calcular minutos esperados según el horario del usuario
      const calcularMinutos = (ini: string, fin: string) => {
        const [h1, m1] = ini.split(':').map(Number);
        const [h2, m2] = fin.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
      };

      let minutosEsperados = 0;
      if (jornada.hora_inicio_1 && jornada.hora_fin_1) {
        minutosEsperados += calcularMinutos(jornada.hora_inicio_1, jornada.hora_fin_1);
      }
      if (jornada.hora_inicio_2 && jornada.hora_fin_2) {
        minutosEsperados += calcularMinutos(jornada.hora_inicio_2, jornada.hora_fin_2);
      }

      // Calcular minutos reales trabajados
      let totalMinutos = 0;
      for (const t of tramos) {
        if (t.hora_fin) {
          const inicio = new Date(t.hora_inicio);
          const fin = new Date(t.hora_fin);
          totalMinutos += Math.floor((fin.getTime() - inicio.getTime()) / 60000);
        }
      }

      const completa = totalMinutos >= minutosEsperados;
      const partida = tramos.length > 1;
      const incompleta = tramos.length === 0 || tramos.some(t => t.hora_fin === null);
      const llegoTarde = tramos.length > 0 && new Date(tramos[0].hora_inicio).getHours() > parseInt(jornada.hora_inicio_1.split(':')[0]);

      const estado = incompleta
        ? 'Incompleta'
        : completa
        ? 'Completada'
        : 'Con retraso';

      resultados.push({
        id: jornada.jornada_id,
        usuario_id: jornada.usuario_id,
        nombre: jornada.nombre,
        fecha: jornada.fecha,
        hora_entrada: tramos[0]?.hora_inicio || null,
        hora_salida: tramos[tramos.length - 1]?.hora_fin || null,
        tipo_jornada: partida ? 'Partida' : 'Normal',
        estado
      });
    }

    res.json(resultados);
  } catch (err) {
    console.error('Error al obtener todas las jornadas:', err);
    res.status(500).json({ error: 'Error interno' });
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
if (!Array.isArray(tramos) || tramos.length === 0) {
   res.status(400).json({ error: 'Debe haber al menos un tramo.' });
   return;
}

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
