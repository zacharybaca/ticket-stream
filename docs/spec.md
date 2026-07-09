# Ticket Stream Living Specification

## Core Features

- Incident CRUD for authenticated teams to create, view, update, and comment on incidents.
- Authentication with registration, login, logout, and password reset flows.
- Incident timeline activity that records status changes and collaboration history.
- Dashboard views for incident lists, summaries, and operational visibility.

## Non-Goals

- Fine-grained authorization beyond the three v1 roles and route-level access rules.
- External integrations such as paging, chat, or third-party ticket sync.
- Audit/compliance workflows, SLA automation, or escalation engines.
- Multi-tenant admin consoles beyond company-scoped administration.
- Native mobile applications or offline-first clients.

## Roles

- **Admin**: Full platform access, including company management and all incident actions.
- **Responder**: Operational user who can create and update incidents, comments, and timelines.
- **Observer**: Read-focused user who can monitor incidents and dashboards with limited write access.

## API Role Access

| Endpoint | Allowed roles |
| --- | --- |
| `POST /api/auth/register` | Public |
| `POST /api/auth/login` | Public |
| `POST /api/auth/logout` | Admin, Responder, Observer |
| `GET /api/auth/is-admin` | Admin, Responder, Observer |
| `POST /api/auth/forgotpassword` | Public |
| `PUT /api/auth/resetpassword/:resettoken` | Public |
| `GET /api/users/profile` | Admin, Responder, Observer |
| `PUT /api/users/profile` | Admin, Responder, Observer |
| `DELETE /api/users/profile` | Admin, Responder, Observer |
| `GET /api/incidents` | Admin, Responder, Observer |
| `GET /api/incidents/summary` | Admin, Responder, Observer |
| `GET /api/incidents/:id` | Admin, Responder, Observer |
| `POST /api/incidents` | Admin, Responder |
| `PATCH /api/incidents/:id` | Admin, Responder |
| `PATCH /api/incidents/:id/status` | Admin, Responder |
| `POST /api/incidents/:id/comments` | Admin, Responder |
| `GET /api/companies` | Admin |
| `POST /api/companies` | Admin |
| `GET /api/companies/:id` | Admin |
| `PUT /api/companies/:id` | Admin |
| `DELETE /api/companies/:id` | Admin |
