// server/middleware/requireAuth.js
// Blocks access to protected API routes unless the request has a valid session.

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated. Please log in." });
}

module.exports = requireAuth;
