# Ticket Stream

Ticket Stream is a MERN-based incident management boilerplate for software support and operations teams.  
It includes auth, incident APIs, incident dashboard pages, timeline updates, and routing needed to start building a ServiceNow-style workflow product.

## Included boilerplate

- JWT cookie auth and protected routes
- Incident model with:
  - status lifecycle (`open`, `investigating`, `monitoring`, `resolved`, `closed`)
  - priority (`p1`-`p4`) and severity
  - assignee / reported-by users
  - timeline activity entries (created, status changes, comments, assignment)
- Incident API endpoints (`/api/incidents`)
- React pages:
  - Incident dashboard (filters + summary cards + table)
  - Create incident form (React Hook Form + Zod)
  - Incident detail page (status updates, comments, assignment)

## Tech stack

- **Frontend:** React 19, Vite, React Router, React Hook Form, Zod, date-fns
- **Backend:** Node.js, Express, Mongoose, JWT auth, express-rate-limit
- **Tooling:** Vitest, ESLint, Prettier, Husky

## Getting started

### Prerequisites

- Node.js `>=20`
- MongoDB

### Install

```bash
npm run install-all
```

### Configure environment

```bash
cp .env.example server/.env
```

Update values in `server/.env` as needed.

### Run in development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Incidents (protected)

- `GET /api/incidents` - list with filters (`search`, `status`, `priority`, `severity`, `assignee=me`)
- `POST /api/incidents` - create incident
- `GET /api/incidents/summary` - dashboard counts
- `GET /api/incidents/:id` - incident details
- `PATCH /api/incidents/:id` - update incident fields / assignment
- `PATCH /api/incidents/:id/status` - status transition + note
- `POST /api/incidents/:id/comments` - add timeline comment

## Suggested next iterations

1. Add SLA policies and breach alerts.
2. Add notifications (email, Slack, webhook).
3. Add role matrix for support analyst / manager / observer permissions.
4. Add incident postmortem templates and exportable reports.
