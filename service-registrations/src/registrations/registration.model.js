'use strict';
 
import mongoose from 'mongoose';
 
const registrationSchema = new mongoose.Schema({
    // Almacenamos el ID del evento del Servicio A de forma referencial
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID del evento es obligatorio']
    },
    // Almacenamos el ID del usuario del Servicio A que asistirá
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID del usuario asistente es obligatorio']
    },
 
    registrationDate: {
        type: Date,
        default: Date.now
    },
 
    // Permite cancelaciones lógicas sin borrar el registro físico
    status: {
        type: String,
        enum: ['ACTIVE', 'CANCELLED'],
        default: 'ACTIVE'
    }
});
 
// Índice compuesto único: Evita que el mismo usuario se inscriba dos veces al mismo evento activo
registrationSchema.index({ event: 1, user: 1, status: 1 }, { unique: true });
 
export default mongoose.model('Registration', registrationSchema);