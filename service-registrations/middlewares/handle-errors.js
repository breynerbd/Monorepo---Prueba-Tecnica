'use strict';
 
export const handleErrors = (err, req, res, next) => {
    console.error('❌ Error capturado en el Servidor de Inscripciones:', err);
 
    // Manejo de errores específicos de Mongoose (Duplicados de índices únicos)
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Clave duplicada: El registro ya existe en la base de datos.',
            error: err.keyValue
        });
    }
 
    // Manejo de errores de validación de esquemas de Mongoose
    if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos para guardar en el modelo',
            errors: validationErrors
        });
    }
 
    // Error genérico del Servidor
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del Servidor de Inscripciones (Servicio B)',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};