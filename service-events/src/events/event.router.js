import { Router } from 'express';
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    changeEventStatus,
    getInvitationsByUserId,
    removeGuestFromEvent
} from './event.controller.js';

import {
    validateCreateEvent,
    validateUpdateEventRequest,
    validateEventStatusChange,
    validateGetEventById,
} from '../../middlewares/event-validators.js'; 

const router = Router();

// Rutas GET
router.get('/', getEvents);
router.get('/invitations/:userId', getInvitationsByUserId); // Nueva ruta para ver invitaciones pendientes
router.get('/:id', validateGetEventById, getEventById);

// Rutas POST
router.post('/', validateCreateEvent, createEvent);

// Rutas PUT
router.put('/:id', validateUpdateEventRequest, updateEvent);
router.put('/:id/remove-guest', removeGuestFromEvent); // Nueva ruta para remover un invitado al aceptar/rechazar
router.put('/:id/activate', validateEventStatusChange, changeEventStatus);
router.put('/:id/deactivate', validateEventStatusChange, changeEventStatus);

export default router;