'use strict';
 
import app from './configs/app.js';
import { connectDB } from './configs/db.js';
 
const PORT = process.env.PORT || 3002;
 
connectDB();
 
app.listen(PORT, () => {
    console.log(`Server Registrations | levantado en el puerto ${PORT}`);
});