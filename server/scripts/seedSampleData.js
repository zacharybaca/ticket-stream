import mongoose from "mongoose";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Incident from "../models/Incident.js";

const { MONGO_URI } = process.env;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "DemoPass123!";

if (!MONGO_URI) {
  console.error("Missing required environment variable: MONGO_URI");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Sample data seeding is disabled in production.");
  process.exit(1);
}

const companies = [
  {
    name: "Northwind Cloud",
    domain: "northwind.io",
    description:
      "Managed cloud platform team supporting customer billing and admin tooling.",
    industry: "SaaS",
    website: "https://northwind.io",
  },
  {
    name: "Apex Commerce",
    domain: "apexcommerce.com",
    description:
      "Global commerce operations team handling checkout, catalogs, and webhooks.",
    industry: "E-commerce",
    website: "https://apexcommerce.com",
  },
  {
    name: "Vertex Health",
    domain: "vertexhealth.org",
    description:
      "Healthcare operations organization managing patient messaging and analytics.",
    industry: "Healthcare",
    website: "https://vertexhealth.org",
  },
];

const users = [
  {
    name: "Alicia Admin",
    username: "alicia.admin",
    email: "admin@northwind.io",
    password: DEMO_PASSWORD,
    companyDomain: "northwind.io",
    role: "admin",
    isAdmin: true,
  },
  {
    name: "Maya Patel",
    username: "maya.patel",
    email: "maya@northwind.io",
    password: DEMO_PASSWORD,
    companyDomain: "northwind.io",
    role: "user",
    isAdmin: false,
  },
  {
    name: "Jordan Lee",
    username: "jordan.lee",
    email: "jordan@northwind.io",
    password: DEMO_PASSWORD,
    companyDomain: "northwind.io",
    role: "user",
    isAdmin: false,
  },
  {
    name: "Priya Nair",
    username: "priya.nair",
    email: "priya@apexcommerce.com",
    password: DEMO_PASSWORD,
    companyDomain: "apexcommerce.com",
    role: "user",
    isAdmin: false,
  },
  {
    name: "Sam Torres",
    username: "sam.torres",
    email: "sam@apexcommerce.com",
    password: DEMO_PASSWORD,
    companyDomain: "apexcommerce.com",
    role: "user",
    isAdmin: false,
  },
  {
    name: "Alex Chen",
    username: "alex.chen",
    email: "alex@vertexhealth.org",
    password: DEMO_PASSWORD,
    companyDomain: "vertexhealth.org",
    role: "user",
    isAdmin: false,
  },
];

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const timelineEntry = ({
  type,
  message,
  createdBy,
  from = "",
  to = "",
  createdAt,
}) => ({
  type,
  message,
  createdBy,
  from,
  to,
  createdAt,
});

const incidentDefinitions = [
  {
    incidentCode: "INC-1001",
    title: "Payments API latency spike",
    description:
      "Checkout requests are intermittently exceeding latency thresholds and timing out for a subset of production traffic.",
    status: "open",
    priority: "p1",
    severity: "critical",
    application: "Checkout Platform",
    service: "Payments API",
    customer: "Northwind Cloud",
    environment: "production",
    tags: ["payments", "latency", "sample-data"],
    reportedByEmail: "maya@northwind.io",
    assigneeEmail: "alex@vertexhealth.org",
    timeline: [
      {
        type: "created",
        message: "Incident created after latency alerts breached the p95 threshold.",
        createdByEmail: "maya@northwind.io",
        createdAt: hoursAgo(6),
      },
      {
        type: "assignment",
        message: "Incident assignee updated",
        from: "",
        toEmail: "alex@vertexhealth.org",
        createdByEmail: "admin@northwind.io",
        createdAt: hoursAgo(5.5),
      },
      {
        type: "comment",
        message:
          "Engineering confirmed elevated database connection wait times in the payments cluster.",
        createdByEmail: "alex@vertexhealth.org",
        createdAt: hoursAgo(5),
      },
    ],
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(5),
  },
  {
    incidentCode: "INC-1002",
    title: "Admin portal SSO failures",
    description:
      "Enterprise customers are seeing repeated SAML login failures after the latest identity provider certificate rotation.",
    status: "investigating",
    priority: "p1",
    severity: "high",
    application: "Admin Portal",
    service: "Authentication Gateway",
    customer: "Apex Commerce",
    environment: "production",
    tags: ["sso", "auth", "sample-data"],
    reportedByEmail: "priya@apexcommerce.com",
    assigneeEmail: "jordan@northwind.io",
    timeline: [
      {
        type: "created",
        message: "Incident created after multiple SSO login failures were reported by customer success.",
        createdByEmail: "priya@apexcommerce.com",
        createdAt: hoursAgo(12),
      },
      {
        type: "status-change",
        message: "Status changed from open to investigating",
        from: "open",
        to: "investigating",
        createdByEmail: "jordan@northwind.io",
        createdAt: hoursAgo(11.5),
      },
      {
        type: "comment",
        message:
          "Suspected root cause is an outdated certificate bundle in one of the auth gateway pods.",
        createdByEmail: "jordan@northwind.io",
        createdAt: hoursAgo(11),
      },
    ],
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(11),
  },
  {
    incidentCode: "INC-1003",
    title: "Delayed webhook deliveries",
    description:
      "Outbound webhooks are delayed by 10 to 15 minutes because the delivery queue is draining slowly after a spike in retries.",
    status: "monitoring",
    priority: "p2",
    severity: "medium",
    application: "Partner Integrations",
    service: "Webhook Dispatcher",
    customer: "Apex Commerce",
    environment: "production",
    tags: ["webhooks", "queue", "sample-data"],
    reportedByEmail: "sam@apexcommerce.com",
    assigneeEmail: "priya@apexcommerce.com",
    timeline: [
      {
        type: "created",
        message: "Incident created after partner callbacks exceeded the delivery SLO.",
        createdByEmail: "sam@apexcommerce.com",
        createdAt: hoursAgo(30),
      },
      {
        type: "assignment",
        message: "Incident assignee updated",
        from: "",
        toEmail: "priya@apexcommerce.com",
        createdByEmail: "admin@northwind.io",
        createdAt: hoursAgo(29.5),
      },
      {
        type: "status-change",
        message: "Retry backlog is clearing after scaling queue workers.",
        from: "investigating",
        to: "monitoring",
        createdByEmail: "priya@apexcommerce.com",
        createdAt: hoursAgo(27),
      },
      {
        type: "comment",
        message:
          "We have normalized worker CPU and are monitoring throughput before resolving.",
        createdByEmail: "priya@apexcommerce.com",
        createdAt: hoursAgo(26),
      },
    ],
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(26),
  },
  {
    incidentCode: "INC-1004",
    title: "Analytics export CSV truncation",
    description:
      "Large analytics exports are missing trailing rows when generated from the reporting service.",
    status: "resolved",
    priority: "p3",
    severity: "low",
    application: "Reporting Suite",
    service: "Export Worker",
    customer: "Vertex Health",
    environment: "staging",
    tags: ["analytics", "exports", "sample-data"],
    reportedByEmail: "alex@vertexhealth.org",
    assigneeEmail: "maya@northwind.io",
    timeline: [
      {
        type: "created",
        message: "Incident created after QA noticed missing rows in export validation.",
        createdByEmail: "alex@vertexhealth.org",
        createdAt: hoursAgo(48),
      },
      {
        type: "assignment",
        message: "Incident assignee updated",
        from: "",
        toEmail: "maya@northwind.io",
        createdByEmail: "admin@northwind.io",
        createdAt: hoursAgo(47.5),
      },
      {
        type: "status-change",
        message: "Status changed from investigating to resolved",
        from: "investigating",
        to: "resolved",
        createdByEmail: "maya@northwind.io",
        createdAt: hoursAgo(44),
      },
      {
        type: "comment",
        message:
          "Fix deployed to staging and export validation now passes with full datasets.",
        createdByEmail: "maya@northwind.io",
        createdAt: hoursAgo(43.5),
      },
    ],
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(43.5),
  },
  {
    incidentCode: "INC-1005",
    title: "Mobile push notifications not sending",
    description:
      "Push notification dispatch failed for iOS devices because an expired provider token was not rotated in time.",
    status: "closed",
    priority: "p2",
    severity: "medium",
    application: "Patient Mobile App",
    service: "Notification Service",
    customer: "Vertex Health",
    environment: "production",
    tags: ["mobile", "notifications", "sample-data"],
    reportedByEmail: "admin@northwind.io",
    assigneeEmail: null,
    timeline: [
      {
        type: "created",
        message: "Incident created after on-call saw sustained APNS delivery failures.",
        createdByEmail: "admin@northwind.io",
        createdAt: hoursAgo(72),
      },
      {
        type: "status-change",
        message: "Status changed from open to resolved",
        from: "open",
        to: "resolved",
        createdByEmail: "alex@vertexhealth.org",
        createdAt: hoursAgo(68),
      },
      {
        type: "status-change",
        message: "Status changed from resolved to closed",
        from: "resolved",
        to: "closed",
        createdByEmail: "alex@vertexhealth.org",
        createdAt: hoursAgo(60),
      },
      {
        type: "comment",
        message:
          "Provider credentials rotated successfully and delivery metrics remained healthy for 24 hours.",
        createdByEmail: "alex@vertexhealth.org",
        createdAt: hoursAgo(60),
      },
    ],
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(60),
  },
];

const INCIDENT_CODES = incidentDefinitions.map((incident) => incident.incidentCode);
const INCIDENT_DEFINITIONS_BY_CODE = new Map(
  incidentDefinitions.map((incident) => [incident.incidentCode, incident]),
);

const upsertCompanies = async () => {
  const companyByDomain = new Map();

  for (const companyData of companies) {
    let company = await Company.findOne({ domain: companyData.domain });

    if (!company) {
      company = new Company(companyData);
    } else {
      company.name = companyData.name;
      company.description = companyData.description;
      company.industry = companyData.industry;
      company.website = companyData.website;
      company.domain = companyData.domain;
    }

    await company.save();
    companyByDomain.set(company.domain, company);
  }

  return companyByDomain;
};

const upsertUsers = async (companyByDomain) => {
  const userByEmail = new Map();

  for (const userData of users) {
    const company = companyByDomain.get(userData.companyDomain);

    if (!company) {
      throw new Error(`Missing company for domain ${userData.companyDomain}`);
    }

    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = new User({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isAdmin: userData.isAdmin,
        isVerified: true,
        company: company._id,
      });
    } else {
      user.name = userData.name;
      user.username = userData.username;
      user.email = userData.email;
      user.role = userData.role;
      user.isAdmin = userData.isAdmin;
      user.isVerified = true;
      user.company = company._id;

      const passwordMatches = await user.matchPassword(userData.password);
      if (!passwordMatches) {
        user.password = userData.password;
      }
    }

    await user.save();
    userByEmail.set(user.email, user);
  }

  return userByEmail;
};

const buildIncidents = (userByEmail) =>
  incidentDefinitions.map((incident) => ({
    incidentCode: incident.incidentCode,
    title: incident.title,
    description: incident.description,
    status: incident.status,
    priority: incident.priority,
    severity: incident.severity,
    application: incident.application,
    service: incident.service,
    customer: incident.customer,
    environment: incident.environment,
    tags: incident.tags,
    reportedBy: userByEmail.get(incident.reportedByEmail)?._id,
    assignee: incident.assigneeEmail
      ? userByEmail.get(incident.assigneeEmail)?._id
      : null,
    timeline: incident.timeline.map((entry) =>
      timelineEntry({
        type: entry.type,
        message: entry.message,
        from: entry.from || "",
        to: entry.to || userByEmail.get(entry.toEmail)?._id?.toString() || "",
        createdBy: userByEmail.get(entry.createdByEmail)?._id,
        createdAt: entry.createdAt,
      }),
    ),
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  }));

const seedIncidents = async (userByEmail) => {
  await Incident.deleteMany({
    $or: [
      { tags: { $in: ["sample-data"] } },
      { incidentCode: { $in: INCIDENT_CODES } },
    ],
  });

  const incidents = buildIncidents(userByEmail);

  for (const incident of incidents) {
    const sourceIncident = INCIDENT_DEFINITIONS_BY_CODE.get(incident.incidentCode);

    if (!incident.reportedBy) {
      throw new Error(`Missing reportedBy user for ${incident.incidentCode}`);
    }

    if (sourceIncident?.assigneeEmail && !incident.assignee) {
      throw new Error(`Missing assignee user for ${incident.incidentCode}`);
    }

    for (const entry of incident.timeline) {
      if (!entry.createdBy) {
        throw new Error(
          `Missing timeline author while building ${incident.incidentCode}`,
        );
      }
    }
  }

  await Incident.insertMany(incidents);
};

const printSummary = () => {
  console.log("\nSample companies:");
  companies.forEach((company) => {
    console.log(`- ${company.name} (${company.domain})`);
  });

  if (process.env.DEMO_PASSWORD) {
    console.log(`\nSample login accounts (password: ${process.env.DEMO_PASSWORD}):`);
  } else {
    console.log("\nSample login accounts (password: DemoPass123!):");
  }
  users.forEach((user) => {
    console.log(`- ${user.email} (${user.name})`);
  });
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const companyByDomain = await upsertCompanies();
    const userByEmail = await upsertUsers(companyByDomain);
    await seedIncidents(userByEmail);

    console.log("Sample data seeded successfully.");
    printSummary();
  } catch (error) {
    console.error("Failed to seed sample data:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
