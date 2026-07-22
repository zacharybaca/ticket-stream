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

### Adding Clerk UI Components

Once `VITE_CLERK_PUBLISHABLE_KEY` is set and `<ClerkProvider>` is active, adding any Clerk pre-built UI component follows the same three-step pattern.

#### Step 1 — Create a page component

Import the component from `@clerk/react-router` and render it inside a centered wrapper. Pass `routing="path"` and `path` matching the route you plan to register.

```jsx
// client/src/components/Pages/OrganizationProfilePage.jsx
import { OrganizationProfile } from '@clerk/react-router';

const OrganizationProfilePage = () => (
  <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
    <OrganizationProfile routing="path" path="/org/settings" />
  </div>
);

export default OrganizationProfilePage;
```

Available components and suggested paths:

| Component | Import name | Suggested path |
|---|---|---|
| Sign-in form | `SignIn` | `/login` |
| Sign-up form | `SignUp` | `/register` |
| User profile | `UserProfile` | `/account` |
| Org switcher | `OrganizationSwitcher` | navbar / sidebar |
| Org list | `OrganizationList` | `/organizations` |
| Create org | `CreateOrganization` | `/organizations/new` |
| Org profile | `OrganizationProfile` | `/org/settings` |

#### Step 2 — Register the route in `App.jsx`

Add the route inside the `<Route element={<ProtectedRoute />}>` block for auth-gated pages, or at the top level for public pages (e.g. sign-in):

```jsx
// App.jsx
import OrganizationProfilePage from './components/Pages/OrganizationProfilePage';

// inside <Routes> → <Route path="/" element={<Layout />}>:
<Route element={<ProtectedRoute />}>
  {/* ...existing routes... */}
  <Route path="org/settings/*" element={<OrganizationProfilePage />} />
</Route>
```

> **Note:** Components with multi-step internal navigation (`UserProfile`, `OrganizationProfile`) need a wildcard `/*` suffix on the route so React Router doesn't intercept Clerk's internal path changes. Single-step components like `CreateOrganization` do not require this.

#### Step 3 — (Optional) Link to the route

Add a `<Link>` anywhere in the app to navigate to the new page:

```jsx
import { Link } from 'react-router-dom';

<Link to="/org/settings">Organization Settings</Link>
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
