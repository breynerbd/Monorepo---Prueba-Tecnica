import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

// Crear usuario
export const validateCreateUser = [

    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('El username es requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('El username debe tener entre 3 y 50 caracteres'),

    body('email')
        .notEmpty()
        .withMessage('El correo es requerido')
        .isEmail()
        .withMessage('Correo no válido'),

    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    // NUEVO: Validación del rol para la creación
    body('role')
        .optional()
        .isIn(['USER_ROLE', 'ADMIN_ROLE'])
        .withMessage('El rol debe ser USER_ROLE o ADMIN_ROLE'),

    checkValidators,
];

// Actualizar usuario
export const validateUpdateUserRequest = [

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('surname')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('El username debe tener entre 3 y 50 caracteres'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Correo no válido'),

    body('password')
        .optional({ values: 'falsy' })
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    // NUEVO: Validación del rol para la actualización
    body('role')
        .optional()
        .isIn(['USER_ROLE', 'ADMIN_ROLE'])
        .withMessage('El rol debe ser USER_ROLE o ADMIN_ROLE'),

    checkValidators,
];

// Activar/Desactivar usuario
export const validateUserStatusChange = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

// Obtener usuario por ID
export const validateGetUserById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];