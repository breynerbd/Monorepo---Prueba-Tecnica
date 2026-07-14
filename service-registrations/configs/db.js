'use strict';
 
import mongoose from 'mongoose';
 
export const connectDB = async () => {
    try {
        // Escucha eventos de la conexión para debuguear
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB | No se pudo conectar a MongoDB:', err);
            mongoose.disconnect();
        });
 
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | Intentando conectar...');
        });
 
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Conectado a MongoDB correctamente');
        });
 
        mongoose.connection.on('open', () => {
            console.log('MongoDB | Conectado a la base de datos: registrations');
        });
 
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | Reconectado a la base de datos');
        });
 
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Conexión finalizada');
        });
 
        // Conexión a la base de datos local o de Atlas
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/service_registrations');
 
    } catch (error) {
        console.error('MongoDB | Error en la conexión inicial:', error);
    }
};