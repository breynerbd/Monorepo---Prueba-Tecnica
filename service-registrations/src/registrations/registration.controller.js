import Registration from './registration.model.js';
import axios from 'axios';
 
const SERVICE_A_URL = 'http://localhost:3001/events/v1';
 
// ==========================================
// 1. REGISTRAR ASISTENTE / CONFIRMAR INVITACIÓN
// ==========================================
export const registerAttendee = async (req, res) => {
    try {
        const { event, user } = req.body;
 
        // A. Consultar al Servicio A si el evento existe y obtener su capacidad
        let eventResponse;
        try {
            eventResponse = await axios.get(`${SERVICE_A_URL}/events/${event}`);
        } catch (error) {
            return res.status(444).json({ success: false, message: 'El evento especificado no existe en el Servicio A' });
        }
 
        const eventData = eventResponse.data.data;
        // B. Contar cuántas inscripciones ACTIVAS tiene ya este evento
        const activeRegistrations = await Registration.countDocuments({ event, status: 'ACTIVE' });
 
        // C. Validar si quedan cupos disponibles
        if (activeRegistrations >= eventData.capacity) {
            return res.status(400).json({ success: false, message: 'Lo sentimos, el evento ya alcanzó su capacidad máxima' });
        }
 
        // D. Guardar la inscripción en el Servicio B
        const registration = await Registration.create({ event, user });
 
        // E. NOTIFICACIÓN DE FLUJO: Avisar al Servicio A que remueva al usuario del array 'guests' si era un invitado
        try {
            await axios.put(`${SERVICE_A_URL}/events/${event}/remove-guest`, { userId: user });
        } catch (err) {
            console.log('El usuario no formaba parte de la lista de invitados predefinida, inscripción regular exitosa.');
        }
 
        return res.status(201).json({
            success: true,
            message: 'Inscripción procesada con éxito',
            data: registration
        });
 
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Este usuario ya está inscrito en este evento' });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};
 
// ==========================================
// 2. CANCELAR UNA INSCRIPCIÓN (Baja Lógica)
// ==========================================
export const cancelRegistration = async (req, res) => {
    try {
        const { id } = req.params;
 
        const registration = await Registration.findByIdAndUpdate(
            id,
            { status: 'CANCELLED' },
            { new: true }
        );
 
        if (!registration) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
 
        res.status(200).json({ success: true, message: 'Inscripción cancelada con éxito', data: registration });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
 
// ==========================================
// 3. CONTAR ASISTENTES POR EVENTO
// ==========================================
export const getEventAttendeesCount = async (req, res) => {
    try {
        const { id } = req.params; // ID del evento
        const count = await Registration.countDocuments({ event: id, status: 'ACTIVE' });
        res.status(200).json({ success: true, eventId: id, totalAttendees: count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
 
// ==========================================
// 4. MOSTRAR EVENTOS DISPONIBLES / COMPLETOS / RESUMEN
// ==========================================
export const getEventsSummaryAndStatus = async (req, res) => {
    try {
        // Solicitamos todos los eventos activos del Servicio A
        const eventsResponse = await axios.get(`${SERVICE_A_URL}/events`);
        const eventsList = eventsResponse.data.data;
 
        const summary = [];
        const availableEvents = [];
        const fullEvents = [];
 
        for (const event of eventsList) {
            const activeCount = await Registration.countDocuments({ event: event._id, status: 'ACTIVE' });
            const remainingCupos = event.capacity - activeCount;
 
            const itemSummary = {
                id: event._id,
                name: event.name,
                capacity: event.capacity,
                currentAttendees: activeCount,
                remainingCupos,
                occupancyPercentage: `${((activeCount / event.capacity) * 100).toFixed(1)}%`,
                status: remainingCupos <= 0 ? 'COMPLETO' : remainingCupos <= 5 ? 'CUPOS CRÍTICOS (Bajo Inventario)' : 'DISPONIBLE'
            };
 
            summary.push(itemSummary);
            if (remainingCupos > 0) availableEvents.push(event);
            else fullEvents.push(event);
        }
 
        // Evaluamos qué sub-ruta de Postman/Frontend llamó al controlador para retornar el array exacto
        if (req.path.includes('/available')) return res.status(200).json({ success: true, data: availableEvents });
        if (req.path.includes('/full')) return res.status(200).json({ success: true, data: fullEvents });
        // De lo contrario retorna el reporte completo de ocupación total (/summary)
        return res.status(200).json({ success: true, totalEventsAnalyzed: summary.length, summary });
 
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fallo al sincronizar con el Servicio A', error: error.message });
    }
};