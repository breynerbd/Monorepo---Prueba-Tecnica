import { Router } from 'express';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    changeUserStatus,
} from './user.controller.js';
import {
    validateCreateUser,
    validateUpdateUserRequest,
    validateUserStatusChange,
    validateGetUserById,
} from '../../middlewares/user-validators.js';

const router = Router();

// Rutas GET
router.get('/', getUsers);
router.get('/:id', validateGetUserById, getUserById);

// Rutas POST
router.post('/', validateCreateUser, createUser);

// Rutas PUT
router.put('/:id', validateUpdateUserRequest, updateUser);
router.put('/:id/activate', validateUserStatusChange, changeUserStatus);
router.put('/:id/deactivate', validateUserStatusChange, changeUserStatus);

export default router;
