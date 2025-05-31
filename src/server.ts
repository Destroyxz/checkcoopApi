// Importamos los archivos necesarios
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import productosRouter from './routes/productos';
import tareasRoutes from './routes/tareas';
import fileUpload from 'express-fileupload';

import verifyToken from './middleware/verifytoken';
import jornadasRouter from './routes/jornadas';
import authRouter from './routes/auth';
import companiesRouter from './routes/companies'
import userRouter from './routes/user'
import metricasRouter from './routes/metricas';
const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

//Para subir imagenes
app.use('/uploads', express.static('uploads')); 
app.use(fileUpload());
// Endpoints
app.use('/auth', authRouter);
app.use('/jornadas',  verifyToken, jornadasRouter); 
app.use('/company', companiesRouter )
app.use('/user', userRouter )
app.use('/api/tareas',verifyToken, tareasRoutes)
app.use('/productos', productosRouter);
app.use('/metricas', metricasRouter)

// Para comprobar que todo funciona correctamente
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

// 404 handler (debe ir al final)
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
