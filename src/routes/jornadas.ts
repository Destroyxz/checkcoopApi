import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';

const router = Router();

router.post('/',   async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
  const { usuario_id, horaEntrada, horaSalida } = req.body;

  if (!usuario_id || !horaEntrada || !horaSalida) {
   res.status(400).json({ message: 'Faltan datos' });
   return 
  }

  const fecha = new Date().toISOString().slice(0, 10);

  try {
    // Paso 1: Obtener horarios del usuario
    const [usuarios]: any = await db.query(
      'SELECT hora_inicio_1, hora_fin_1, hora_inicio_2, hora_fin_2 FROM usuarios WHERE id = ?',
      [usuario_id]
    );
    

    if (!usuarios.length) {
      res.status(404).json({ message: 'Usuario no encontrado' }) ;
      return 
    } 

    const { hora_inicio_1, hora_fin_1, hora_inicio_2, hora_fin_2 } = usuarios[0];

    // Paso 2: Calcular duración mínima obligatoria
    const totalHorasObjetivo = (
        (new Date(`1970-01-01T${hora_fin_1}Z`).getTime() - new Date(`1970-01-01T${hora_inicio_1}Z`).getTime()) +
        (new Date(`1970-01-01T${hora_fin_2}Z`).getTime() - new Date(`1970-01-01T${hora_inicio_2}Z`).getTime())
      ) / 3600000;
      

    // Paso 3: Calcular horas reales trabajadas
    const entrada = new Date(horaEntrada);
    const salida = new Date(horaSalida);
    const horasTrabajadas = (salida.getTime() - entrada.getTime()) / 3600000;

    // Paso 4: Validaciones
    const llegoTarde = horaEntrada.slice(11, 19) > hora_inicio_1 ? 1 : 0;
    const cumplioJornada = horasTrabajadas >= totalHorasObjetivo ? 1 : 0;

    // Paso 5: Formatear duración
    const horas = Math.floor(horasTrabajadas);
    const minutos = Math.floor((horasTrabajadas - horas) * 60);
    const duracion = `${horas}h ${minutos}m`;

    // Paso 6: Ver si ya hay jornada
    const [existing]: any = await db.query(
      'SELECT id FROM jornadas WHERE usuario_id = ? AND fecha = ?',
      [usuario_id, fecha]
    );

    if (existing.length > 0) {
      await db.query(`
        UPDATE jornadas
        SET hora_entrada = ?, hora_salida = ?, duracion = ?, llego_tarde = ?, cumplio_jornada = ?, updated_at = NOW()
        WHERE usuario_id = ? AND fecha = ?
      `, [horaEntrada, horaSalida, duracion, llegoTarde, cumplioJornada, usuario_id, fecha]);
    } else {
      await db.query(`
        INSERT INTO jornadas (usuario_id, fecha, hora_entrada, hora_salida, duracion, llego_tarde, cumplio_jornada)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [usuario_id, fecha, horaEntrada, horaSalida, duracion, llegoTarde, cumplioJornada]);
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Error en POST /jornadas:', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

export default router;
