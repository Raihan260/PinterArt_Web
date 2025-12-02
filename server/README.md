# PinterArt Backend (Login & Register)

A minimal Express backend that:
- Serves your existing frontend from the `HTML/`, `CSS/`, `ASSETS/`, and `JAVA_SCRIPT/` folders
- Provides `POST /register` and `POST /login` endpoints
- Stores users in `server/data/users.json` with bcrypt-hashed passwords
- Issues a JWT as an HTTP-only cookie on login

## Quick Start

1) Open PowerShell in the `server` folder.

```powershell
cd "d:\Semester 5\PinterArt_Web\server"
```

2) Install dependencies.

```powershell
npm install
```

3) Configure environment (optional). Copy `.env.example` to `.env` and adjust values if needed.

```powershell
Copy-Item .env.example .env
```

4) Run the server (port 3000 by default).

```powershell
npm run dev
```

Open http://localhost:3000 to access the frontend (`/HTML/login_page.html`).

Your frontend JS already calls:
- `POST http://localhost:3000/register`
- `POST http://localhost:3000/login`

Those endpoints are implemented here.

## Endpoints

- `POST /register`
  - Body: `{ name, email, password }`
  - Validates input, ensures unique email, hashes password, persists user.
  - Response: `201` on success, `409` if email exists, `400` for validation errors.

- `POST /login`
  - Body: `{ email, password }`
  - Validates credentials and sets `token` cookie (JWT) on success.
  - Response: `200` on success, `401` for invalid credentials.

- `POST /logout`
  - Clears the `token` cookie.

- `GET /me`
  - Returns the decoded user from the JWT (if present), else `401`.

- `GET /health`
  - Basic health check.

- `GET /auth/google`
  - Placeholder (501). Add Google OAuth later if desired.

## Notes

- Data is stored in a simple JSON file (`server/data/users.json`) for development/demo purposes.
- If you open the HTML directly from the filesystem (file://), browsers may block requests due to CORS. Running this backend also serves your static files to avoid CORS issues.
- For production, replace JSON file storage with a real database and use HTTPS with secure cookies.