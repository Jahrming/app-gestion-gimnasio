# Guía de Ejecución y Pruebas - Gym App

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

---

## 📦 Instalación desde GitHub

Si estás clonando este proyecto desde GitHub, sigue estos pasos:

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd APP_GYM
```

### 2. Configurar Variables de Entorno

#### Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Crea un archivo `.env` (copia desde `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Edita el archivo `.env` con tus credenciales de MySQL:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3307
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=gym_db
   JWT_SECRET=your_secret_key_here
   ```

### 3. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend-web
npm install
```

### 4. Configurar Base de Datos

**Opción A: Script Automático (Recomendado)**
```bash
cd backend
node scripts/setupDb.js
```
Este script creará automáticamente la base de datos `gym_db`, las tablas necesarias y los usuarios demo.

**Opción B: Manual**
1. Abre phpMyAdmin o tu administrador de MySQL
2. Crea la base de datos `gym_db`
3. Ejecuta el archivo `backend/database/schema.sql`
4. Inserta manualmente los usuarios demo (ver credenciales abajo)

### 5. Iniciar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend estará en: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend-web
npm run dev
```
El frontend estará en: `http://localhost:5173`

---

## 1. Prerrequisitos

*   **XAMPP**: Asegúrate de tener XAMPP instalado y el servicio **MySQL** corriendo.
    *   Puerto esperado de MySQL: **3307** (según tu configuración actual).
    *   Si tu MySQL corre en el 3306, actualiza el archivo `backend/.env`.
*   **Node.js**: Debes tener Node.js instalado (v18+ recomendado).

## 2. Configuración de Base de Datos

1.  Abre tu administrador de base de datos (phpMyAdmin, DBeaver, Workbench).
2.  Crea una base de datos llamada `gym_db`.
3.  Ejecuta el script SQL ubicado en `backend/database/schema.sql` para crear las tablas.

## 3. Ejecutar el Backend (API)

1.  Abre una terminal.
2.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
3.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
4.  Inicia el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```
    *   El servidor iniciará en: `http://localhost:3000`

## 4. Ejecutar el Frontend (Web)

1.  Abre **otra** terminal.
2.  Navega a la carpeta del frontend:
    ```bash
    cd frontend-web
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Inicia la aplicación web:
    ```bash
    npm run dev
    ```
    *   Abre el link que aparece (ej: `http://localhost:5173`) en tu navegador.

## 5. Ejecutar Pruebas (Testing)

### Backend (Jest)
Para probar los endpoints y la lógica del servidor:
```bash
cd backend
npm test
```

### Frontend (Vitest)
Para probar los componentes de React:
```bash
cd frontend-web
npx vitest run
```

## 6. Credenciales de Prueba (Demo)
El sistema ya cuenta con usuarios pre-cargados para cada rol. En la pantalla de Login verás botones para autocompletar estas credenciales:

*   **Super Admin**: `admin@gym.com` / `admin123`
*   **Dueño de Gimnasio**: `owner@gym.com` / `owner123`
*   **Entrenador**: `trainer@gym.com` / `trainer123`
*   **Usuario**: `user@gym.com` / `user123`

Si necesitas resetear la base de datos, ejecuta:
```bash
cd backend
node scripts/setupDb.js
```
