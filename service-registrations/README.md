# 🎟️ Servicio B: Registro de Asistentes y Cupos (Server User)
 
Este servicio es el cerebro transaccional del sistema. Su responsabilidad principal es gestionar las inscripciones de los usuarios a los eventos del **Servicio A**, controlar el aforo máximo en tiempo real para evitar la sobreventa de cupos, realizar bajas lógicas de asistencia y proveer métricas analíticas de ocupación.
 
---
 
## 🛠️ Tecnologías Utilizadas
 
- **Runtime:** Node.js (ES Modules)

- **Framework:** Express.js

- **Base de Datos:** MongoDB (a través de Mongoose)

- **Gestor de Paquetes:** NPM / PNPM

- **Comunicación Inter-servicio:** Axios (HTTP Client)

- **Seguridad & Logs:** Helmet, CORS, Morgan, Express-Rate-Limit
 
---
 
## 📋 Requisitos Previos
 
Antes de ejecutar este servicio, asegúrate de tener:
 
1. **Node.js** (Versión 18 o superior recomendada).

2. **MongoDB** local corriendo en el puerto por defecto `27017` (este servicio creará automáticamente la base de datos `service_registrations`).

3. **El Servicio A (`service-events`) activo y ejecutándose** en el puerto `3001`, ya que este Servicio B se comunicará con él mediante HTTP para validar la existencia de eventos y sus aforos.
 
---
 
# 🚀 Pasos para la Instalación y Configuración
 
## 1. Ingresar al directorio del Servicio B
 
Abre tu terminal y navega hasta la carpeta correspondiente al **Servicio B**:
 
```bash

cd service-registrations

```
 
## 2. Configurar las Variables de Entorno (`.env`)
 
Crea un archivo llamado `.env` en la raíz de la carpeta `service-registrations/` y define las siguientes variables:
 
```env

PORT=3002

MONGO_URI=mongodb://127.0.0.1:27017/service_registrations

SERVICE_A_URL=http://localhost:3001/events/v1

NODE_ENV=development

```
 
> 💡 **Nota:** El puerto **3002** se utiliza para evitar conflictos con el puerto **3001** del Servicio A.
 
## 3. Instalar las Dependencias
 
Instala los módulos de Node requeridos para ejecutar el proyecto:
 
```bash

npm install

```
 
> También puedes utilizar:
 
```bash

pnpm install

```
 
si estás gestionando ambos servicios desde un **Monorepo**.
 
---
 
# ⚡ Ejecución del Servicio
 
Puedes iniciar el servidor utilizando los scripts configurados en el `package.json`.
 
## Modo Desarrollo (Recarga Automática)
 
```bash

npm run dev

```
 
O, si ejecutas directamente el archivo principal:
 
```bash

node index.js

```
 
Al iniciar correctamente, deberías visualizar mensajes similares a los siguientes:
 
```text

Server Registrations | Levantado en el puerto 3002

MongoDB | Intentando conectar...

MongoDB | Conectado a MongoDB correctamente

MongoDB | Conectado a la base de datos: registrations

```
 
---
 
# 🛰️ Endpoints Principales del Servicio
 
**Prefijo global de la API:**
 
```text
http://localhost:3002/registrations/v1

```
 
## 🎟️ Registro y Cancelaciones (`/registrations`)
 
| Método | Endpoint | Descripción |

|---------|----------|-------------|

| **POST** | `/registrations` | Inscribir un usuario a un evento. Internamente consulta al Servicio A para validar la existencia del evento, verifica la disponibilidad de cupos, registra la inscripción y solicita al Servicio A remover al usuario de la lista de invitados (`guests`). |

| **DELETE** | `/registrations/:id` | Cancelar una inscripción mediante una baja lógica. El estado cambia a `CANCELLED`, liberando el cupo para otros usuarios. |
 
---
 
## 📊 Consultas y Reportes de Ocupación (`/events` y `/summary`)
 
| Método | Endpoint | Descripción |

|---------|----------|-------------|

| **GET** | `/summary` | Genera un reporte analítico en tiempo real de todos los eventos del Servicio A indicando capacidad, asistentes actuales, cupos restantes, porcentaje de ocupación y estado (`DISPONIBLE`, `CUPOS CRÍTICOS` o `COMPLETO`). |

| **GET** | `/events/available` | Lista los eventos que aún tienen cupos disponibles. |

| **GET** | `/events/full` | Lista los eventos cuyo aforo ya está completo. |

| **GET** | `/events/:id/attendees` | Devuelve el número de asistentes confirmados para un evento específico. |
 
---
 