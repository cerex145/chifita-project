# ChiFacademy

Monorepo para Chifita Posting / ChiFacademy.

## Sprint 1

- `server`: Express, TypeScript, Prisma, JWT, bcrypt y Google OAuth.
- `client`: React, TypeScript, Vite, Tailwind, rutas protegidas y AuthContext.

## Desarrollo

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev:server
npm run dev:client
```

Configura `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` antes de usar OAuth.

## Registro e inicio de sesion

El registro local funciona con usuario, correo y contrasena:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Para activar Google OAuth:

1. Entra a Google Cloud Console.
2. Crea o selecciona un proyecto.
3. Ve a `APIs & Services` > `OAuth consent screen` y configura la pantalla de consentimiento.
4. Ve a `APIs & Services` > `Credentials` > `Create credentials` > `OAuth client ID`.
5. Elige `Web application`.
6. Agrega estos valores:

```text
Authorized JavaScript origins:
http://localhost:5173

Authorized redirect URIs:
http://localhost:4000/auth/google/callback
```

7. Copia el Client ID y Client Secret en `server/.env`:

```bash
GOOGLE_CLIENT_ID="tu_client_id"
GOOGLE_CLIENT_SECRET="tu_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"
CLIENT_URL="http://localhost:5173"
```

8. Reinicia el backend.

Mientras esas variables esten vacias, el boton de Google se muestra como pendiente y el login local sigue funcionando normal.

Por defecto las noticias usan Bing News RSS para busquedas de economia en Peru, una fuente publica sin API key que incluye miniaturas:

```bash
NEWS_PROVIDER="bing-news"
```

Tambien puedes usar Google News RSS o GDELT DOC API, publicos y sin key, aunque GDELT puede devolver 429 si se consulta muchas veces seguidas:

```bash
NEWS_PROVIDER="google-news"
NEWS_PROVIDER="gdelt"
```

Opcionalmente puedes usar NewsData.io:

```bash
NEWS_PROVIDER="newsdata"
NEWSDATA_API_KEY="tu_api_key"
```

Si el proveedor publico limita temporalmente las consultas y la base esta vacia, `/noticias` usa datos demo para no romper la pantalla.

## PostgreSQL local con Docker

```bash
docker compose up -d postgres
npm exec --workspace server -- prisma migrate status
npm run seed:admin --workspace server
```

Para levantar también server y client en Docker:

```bash
docker compose up -d --build
```

El cliente dockerizado queda en `http://localhost:5174`.

Credenciales admin de desarrollo:

- Email: `admin@chifacademy.local`
- Password: `Admin12345`

## Materiales PDF

Los PDFs se guardan localmente en `server/uploads` durante desarrollo y se sirven desde `/uploads`.
Configura en `server/.env`:

- `UPLOAD_DIR`
- `MAX_PDF_SIZE_MB`
- `PUBLIC_URL`

## Despliegue en Render con dominio

Este repo incluye `render.yaml` para desplegar en Render:

- Servicio web Node `chifacademy`
- PostgreSQL gestionado `chifacademy-db`
- Frontend React servido por Express en produccion
- Migraciones Prisma al iniciar el servicio
- Seed del usuario admin al iniciar el servicio

Antes de aplicar el Blueprint, sube el repo a GitHub/GitLab/Bitbucket.

Variables que Render pedira completar:

```bash
CLIENT_URL="https://tu-dominio.com"
PUBLIC_URL="https://tu-dominio.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="https://tu-dominio.com/auth/google/callback"
ADMIN_EMAIL="admin@tu-dominio.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="una_password_segura"
```

Cuando conectes el dominio, agrega en Google Cloud:

```text
Authorized JavaScript origins:
https://tu-dominio.com

Authorized redirect URIs:
https://tu-dominio.com/auth/google/callback
```

Nota: en produccion los uploads locales dependen del disco del servicio. Para una version escalable, migra `server/uploads` a Cloudinary, S3, R2 o Supabase Storage.
