const ROLE_PERMISSIONS = {
  observer: ["incident:read", "notification:read", "postmortem:read"],
  analyst: [
    "incident:read",
    "incident:write",
    "notification:read",
    "postmortem:read",
    "postmortem:write",
  ],
  manager: [
    "incident:read",
    "incident:write",
    "notification:read",
    "postmortem:read",
    "postmortem:write",
    "admin:users:update",
  ],
  admin: ["*"],
};

const normalizeRole = (user) => {
  if (!user) return "observer";
  if (user.isAdmin || user.role === "admin") return "admin";
  if (["analyst", "manager", "observer"].includes(user.role)) return user.role;
  return "analyst";
};

const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes("*")) return true;
  if (permissions.includes(permission)) return true;

  const [domain] = permission.split(":");
  return permissions.includes(`${domain}:*`);
};

const authorize = (permission) => (req, res, next) => {
  const role = normalizeRole(req.user);

  if (!hasPermission(role, permission)) {
    res.status(403);
    throw new Error("Forbidden: insufficient permissions");
  }

  req.userRole = role;
  next();
};

export { authorize, normalizeRole, ROLE_PERMISSIONS };
