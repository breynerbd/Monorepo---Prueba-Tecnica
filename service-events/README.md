# 📅 Servicio A: Gestión de Eventos (Server Admin)
 
Este servicio es el núcleo administrativo del ecosistema de eventos. Se encarga de la gestión de perfiles de usuarios, la creación y edición de eventos, el control del catálogo maestro de datos y la administración de la lista de invitados (`guests`) antes de que confirmen su asistencia.
 
---
 
## 🛠️ Tecnologías Utilizadas
 
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Base de Datos:** MongoDB (a través de Mongoose)
- **Gestor de Paquetes:** PNPM (Estructura de Monorepo)
- **Integración de Servicios:** Axios
- **Seguridad & Logs:** Helmet, CORS, Morgan
 
---
 
## 📋 Requisitos Previos
 
Antes de ejecutar el proyecto, asegúrate de tener instalado en tu equipo:
 
1. **Node.js** (Versión 18 o superior recomendada)
2. **PNPM** (Instálalo globalmente si no lo tienes usando `npm i -g pnpm`)
3. **MongoDB** (Servicio local corriendo en el puerto por defecto `27017` o una URI de MongoDB Atlas)
 
---
 
# 🚀 Pasos para la Instalación y Configuración
 
## 1. Clonar e ingresar al directorio del Servicio A
 
Abre tu terminal y navega hasta la carpeta del proyecto correspondiente al **Servicio A**:
 
```bash
cd service-events
```
 
## 2. Configurar las Variables de Entorno (`.env`)
 
Crea un archivo llamado `.env` en la raíz de la carpeta `service-events/` y define los siguientes parámetros de configuración:
 
```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/service_events
NODE_ENV=development
```
 
> 💡 **Nota:** El puerto **3001** es fundamental para que el Servicio B pueda comunicarse con este servidor de manera consistente.
 
## 3. Instalar las Dependencias
 
Utiliza el gestor de paquetes **pnpm** para descargar e instalar de forma óptima los módulos de Node:
 
```bash
pnpm install
```
 
---
 
# ⚡ Ejecución del Servicio
 
El servicio cuenta con scripts listos en el `package.json` para facilitar el flujo de desarrollo.
 
## Modo Desarrollo (Recomendado)
 
Para levantar el servidor usando un watcher que reinicia el servidor automáticamente al detectar cambios:
 
```bash
pnpm dev
```
 
## Modo Producción
 
Para iniciar el servidor de manera directa:
 
```bash
pnpm start
```
 
Al iniciar correctamente, deberías visualizar mensajes similares a los siguientes:
 
```text
Server Events | Levantado en el puerto 3001
MongoDB | Conectado a MongoDB correctamente
MongoDB | Conectado a la base de datos: events
```
 
---
 
# 🛰️ Endpoints Principales del Servicio
 
**Prefijo global de la API:**
 
```text
http://localhost:3001/events/v1
```
 
## 👤 Módulo de Usuarios (`/users`)
 
| Método | Endpoint | Descripción |
|---------|----------|-------------|
| **POST** | `/users` | Registrar un nuevo usuario (se conecta al microservicio de autenticación en el puerto **5070** si no se envía un `auth_id` manual). |
| **GET** | `/users` | Obtener todos los usuarios de forma paginada. |
| **PUT** | `/users/:id` | Actualizar los datos de un usuario. |
| **PUT** | `/users/:id/deactivate` | Desactivar lógicamente un usuario. |
 
---
 
## 📅 Módulo de Eventos (`/events`)
 
| Método | Endpoint | Descripción |
|---------|----------|-------------|
| **POST** | `/events` | Crear un evento (asigna un creador y un listado opcional de `guests`). |
| **GET** | `/events` | Listar todos los eventos. |
| **GET** | `/events/:id` | Obtener los detalles de un evento por ID (consumido internamente por el Servicio B). |
| **GET** | `/events/invitations/:userId` | Obtener los eventos pendientes de invitación para un usuario específico. |
| **PUT** | `/events/:id/remove-guest` | Remover un usuario de la lista de invitados (consumido automáticamente por el Servicio B al confirmar asistencia). |
 
---