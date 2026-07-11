# Deployment Guide: Railway & Vercel Transition

This document outlines the deployment process for migrating the **AI Admission Counselor** application from Render to **Railway** (Backend and PostgreSQL Database) and **Vercel** (Frontend React application).

---

## 1. System Architecture

```mermaid
graph TD
    Client[Web Browser] -->|Routes UI Requests| Vercel[Vercel Frontend]
    Client -->|Routes /api/* Requests| Proxy[Vercel API Proxy]
    Proxy -->|Proxies Requests with BACKEND_API_URL| Railway[Railway Backend Node.js Service]
    Railway -->|Prisma Client| PG[(Railway PostgreSQL Database)]
    Railway -->|OpenAI SDK / LangChain| OpenAI[OpenAI API / RAG]
```

---

## 2. Railway Database Setup (PostgreSQL)

Railway provides a fully managed PostgreSQL database with automatic connection string provisioning.

1. **Create PostgreSQL Database on Railway:**
   - Log in to the [Railway Console](https://railway.app/).
   - Click **New Project** -> **Provision PostgreSQL**.
   - Wait for the database service to be created.

2. **Retrieve Connection String:**
   - Click on the newly provisioned PostgreSQL service in the Railway canvas.
   - Go to the **Variables** tab.
   - You will see `DATABASE_URL` (e.g., `postgresql://postgres:password@host:port/railway`).
   - This variable is automatically injected into any service linked to this database.

---

## 3. Railway Backend Deployment (Node.js)

The backend is deployed as a direct Node.js service using Railway's default **Nixpacks** builder.

1. **Deploy Backend Service:**
   - In your Railway project canvas, click **New** -> **GitHub Repo** and select the repository.
   - If prompted, select **Deploy Later**.

2. **Configure Service Settings:**
   - Select the newly created GitHub service.
   - Go to **Settings** -> **General**:
     - **Service Name:** `ai-admission-backend`
     - **Root Directory:** `/` (Keep as the repository root, so Railway installs all workspace dependencies).
   - Go to **Settings** -> **Build & Deploy**:
     - **Build Command:** `npx prisma generate --schema=backend/prisma/schema.prisma && npm run build -w shared && npm run build -w backend`
     - **Start Command:** `npx prisma migrate deploy --schema=backend/prisma/schema.prisma && npm run start -w backend`
   - Railway will automatically detect the Node.js project using Nixpacks and use these custom commands.

3. **Configure Environment Variables:**
   Go to the **Variables** tab of the backend service and click **New Variable** (or bulk import):

| Variable Name        | Description / Example                                                            | Source                             |
| :------------------- | :------------------------------------------------------------------------------- | :--------------------------------- |
| `DATABASE_URL`       | Connection string for PostgreSQL (Railway auto-injects this if you link the DB). | Auto-injected or manually set      |
| `NODE_ENV`           | Set to `production`.                                                             | Manual                             |
| `PORT`               | Auto-provided by Railway (defaults to `5000` inside backend/index.ts).           | Railway Managed                    |
| `JWT_SECRET`         | Secret key for signing access tokens (long, random string).                      | Manual                             |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens (long, random string).                     | Manual                             |
| `OPENAI_API_KEY`     | OpenAI API Key for chatbot, embeddings, Whisper STT, and Audio TTS.              | Manual                             |
| `FRONTEND_URL`       | The Vercel deployment URL (e.g., `https://your-app.vercel.app`).                 | Manual (Update after Vercel setup) |
| `LOG_LEVEL`          | `info` or `warn`                                                                 | Manual                             |

4. **Connect Database to Backend:**
   - In the Railway canvas, click and drag a connection line from the **PostgreSQL** service to the **Backend** service, or go to Backend service **Variables** -> **New Variable** -> **Reference** -> Select PostgreSQL's `DATABASE_URL`. This ensures the database credentials auto-sync if they change.

---

## 4. Prisma Migrations and Client Generation

1. **Build Step (`npx prisma generate`):**
   The Prisma Client is generated to `node_modules/@prisma/client` using the custom build command before compilation. This ensures TypeScript compiling (`tsc`) resolves database models correctly.

2. **Release Step (`npx prisma migrate deploy`):**
   Prisma migrations are automatically run against the production database on every backend startup before the server binds to the port. This guarantees that schema updates are safely applied without losing database tables.

---

## 5. Vercel Frontend Deployment

The React Vite application is deployed to Vercel. Since Vite compiles static assets, and the application communicates using relative URLs (e.g. `fetch('/api/auth/login')`), a **Vercel API Proxy Function** is used to handle cross-origin routing dynamically.

1. **Deploy Frontend on Vercel:**
   - Log in to the [Vercel Dashboard](https://vercel.com/).
   - Click **Add New** -> **Project**.
   - Import your GitHub repository.

2. **Configure Monorepo Framework Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Keep as `.` (monorepo root) to utilize root workspaces, OR configure to `frontend` if deploying the subdirectory alone. The repository is pre-configured to support both:
     - **If Root Directory is `.` (Recommended):**
       - **Build Command:** `npm run build -w frontend`
       - **Output Directory:** `frontend/dist`
       - The proxy runs from the root `api/[...all].js` function.
     - **If Root Directory is `frontend`:**
       - **Build Command:** `tsc -b && vite build`
       - **Output Directory:** `dist`
       - The proxy runs from the frontend subdirectory `frontend/api/[...all].js` function.

3. **Configure Environment Variables:**
   Add the following environment variable under the project Settings -> **Environment Variables**:

| Variable Name     | Value / Example                                          | Description                                            |
| :---------------- | :------------------------------------------------------- | :----------------------------------------------------- |
| `BACKEND_API_URL` | `https://ai-admission-backend-production.up.railway.app` | The production domain of your Railway backend service. |

4. **Vercel API Proxy Mechanism:**
   The Vercel Serverless Function (`api/[...all].js` or `frontend/api/[...all].js`) automatically catches all requests to `/api/*` using Vercel's default filesystem wildcard routing and streams them directly to the `BACKEND_API_URL` without buffering in memory. This supports large file uploads (such as marksheets and Aadhaar cards) and handles cookies and CORS headers seamlessly.

---

## 6. Domain Configuration

1. **Railway Backend Custom Domain:**
   - Go to your Railway Backend service -> **Settings** -> **Public Networking**.
   - Click **Generate Domain** or add a custom domain (e.g., `api.yourdomain.com`).
   - Copy this URL and set it as `BACKEND_API_URL` in Vercel.

2. **Vercel Frontend Custom Domain:**
   - Go to your Vercel Project -> **Settings** -> **Domains**.
   - Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`).
   - Configure your DNS provider (Cloudflare, GoDaddy, etc.) with the `CNAME` or `A` records provided by Vercel.
   - Once resolved, update the `FRONTEND_URL` environment variable on the Railway backend service to match this domain.

---

## 7. Common Deployment Issues & Troubleshooting

### Issue 1: Database Migration Fails during Deployment

- **Symptoms:** Backend deployment log shows connection timeouts or `PrismaClientInitializationError`.
- **Solution:** Verify that the Railway PostgreSQL service is running and that `DATABASE_URL` is correctly linked as a reference variable in the backend service. Ensure that the database is not sleeping or overloaded.

### Issue 2: API Proxy Returns `500 Bad Gateway`

- **Symptoms:** Frontend loads successfully, but login/register requests fail with status code 500.
- **Solution:** Verify that `BACKEND_API_URL` is correctly set in Vercel's environment variables and that the backend service on Railway is active and healthy (visit `https://your-backend.up.railway.app/api/health` to verify).

### Issue 3: CORS Errors in Console

- **Symptoms:** Browser blocks API calls with CORS policy header mismatches.
- **Solution:** Ensure the `FRONTEND_URL` environment variable in Railway backend matches the exact protocol and domain of the Vercel frontend (e.g., `https://your-app.vercel.app`, no trailing slash).

### Issue 4: Document Uploads Fail or Timeout

- **Symptoms:** File uploads to `/api/documents/upload` fail with `413 Payload Too Large` or request timeouts.
- **Solution:** Vercel Serverless Functions have a maximum payload body limit of 4.5 MB for Hobby tier and 15 MB for Pro tier. Ensure uploaded documents are compressed or remain within these limits. (The proxy has `bodyParser` disabled, so it does not add overhead).

---

## 8. Rollback Procedure

In the event of a breaking production deployment, perform the following rollback steps:

1. **Backend Rollback (Railway):**
   - Click on the `ai-admission-backend` service in the Railway canvas.
   - Go to the **Deployments** tab.
   - Find the last known stable deployment and click the three dots (`...`).
   - Select **Redeploy**. This immediately rolls back the container code.
   - _Note:_ If database migrations were destructive, you may need to restore database tables from a Railway backup (Railway automatically snapshots databases, accessible via PostgreSQL configuration tabs).

2. **Frontend Rollback (Vercel):**
   - Go to the Vercel project dashboard.
   - Navigate to the **Deployments** tab.
   - Locate the last stable deployment.
   - Click the three dots (`...`) and select **Rollback**.
   - Confirm the rollback. The domain routing will update to the previous build in under 10 seconds.
