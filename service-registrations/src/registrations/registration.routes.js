import { Router } from 'express';
import {
    registerAttendee,
    cancelRegistration,
    getEventAttendeesCount,
    getEventsSummaryAndStatus
} from './registration.controller.js';
import {
    validateCreateRegistration,
    validateCancelRegistration,
    validateGetEventDetails
} from '../../middlewares/registration-validators.js';
 
const router = Router();
 
// Transacciones directas
router.post('/registrations', validateCreateRegistration, registerAttendee);
router.delete('/registrations/:id', validateCancelRegistration, cancelRegistration);
 
// Filtros y Métricas agregadas de Ocupación
router.get('/events/:id/attendees', validateGetEventDetails, getEventAttendeesCount);
router.get('/events/available', getEventsSummaryAndStatus);
router.get('/events/full', getEventsSummaryAndStatus);
router.get('/summary', getEventsSummaryAndStatus);
 
export default router;