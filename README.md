# 🏋️‍♂️ APP_GYM - Full Stack Gym Management Platform

> **Sistema Integral de Gestión para Gimnasios, Entrenadores y Atletas.**
> *Desarrollado como una solución moderna, escalable y enfocada en la experiencia de usuario.*

---

## 📊 Estado Actual del Proyecto: **~65% COMPLETADO** 🟢

El proyecto cuenta con una base sólida y funcional para la gestión web y el núcleo del negocio (Entrenamiento y Nutrición).

| Módulo | | Descripción Breve |
| :--- || :--- |
| **1. Gestión Administrativa** | | Control de roles, gimnasios, usuarios y autenticación segura. |
| **2. Entrenamiento (Core)** || Gestión de ejercicios, rutinas complejas y registro de logs. |
| **3. Nutrición** | | Planes dietéticos, calculadora de macros y gestión de comidas. |
| **4. Progreso y Medidas** | | Estructura de BD lista. Falta implementación en frontend. |
| **5. Social / Gamificación** || Estructura de BD parcial. Falta lógica de aplicación. |
| **6. App Móvil** || Pendiente de inicialización (Flutter). |

---

## 🛠️ Stack Tecnológico

### Backend (API REST)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** MySQL (Relacional)
*   **Autenticación:** JWT (JSON Web Tokens)
*   **Patrón:** MVC (Modelo-Vista-Controlador)

### Frontend (Web)
*   **Framework:** React v18
*   **Build Tool:** Vite
*   **Estilos:** Tailwind CSS + Design System propio (Glassmorphism)
*   **State Management:** Context API
*   **Iconos:** Lucide React

### Móvil (Pendiente)
*   **Framework:** Flutter (Dart)

---

## 📂 Estructura del Proyecto

```bash
APP_GYM/
├── backend/                # API REST Node.js
│   ├── src/
│   │   ├── config/         # Configuración DB y env
│   │   ├── controllers/    # Lógica de negocio (Diet, User, Exercise...)
│   │   ├── middleware/     # Auth, RBAC, Logging
│   │   ├── routes/         # Definición de endpoints
│   │   └── index.js        # Entry point
│   ├── database/           # Scripts SQL (schema.sql - Fuente de verdad)
│   └── .env                # Variables de entorno (DB_HOST, JWT_SECRET...)
│
├── frontend-web/           # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes UI (DietModal, Navbar, Cards...)
│   │   ├── pages/          # Vistas (Dashboard, Diets, Workouts...)
│   │   ├── services/       # Llamadas API (Axios abstract)
│   │   ├── context/        # Providers globales (Auth, Toast, Lang)
│   │   └── utils/          # Helpers y Traducciones
│   └── index.css           # Estilos globales y Tailwind imports
│
├── mobile-app/             # Proyecto Flutter (Pendiente)
│
├── ANALISIS_COMPLETO.md    # 📄 Documento vivo del estado del proyecto
├── PROYECTO_GYM.md         # 📄 Definición de requerimientos iniciales
└── README.md               # 📄 Este archivo
```

---

## 🚀 Instalación y Despliegue Local

### Prerrequisitos
*   Node.js (v18+)
*   MySQL Server (XAMPP o standalone)
*   Git

### 1. Configurar Base de Datos
1.  Crear base de datos `gym_db` en MySQL.
2.  Importar el esquema: `backend/database/schema.sql`.
3.  (Opcional) Importar datos semilla si existen.

### 2. Configurar Backend
```bash
cd backend
npm install
# Crear archivo .env basado en .env.example
npm run dev
# Servidor corriendo en http://localhost:3000
```

### 3. Configurar Frontend
```bash
cd frontend-web
npm install
npm run dev
# App corriendo en http://localhost:5173
```

---

## 🌟 Características Destacadas

*   **Diseño Premium (Glassmorphism):** Interfaz moderna con efectos de transparencia y desenfoque.
*   **Calculadora de Macros:** Herramienta integrada para cálculo automático de necesidades calóricas (Mifflin-St Jeor).
*   **Asignación Inteligente:** Lógica automática para asignar planes a clientes o auto-asignación.
*   **Roles y Permisos (RBAC):** Super Admin, Dueño de Gym, Entrenador y Atleta con vistas diferenciadas.
*   **Internacionalización (i18n):** Soporte nativo para Español e Inglés.

---

> **Nota:** Para ver el roadmap detallado y deuda técnica contactar al dueño del proyecto.
