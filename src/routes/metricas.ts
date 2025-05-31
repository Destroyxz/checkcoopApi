import { Router, Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';

const router = Router();

// --- Usuarios ---
// Total de usuarios registrados
type CountResult = { total: number };
router.get(
  '/users/total',

  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [[{ total_users }]] = await db.query<RowDataPacket[][]>(
        `SELECT COUNT(*) AS total_users FROM usuarios`
      ) as unknown as Array<Array<{ total_users: number }>>;
      res.json({ total_users });
    } catch (err) {
      next(err);
    }
  }
);

// Usuarios activos (al menos 1 jornada en el rango)
router.get(
  '/users/active', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as { from: string; to: string };


      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT usuario_id) AS active_users
         FROM jornadas
         WHERE fecha BETWEEN ? AND ?`,
        [from, to]
      );
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// Usuarios nuevos agrupados por periodo
type PeriodCount = { period: string; new_users: number };
router.get(
  '/users/new', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(created_at, '${dateFmt}') AS period, COUNT(*) AS new_users
         FROM usuarios
         WHERE created_at BETWEEN ? AND ?
         GROUP BY period`,
        [from, to]
      );
      res.json(rows as PeriodCount[]);
    } catch (err) {
      next(err);
    }
  }
);

// Logins por periodo
router.get(
  '/users/last-login', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(last_login, '${dateFmt}') AS period, COUNT(*) AS logins
         FROM usuarios
         WHERE last_login BETWEEN ? AND ?
         GROUP BY period`,
        [from, to]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// --- Empresas ---
router.get(
  '/companies/total',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [[{ total_companies }]] = await db.query<RowDataPacket[][]>(
        `SELECT COUNT(*) AS total_companies FROM empresas`
      ) as unknown as Array<Array<{ total_companies: number }>>;
      res.json({ total_companies });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/companies/new', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(created_at, '${dateFmt}') AS period, COUNT(*) AS new_companies
         FROM empresas
         WHERE created_at BETWEEN ? AND ?
         GROUP BY period`,
        [from, to]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// --- Jornadas ---
router.get(
  '/jornadas/average-duration', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as { from: string; to: string };

      const [[{ average_duration }]] = await db.query<RowDataPacket[][]>(
        `SELECT AVG(total_minutos) AS average_duration
         FROM jornadas
         WHERE fecha BETWEEN ? AND ?`,
        [from, to]
      ) as unknown as Array<Array<{ average_duration: number }>>;
      res.json({ average_duration });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/jornadas/late-rate', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(fecha, '${dateFmt}') AS period,
             SUM(llego_tarde = 1) * 100.0 / NULLIF(COUNT(*), 0) AS late_rate

         FROM jornadas
         WHERE fecha BETWEEN ? AND ?
         GROUP BY period`,
        [from, to]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/jornadas/compliance-rate', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };

      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;

      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT 
          DATE_FORMAT(j.fecha, '${dateFmt}') AS period,
          SUM(
            j.total_minutos >= 
            (
              TIME_TO_SEC(TIMEDIFF(u.hora_fin_1, u.hora_inicio_1)) / 60 +
              IF(
                u.hora_inicio_2 IS NOT NULL AND u.hora_fin_2 IS NOT NULL AND u.hora_inicio_2 != '00:00:00' AND u.hora_fin_2 != '00:00:00',
                TIME_TO_SEC(TIMEDIFF(u.hora_fin_2, u.hora_inicio_2)) / 60,
                0
              )
            )
          ) * 100.0 / COUNT(*) AS compliance_rate
        FROM jornadas j
        JOIN usuarios u ON j.usuario_id = u.id
        WHERE j.fecha BETWEEN ? AND ?
        GROUP BY period
        `,
        [from, to]
      );

      res.json(rows);
    } catch (err) {
      console.error('Error en compliance-rate:', err);
      next(err);
    }
  }
);

router.get(
  '/jornadas/total-minutes', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const formatMap: Record<string, string> = {
        day: '%Y-%m-%d',
        week: '%x-%v',
        month: '%Y-%m-01'
      };
      const dateFmt = formatMap[group_by] || formatMap.day;
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(fecha, '${dateFmt}') AS period,
                SUM(total_minutos) AS total_minutes
         FROM jornadas
         WHERE fecha BETWEEN ? AND ?
         GROUP BY period`,
        [from, to]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// Media de tramos por jornada
router.get(
  '/jornadas/tramos/average-count', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.query as { from: string; to: string };


      const [[{ average_count }]] = await db.query<RowDataPacket[][]>(
        `SELECT AVG(count_tramos) AS average_count FROM (
           SELECT COUNT(*) AS count_tramos
           FROM jornada_tramos tr
           JOIN jornadas j ON tr.jornada_id = j.id
           WHERE j.fecha BETWEEN ? AND ?
           GROUP BY tr.jornada_id
         ) sub`,
        [from, to]
      ) as unknown as Array<Array<{ average_count: number }>>;
      res.json({ average_count });
    } catch (err) {
      next(err);
    }
  }
);

// Distribución de duración de tramos en buckets de 15 min
router.get(
  '/jornadas/tramos/duration-distribution', validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, group_by = 'day' } = req.query as { from: string; to: string; group_by?: string };
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT FLOOR(TIMESTAMPDIFF(MINUTE, hora_inicio, hora_fin)/15)*15 AS bucket,
                COUNT(*) AS count
         FROM jornada_tramos tr
         JOIN jornadas j ON tr.jornada_id = j.id
         WHERE j.fecha BETWEEN ? AND ?
         GROUP BY bucket`,
        [from, to]
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

// --- Productos ---
router.get(
  '/products/stock-levels',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT id, nombre, cantidad, unidad FROM productos`
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/products/total-stock-value',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [[{ inventory_value }]] = await db.query<RowDataPacket[][]>(
        `SELECT SUM(cantidad * precio) AS inventory_value FROM productos`
      ) as unknown as Array<Array<{ inventory_value: number }>>;
      res.json({ inventory_value });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/products/by-category',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT categoria,
                SUM(cantidad) AS total_quantity,
                SUM(cantidad * precio) AS total_value
         FROM productos
         GROUP BY categoria`
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

function validateDateRange(req: Request, res: Response, next: NextFunction) {
  const { from, to } = req.query;

  const isValidDate = (d: any) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);

  if (!isValidDate(from) || !isValidDate(to)) {
    res.status(400).json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD' });
    return;
  }

  next();
}

export default router;



