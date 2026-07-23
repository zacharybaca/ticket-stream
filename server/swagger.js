import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ticket Stream API",
      version: "1.0.0",
      description: "API documentation for the Ticket Stream server.",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and password recovery" },
      { name: "Users", description: "User profile management" },
      { name: "Incidents", description: "Incident lifecycle management" },
      { name: "Companies", description: "Company administration" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
          description: "JWT session cookie",
        },
        csrfToken: {
          type: "apiKey",
          in: "header",
          name: "X-CSRF-Token",
          description:
            "Required for unsafe authenticated requests that include the jwt cookie",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            stack: {
              type: "string",
              nullable: true,
            },
          },
          required: ["message"],
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
        AdminStatusResponse: {
          type: "object",
          properties: {
            isAdmin: { type: "boolean" },
          },
          required: ["isAdmin"],
        },
        UserReference: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
          },
          required: ["_id", "name", "username", "email"],
        },
        AuthUserResponse: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            company: { type: "string" },
          },
          required: ["_id", "username", "email", "name"],
        },
        UserProfile: {
          allOf: [
            { $ref: "#/components/schemas/UserReference" },
            {
              type: "object",
              properties: {
                avatar: {
                  type: "string",
                  format: "uri",
                  nullable: true,
                },
                role: {
                  type: "string",
                  enum: ["admin", "responder", "observer"],
                },
                isAdmin: { type: "boolean" },
                isVerified: { type: "boolean" },
                company: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: [
                "role",
                "isAdmin",
                "isVerified",
                "company",
                "createdAt",
                "updatedAt",
              ],
            },
          ],
        },
        Company: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            domain: { type: "string", example: "example.com" },
            description: { type: "string" },
            industry: { type: "string" },
            website: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["_id", "name", "domain", "createdAt", "updatedAt"],
        },
        TimelineEntry: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "created",
                "status-change",
                "assignment",
                "comment",
                "note",
              ],
            },
            message: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            createdBy: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/UserReference" },
              ],
            },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["type", "message", "createdBy", "createdAt"],
        },
        Incident: {
          type: "object",
          properties: {
            _id: { type: "string" },
            incidentCode: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: [
                "open",
                "investigating",
                "monitoring",
                "resolved",
                "closed",
              ],
            },
            priority: {
              type: "string",
              enum: ["p1", "p2", "p3", "p4"],
            },
            severity: {
              type: "string",
              enum: ["critical", "high", "medium", "low"],
            },
            application: { type: "string" },
            service: { type: "string" },
            customer: { type: "string" },
            environment: {
              type: "string",
              enum: ["production", "staging", "development"],
            },
            tags: {
              type: "array",
              items: { type: "string" },
            },
            reportedBy: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/UserReference" },
              ],
            },
            assignee: {
              nullable: true,
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/UserReference" },
              ],
            },
            timeline: {
              type: "array",
              items: { $ref: "#/components/schemas/TimelineEntry" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "_id",
            "incidentCode",
            "title",
            "description",
            "status",
            "priority",
            "severity",
            "application",
            "service",
            "customer",
            "environment",
            "tags",
            "reportedBy",
            "timeline",
            "createdAt",
            "updatedAt",
          ],
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 0 },
          },
          required: ["page", "limit", "total", "totalPages"],
        },
        IncidentListResponse: {
          type: "object",
          properties: {
            incidents: {
              type: "array",
              items: { $ref: "#/components/schemas/Incident" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
          required: ["incidents", "pagination"],
        },
        IncidentSummaryBucket: {
          type: "object",
          properties: {
            _id: { type: "string" },
            count: { type: "integer", minimum: 0 },
          },
          required: ["_id", "count"],
        },
        IncidentSummaryResponse: {
          type: "object",
          properties: {
            statusSummary: {
              type: "array",
              items: { $ref: "#/components/schemas/IncidentSummaryBucket" },
            },
            prioritySummary: {
              type: "array",
              items: { $ref: "#/components/schemas/IncidentSummaryBucket" },
            },
            openCount: { type: "integer", minimum: 0 },
            criticalCount: { type: "integer", minimum: 0 },
          },
          required: [
            "statusSummary",
            "prioritySummary",
            "openCount",
            "criticalCount",
          ],
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: [path.resolve(__dirname, "./controllers/*.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
