// Authentication middleware using Clerk v3 Express SDK
const { getAuth } = require('@clerk/express');

/**
 * Attaches userId and isAdmin to req; returns 401 if unauthenticated.
 */
const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = auth.userId;
  req.isAdmin = auth.sessionClaims?.publicMetadata?.role === 'admin';
  next();
};

/**
 * Chains requireAuth then enforces admin role; returns 403 if not admin.
 */
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: admin only' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
