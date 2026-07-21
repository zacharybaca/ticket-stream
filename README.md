# Ticket Stream

Ticket Stream is a full-stack incident management starter app for software support and operations teams. It includes authentication, incident lifecycle workflows, timeline activity, and role-based administrative APIs.

## Architecture

Ticket Stream follows a client/server architecture with a React SPA and a Node.js API.

- **Client (`/client`)**: React 19 + Vite single-page app with route protection, incident dashboard pages, and form-driven incident workflows.
- **Server (`/server`)**: Express API with JWT cookie auth, MongoDB persistence via Mongoose, incident/business logic, and middleware for security and validation.
- **Data layer**: MongoDB stores users, companies, and incidents (including timeline events).
- **Realtime foundation**: Socket.IO is initialized on the server for event-driven updates.

### High-level flow

1. User authenticates through `/api/auth`.
2. Server issues an HTTP-only JWT cookie.
3. Protected client routes call `/api/incidents`, `/api/users`, and `/api/companies`.
4. Server validates auth and executes controller/model logic.
5. MongoDB persists and returns domain data for the UI.

## Technology Stack

### Frontend
- React 19
- Vite
- React Router
- React Hook Form + Zod
- TanStack Query
- Bootstrap + React-Bootstrap
- Vitest + Testing Library

### Backend
- Node.js (ESM)
- Express
- MongoDB + Mongoose
- JWT + cookie-based auth
- Helmet, CORS, rate limiting
- Socket.IO
- Nodemailer + Cloudinary integrations

### Tooling
- ESLint
- Prettier
- Husky + lint-staged
- Concurrently

## Repository Structure

```text
ticket-stream/
├─ client/                 # React app
│  ├─ src/components/      # UI and page components
│  ├─ src/contexts/        # Auth, fetcher, socket providers
│  ├─ src/hooks/           # Custom hooks
│  └─ src/lib/             # API helper functions
├─ server/                 # Express API
│  ├─ controllers/         # Route handlers
│  ├─ middleware/          # Auth, error, upload, moderation middleware
│  ├─ models/              # Mongoose schemas
│  ├─ routes/              # API route definitions
│  ├─ scripts/             # Seed scripts
│  └─ utils/               # Helpers (token/email)
└─ docs/                   # Project docs/checklists
```

## Getting Started (Local Development)

### Prerequisites

- Node.js `>=20`
- npm
- MongoDB instance (local or hosted)

### 1) Install dependencies

From the repository root:

```bash
npm run install-all
```

### 2) Create server environment file

Create `/server/.env` with at least:

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<strong_random_secret>
```

Common optional variables:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
DEMO_PASSWORD=DemoPass123!
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_NAME=
FROM_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
```

### 3) (Optional) Configure Clerk

[Clerk](https://clerk.com) is wired in and ready to use. To activate it, create `client/.env.local` and add your Publishable Key from the Clerk dashboard:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Without this key, the app is rendered without Clerk (no `ClerkProvider` is mounted). The existing JWT-cookie auth works independently of Clerk and requires no changes to use.

Once the key is set, Clerk's hooks are available from `@clerk/react-router` (e.g. `useUser`, `useAuth`, `SignIn`, `SignUp`) or via the project's convenience wrapper:

```js
import { useClerkAuth } from './hooks/useClerkAuth';
const { user, isSignedIn, getToken, signOut } = useClerkAuth();
```

### 4) Start the app

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 5) (Optional) Seed demo data

```bash
npm run seed:sample
```

Default seed password (unless `DEMO_PASSWORD` is set): `DemoPass123!`

Demo users:
- `admin@northwind.io` (admin)
- `maya@northwind.io`
- `jordan@northwind.io`
- `priya@apexcommerce.com`
- `sam@apexcommerce.com`
- `alex@vertexhealth.org`

## Scripts

### Root
- `npm run install-all` – install root/client/server dependencies
- `npm run dev` – run client and server together
- `npm run client` – run frontend only
- `npm run server` – run backend only
- `npm run seed:sample` – run sample data seed script
- `npm run format` – format client/server source files

### Client (`/client`)
- `npm run lint`
- `npm run build`
- `npm run test`

### Server (`/server`)
- `npm run dev`
- `npm run test`

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/is-admin`
- `POST /api/auth/forgotpassword`
- `PUT /api/auth/resetpassword/:resettoken`

### Users
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `DELETE /api/users/profile`

### Incidents (protected)
- `GET /api/incidents`
- `POST /api/incidents`
- `GET /api/incidents/summary`
- `GET /api/incidents/:id`
- `PATCH /api/incidents/:id`
- `PATCH /api/incidents/:id/status`
- `POST /api/incidents/:id/comments`

### Companies (admin-protected)
- `GET /api/companies`
- `POST /api/companies`
- `GET /api/companies/:id`
- `PUT /api/companies/:id`
- `DELETE /api/companies/:id`

## Validation

Run these before opening a PR:

```bash
cd client && npm run lint && npm run build && npm run test
cd ../server && npm run test
```

## Additional Documentation

- Project implementation checklist: `/docs/ticket-stream-implementation-checklist.docx`
