import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db';

const router = Router();


// GET /usuarios/total
router.get('/usuarios/total', async (req, res) => {
  try {
    const [rows]: any = await db.query(`
      SELECT COUNT(*) AS totalUsuarios
      FROM usuarios
    `);
    // rows[0].totalUsuarios contendrá el número total
    res.json({ totalUsuarios: rows[0].totalUsuarios });
  } catch (error) {
    console.error('Error al obtener total de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener total de usuarios' });
  }
});


// GET /usuarios/total/:empresa_id
router.get('/usuarios/total/:empresa_id', async (req, res: any) => {
  const empresaId = Number(req.params.empresa_id);
  if (isNaN(empresaId)) {
    return res.status(400).json({ error: 'empresa_id inválido' });
  }

  try {
    const [rows]: any = await db.query(
      `
      SELECT COUNT(*) AS totalUsuarios
      FROM usuarios
      WHERE empresa_id = ?
      `,
      [empresaId]
    );
    res.json({ empresa_id: empresaId, totalUsuarios: rows[0].totalUsuarios });
  } catch (error) {
    console.error('Error al obtener total de usuarios por empresa:', error);
    res.status(500).json({ error: 'Error al obtener total de usuarios por empresa' });
  }
});


// GET /usuarios/por-dia
router.get('/usuarios/por-dia', async (req, res) => {
  try {
    const [rows]: any = await db.query(`
      SELECT
        DATE(created_at) AS fecha,
        COUNT(*) AS cantidad
      FROM usuarios
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // Transformamos a la forma { fecha: 'YYYY-MM-DD', cantidad: X }
    const data = rows.map((r: any) => ({
      fecha: r.fecha,      // por ejemplo '2025-06-25'
      cantidad: r.cantidad // por ejemplo 10
    }));

    res.json(data);
  } catch (error) {
    console.error('Error al obtener usuarios por día:', error);
    res.status(500).json({ error: 'Error al obtener usuarios por día' });
  }
});


// GET /usuarios/por-dia/:empresa_id
router.get('/usuarios/por-dia/:empresa_id', async (req, res:any) => {
  const empresaId = Number(req.params.empresa_id);
  if (isNaN(empresaId)) {
    return res.status(400).json({ error: 'empresa_id inválido' });
  }

  try {
    const [rows]: any = await db.query(
      `
      SELECT
        DATE(created_at) AS fecha,
        COUNT(*) AS cantidad
      FROM usuarios
      WHERE empresa_id = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
      `,
      [empresaId]
    );

    const data = rows.map((r: any) => ({
      fecha: r.fecha,
      cantidad: r.cantidad
    }));

    res.json({ empresa_id: empresaId, data });
  } catch (error) {
    console.error('Error al obtener usuarios por día por empresa:', error);
    res.status(500).json({ error: 'Error al obtener usuarios por día por empresa' });
  }
});


// GET /empresas/total
router.get('/empresas/total', async (req, res) => {
  try {
    const [rows]: any = await db.query(`
      SELECT COUNT(*) AS totalEmpresas
      FROM empresas
    `);
    res.json({ totalEmpresas: rows[0].totalEmpresas });
  } catch (error) {
    console.error('Error al obtener total de empresas:', error);
    res.status(500).json({ error: 'Error al obtener total de empresas' });
  }
});


// GET /productos/bajo-stock/:empresa_id
router.get('/productos/bajo-stock/:empresa_id', async (req, res:any) => {
  const empresaId = Number(req.params.empresa_id);
  if (isNaN(empresaId)) {
    return res.status(400).json({ error: 'empresa_id inválido' });
  }

  try {
    const [rows]: any = await db.query(
      `
      SELECT nombre, cantidad
      FROM productos
      WHERE numEmpresa = ?
        AND cantidad < 100
      ORDER BY nombre ASC
      `,
      [empresaId]
    );

    // Devolver solo los campos deseados, por ejemplo:
    // [{ nombre: "Clavos", cantidad: 75 }, { nombre: "Tornillos", cantidad: 45 }, …]
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos bajo stock:', error);
    res.status(500).json({ error: 'Error al obtener productos bajo stock' });
  }
})

export default router;