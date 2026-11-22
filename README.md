# Sistema de Gestión de Productos (`api-actividad4`)

Aplicación full-stack para la gestión segura de inventario y productos con autenticación mediante JSON Web Tokens (JWT), API REST en Node.js / Express, base de datos relacional MySQL y pipeline de integración continua con GitHub Actions.

- **Aplicación desplegada en producción (Vercel):** https://api-actividad4.vercel.app/
- **Repositorio de código fuente (GitHub):** https://github.com/rennito/api-actividad4

---

## Tecnologías utilizadas

- **Backend:** Node.js, Express, `mysql2`, `jsonwebtoken`, `bcryptjs`, `dotenv`
- **Frontend:** HTML5, CSS3, JavaScript Vanilla (carpeta `public/`)
- **Base de datos:** MySQL (alojada en producción en Railway)
- **Pruebas automatizadas:** Jest / Supertest (carpeta `tests/`)
- **CI/CD y Despliegue:** GitHub Actions (`.github/workflows/ci.yml`), Vercel y Railway

---

## Estructura del proyecto

```text
api-actividad4/
├── .github/workflows/ci.yml   # Pipeline de integración continua (CI)
├── config/db.js               # Pool de conexiones a MySQL
├── controllers/               # Lógica de negocio (autenticación y productos)
├── middlewares/               # Validación de tokens JWT
├── public/                    # Interfaz web (Login, Registro y CRUD)
├── routes/                    # Definición de rutas de la API
├── tests/                     # Pruebas unitarias y de integración con Jest
├── app.js                     # Configuración de Express
├── server.js                  # Punto de entrada del servidor
├── jest.config.js             # Configuración de Jest
└── package.json               # Dependencias y scripts del proyecto
