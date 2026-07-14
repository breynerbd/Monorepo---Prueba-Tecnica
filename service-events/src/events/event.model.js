'use strict';

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del evento es obligatorio'],
        trim: true,
        maxLength: [150, 'El nombre no puede exceder 150 caracteres'],
    },

    date: {
        type: Date,
        required: [true, 'La fecha del evento es obligatoria'],
    },

    location: {
        type: String,
        required: [true, 'El lugar del evento es obligatorio'],
        trim: true,
    },

    capacity: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'La capacidad debe ser al menos de 1 persona'],
    },

    description: {
        type: String,
        trim: true,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del usuario que registra el evento es obligatorio'],
    },

    // NUEVO: Lista de usuarios invitados (Pendientes de aceptar)
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    isActive: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Índices para optimizar búsquedas frecuentes
eventSchema.index({ isActive: 1, date: 1 });
eventSchema.index({ guests: 1 }); // Optimiza la búsqueda de "Mis Invitaciones"

export default mongoose.model('Event', eventSchema);