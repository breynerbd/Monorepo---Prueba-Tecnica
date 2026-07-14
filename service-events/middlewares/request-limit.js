import rateLimit from 'express-rate-limit';

export const requestLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'Kafetery System: Se ha detectado un tráfico inusual. Por seguridad, espera un momento.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
    
    standardHeaders: true, 
    legacyHeaders: false, 
    
    handler: (req, res) => {
        console.warn(`[RATE LIMIT] IP: ${req.ip} | Ruta: ${req.path} | Usuario: ${req.user?.username || 'Anónimo'}`);
        
        res.status(429).json({
            success: false,
            message: 'Has realizado demasiadas solicitudes. El acceso se restaurará pronto.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round((req.rateLimit.resetTime - Date.now()) / 1000),
        });
    }
});