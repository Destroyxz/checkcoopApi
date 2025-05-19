import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db';

// Tipado del cuerpo de la petición
interface UpdateProfileBody {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}

// Tipado de la fila de usuario desde la BD
interface UserRow {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password_hash: string;
  rol: string;
  activo: number;
  profilePicture: string | null;  // Ruta de la imagen de perfil
}

const router = Router();

// Configuración de multer para la carga de archivos (imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directorio donde se guardarán las imágenes
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo (añadir fecha y extensión original)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// PUT /profile/update: Actualiza los datos del perfil (y la imagen si se carga una nueva)
router.put(
  '/profile/update/:id',  // ID del usuario en la URL
  async (req: Request<{ id: string }, {}, UpdateProfileBody>, res: Response, next: NextFunction): Promise<void> => {
    const { nombre, apellidos, email, rol } = req.body;
    const userId = req.params.id;  // Obtener el `userId` de los parámetros de la URL

    if (!userId) {
      res.status(400).json({ message: 'ID de usuario requerido' });
      return;
    }

    try {
      // Actualizar los datos del perfil en la base de datos
      await db.execute(
        'UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, rol = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nombre, apellidos, email, rol, userId]
      );

      res.status(200).json({
        message: 'Perfil actualizado correctamente',
        user: { nombre, apellidos, email, rol },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
