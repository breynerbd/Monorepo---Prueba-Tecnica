import User from './user.model.js';
import axios from "axios";

// ==========================================
// 1. OBTENER TODOS LOS USUARIOS
// ==========================================
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const users = await User.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
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
            message: 'Error al obtener los usuarios',
            error: error.message,
        });
    }
};

// ==========================================
// 2. OBTENER USUARIO POR ID
// ==========================================
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuario', 
            error: error.message 
        });
    }
};

// ==========================================
// 3. CREAR USUARIO (CON INTEGRACIÓN HTTP)
// ==========================================
export const createUser = async (req, res) => {
    try {
        const {
            auth_id,
            name,
            surname,
            username,
            email,
            password,
            role
        } = req.body;

        // Validar si el usuario ya existe localmente
        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El usuario ya existe en el sistema"
            });
        }

        let finalAuthId = auth_id;

        // Si no se provee un auth_id manual, intentamos llamar al servidor de autenticación (Puerto 5070)
        if (!finalAuthId) {
            try {
                const authResponse = await axios.post(
                    "http://localhost:5070/api/auth/register",
                    {
                        name,
                        surname,
                        username,
                        email,
                        password
                    }
                );

                console.log("Respuesta de Auth Server exitosa:", authResponse.data);

                // Mapeo dinámico y seguro de las estructuras de respuesta comunes de Axios
                finalAuthId =
                    authResponse.data.user?._id ||
                    authResponse.data.user?.id ||
                    authResponse.data.data?._id ||
                    authResponse.data.data?.id ||
                    authResponse.data._id ||
                    authResponse.data.id;

            } catch (axiosError) {
                console.error("❌ Falló la comunicación con el Servidor de Autenticación (Puerto 5070):");
                console.error(axiosError.message);

                // Retorna un error 503 claro detallando la caída del servicio de Auth
                return res.status(503).json({
                    success: false,
                    message: "Error de integración: El servidor de autenticación externo (Puerto 5070) no está disponible o está apagado.",
                    error: axiosError.message || "auth_service_unreachable"
                });
            }
        }

        // Guardar el usuario en la base de datos local de eventos
        const user = await User.create({
            auth_id: finalAuthId,
            name,
            surname,
            username,
            email,
            password, 
            role
        });

        return res.status(201).json({
            success: true,
            message: "Usuario creado correctamente",
            data: user
        });

    } catch (error) {
        console.error("❌ Error interno al procesar la creación de usuario:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear usuario",
            error: error.message || error
        });
    }
};

// ==========================================
// 4. ACTUALIZAR USUARIO
// ==========================================
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Evitar pisar contraseñas vacías accidentalmente
        if (!updateData.password?.trim()) {
            delete updateData.password;
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario actualizado",
            data: user
        });

    } catch (error) {
        next(error); // Delega el error al handle-errors centralizado
    }
};

// ==========================================
// 5. CAMBIAR ESTADO DEL USUARIO (ACTIVAR/DESACTIVAR)
// ==========================================
export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: `Usuario ${action}`, 
            data: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al cambiar estado', 
            error: error.message 
        });
    }
};