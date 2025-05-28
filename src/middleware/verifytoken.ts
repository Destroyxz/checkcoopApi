/*
Este componente lo que hace es verificar el token  del usuario 
para proteger la integridad de los datos
*/
//Importamos las interfaces necesarias de los modulos
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Clave secreta para verificar los tokens JWT. Se toma de las variables de entorno,
// y si no existe, se usa un valor por defecto
const JWT_SECRET = process.env.JWT_SECRET || 'UseroNoTieneNiIdeaDeAngular';

//Funcion para verificar si el token esta autorizado o no
function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  //Error que lanza si no recibe bien el token
  if (!authHeader) {
    res.status(401).json({ message: 'No se recibió token' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  //Error que lanza si el formato del token se altero o es inválido
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  //Verificamos si el token es valido
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(403).json({ message: 'Token no válido o expirado' });
      return;
    }
    // Si todo va bien, añadimos el payload del token al objeto
    (req as any).user = payload;
    // Continuamos con la siguiente función del middleware
    next();
  });
}
// Exportamos el middleware para usarlo en otras partes del proyecto
export default verifyToken;
