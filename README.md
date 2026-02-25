# Fullstack E-commerce App 🛒

Este es un proyecto de comercio electrónico completo que utiliza una arquitectura desacoplada con un **Backend** robusto en NestJS y un **Frontend** reactivo con React 19.

## 🚀 Tecnologías Principales

### Backend
* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Base de Datos:** PostgreSQL con [Drizzle ORM](https://orm.drizzle.team/)
* **Autenticación:** Passport JWT & Bcrypt
* **Documentación:** Swagger UI
* **Validación:** Class-validator & Class-transformer

### Frontend
* **Framework:** [React 19](https://react.dev/)
* **Herramienta de Construcción:** Vite (con Rolldown)
* **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
* **Routing:** React Router 7
* **Cliente HTTP:** Axios

---

## 🛠️ Estructura del Proyecto
```text
.
├── backend/                # API REST con NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación, JWT & Strategies
│   │   ├── database/       # Conexión y configuración de Drizzle
│   │   ├── orders/         # Módulo de gestión de pedidos
│   │   ├── products/       # Módulo de catálogo de productos
│   │   ├── users/          # Módulo de usuarios y roles
│   │   └── main.ts         # Punto de entrada de la API
│   ├── uploads/            # Almacenamiento de imágenes (Multer)
│   └── Dockerfile
├── frontend/               # Cliente con React 19 + Vite
│   ├── src/
│   │   ├── api/            # Servicios Axios y Contexto de Auth
│   │   ├── components/     # Componentes UI
│   │   ├── context/        # Estado global del Carrito
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── pages/          # Vistas principales de la App
│   │   ├── types/          # Definiciones de TypeScript
│   │   └── main.tsx        # Punto de entrada de React
│   └── Dockerfile
├── database/               # Scripts de inicialización SQL
├── screenshots/            # Capturas de pantalla de la interfaz
└── docker-compose.yml      # Orquestación de servicios (App + DB)
```

## 📸 Screenshots

Aquí puedes ver la interfaz de la aplicación en acción:

| Home & Buscador | Carrito (Drawer) | Checkout |
| :---: | :---: | :---: |
| ![Home](./screenshots/ss-home.png) | ![Carrito](./screenshots/ss-cart.png) | ![Checkout](./screenshots/ss-checkout.png) |



## 🔑 Variables de Entorno

El proyecto requiere configurar un archivo .env en la raiz para funcionar correctamente.

```.env
# Database

DB_USER=user_example
DB_PASSWORD=password_example
DB_NAME=example
DATABASE_URL=postgresql://user_example:password_example@localhost:5432/example

# Backend

NODE_ENV=development
PORT=3000
JWT_SECRET=clave_secreta_super_segura_example

# Frontend

VITE_API_URL=http://localhost:3000
```

## 🛠️ Herramientas de Desarrollo

El proyecto incluye un script de automatización llamado `eco` (basado en bash) para gestionar el entorno de Docker de forma rápida.

### Uso del script

Primero, asegúrate de dar permisos de ejecución al archivo:
```bash
chmod +x eco
```

```
Comando                           Descripción

./eco build                       Construye las imágenes de Docker desde cero.
./eco up                          Inicia todos los servicios en segundo plano (detached).
./eco down                        Detiene los contenedores activos.
./eco restart                     Reinicia todos los servicios.
./eco logs                        Visualiza los logs de todos los contenedores en tiempo real.
./eco log [servicio]              Visualiza logs de un servicio específico (ej: backend).
./eco sh [contenedor]             Abre una terminal interactiva dentro del contenedor.
```

## 💡 Ejemplo de flujo de trabajo

Si acabas de clonar el repositorio, el flujo ideal sería:

1. Configurar variables: crear archivo `.env` en la raiz del proyecto.
2. Construir: `./eco build`
3. Levantar: `./eco up`
4. Verificar: `./eco logs` para asegurar que NestJS y React están corriendo sin errores.