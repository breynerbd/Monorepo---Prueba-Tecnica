import Event from './event.model.js';

// Obtener todos los eventos con paginación, filtros opcionales y populate de invitados
export const getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true, user } = req.query;
        
        // Permite filtrar por isActive y también por el creador del evento (para "Mis Eventos Creados")
        const filter = { isActive };
        if (user) filter.user = user;

        const events = await Event.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: 1 })
            .populate('user', 'name surname username email')
            .populate('guests', 'name surname username email');

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos',
            error: error.message,
        });
    }
};

// Obtener evento por ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id)
            .populate('user', 'name surname username email')
            .populate('guests', 'name surname username email');

        if (!event)
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el evento', error: error.message });
    }
};

// Crear evento (Soporta agregar lista de invitados 'guests')
export const createEvent = async (req, res) => {
    try {
        const { name, date, location, capacity, description, user, guests } = req.body;

        const event = await Event.create({
            name,
            date,
            location,
            capacity,
            description,
            user,
            guests: guests || [] // Si no se envían, se inicializa vacío
        });

        return res.status(201).json({
            success: true,
            message: "Evento creado correctamente",
            data: event
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error al crear el evento",
            error: error.message
        });
    }
};

// Actualizar evento
export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const event = await Event.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        ).populate('user', 'name surname email').populate('guests', 'name surname email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Evento no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Evento actualizado",
            data: event
        });

    } catch (error) {
        next(error); 
    }
};

// Cambiar estado del evento (Activar/Desactivar)
export const changeEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const event = await Event.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        res.status(200).json({ success: true, message: `Usuario ${action}`, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cambiar el estado del evento', error: error.message });
    }
};

// ==========================================
// NUEVOS CONTROLADORES PARA LAS INVITACIONES
// ==========================================

// Obtener invitaciones pendientes de un usuario específico
export const getInvitationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Busca eventos donde el userId exista dentro del array 'guests'
        const invitations = await Event.find({ 
            guests: userId,
            isActive: true 
        }).populate('user', 'name surname username email');

        res.status(200).json({
            success: true,
            data: invitations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las invitaciones',
            error: error.message
        });
    }
};

// Remover a un usuario de la lista de invitados (se llama al Aceptar o Rechazar)
export const removeGuestFromEvent = async (req, res) => {
    try {
        const { id } = req.params; // ID del evento
        const { userId } = req.body; // ID del usuario invitado

        const event = await Event.findByIdAndUpdate(
            id,
            { $pull: { guests: userId } }, // $pull elimina el valor del array automáticamente
            { new: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Invitado removido con éxito de la lista pendiente',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al procesar la lista de invitados',
            error: error.message
        });
    }
};