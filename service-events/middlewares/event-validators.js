import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

// Crear Evento
export const validateCreateEvent = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del evento es requerido')
        .isLength({ min: 3, max: 150 })
        .withMessage('El nombre debe tener entre 3 y 150 caracteres'),

    body('date')
        .notEmpty()
        .withMessage('La fecha es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser un formato válido (AAAA-MM-DD o ISO 8601)')
        .toDate()
        .custom((value) => {
            if (value < new Date()) {
                throw new Error('La fecha del evento no puede ser en el pasado');
            }
            return true;
        }),

    body('location')
        .trim()
        .notEmpty()
        .withMessage('El lugar o locación del evento es requerido')
        .isLength({ min: 3 })
        .withMessage('La locación debe tener al menos 3 caracteres'),

    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número entero mayor a 0'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder los 500 caracteres'),

    body('user')
        .notEmpty()
        .withMessage('El ID del usuario es requerido')
        .isMongoId()
        .withMessage('El ID del usuario debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

// Actualizar Evento
export const validateUpdateEventRequest = [
    param('id')
        .isMongoId()
        .withMessage('ID del evento debe ser un ObjectId válido de MongoDB'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage('El nombre debe tener entre 3 y 150 caracteres'),

    body('date')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe ser un formato válido')
        .toDate()
        .custom((value) => {
            if (value < new Date()) {
                throw new Error('La fecha del evento no puede ser en el pasado');
            }
            return true;
        }),

    body('location')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('La locación debe tener al menos 3 caracteres'),

    body('capacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número entero mayor a 0'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder los 500 caracteres'),

    body('user')
        .optional()
        .isMongoId()
        .withMessage('El ID del usuario debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

// Activar/Desactivar Evento
export const validateEventStatusChange = [
    param('id')
        .isMongoId()
        .withMessage('ID del evento debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

// Obtener Evento por ID
export const validateGetEventById = [
    param('id')
        .isMongoId()
        .withMessage('ID del evento debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];