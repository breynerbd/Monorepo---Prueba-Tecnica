import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';
 
export const validateCreateRegistration = [
    body('event')
        .notEmpty()
        .withMessage('El ID del evento es requerido')
        .isMongoId()
        .withMessage('Debe ser un ID válido de MongoDB'),
 
    body('user')
        .notEmpty()
        .withMessage('El ID del usuario es requerido')
        .isMongoId()
        .withMessage('Debe ser un ID válido de MongoDB'),
 
    checkValidators
];
 
export const validateCancelRegistration = [
    param('id')
        .isMongoId()
        .withMessage('El ID de la inscripción debe ser un ObjectId válido'),
 
    checkValidators
];
 
export const validateGetEventDetails = [
    param('id')
        .isMongoId()
        .withMessage('El ID del evento debe ser un ObjectId válido'),
 
    checkValidators
];