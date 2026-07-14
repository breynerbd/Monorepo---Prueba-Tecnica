'use strict';
 
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { handleErrors } from '../middlewares/handle-errors.js';
import registrationRoutes from '../src/registrations/registration.routes.js';
 
const app = express();
 
// Configuración de middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Permite peticiones cruzadas desde el Frontend
app.use(helmet()); // Seguridad HTTP headers
app.use(morgan('dev')); // Log de peticiones en consola
 
// Definición de rutas base para el Servicio B
app.use('/registrations/v1', registrationRoutes);
 
// Manejador central de errores (Debe ser el último middleware)
app.use(handleErrors);
 
export default app;