const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// auth guard to protect authenticated routes
const checkLogIn = (req, res, next) => {
  const cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (res.locals.html) {
        res.locals.loggedInUser = decoded;
      }
      return next();
    } catch (err) {
      if (res.locals.html) {
        return res.redirect('/');
      }
      return res.status(500).json({
        errors: { common: { msg: 'Authentication failure!' } },
      });
    }
  }

  // no cookies
  if (res.locals.html) {
    return res.redirect('/');
  }
  return res.status(401).json({ error: 'Authentication failure!' });
};

// redirect already-logged-in users
const redirectLoggedIn = (req, res, next) => {
  const cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (!cookies) return next();
  return res.redirect('/inbox');
};

// role-based authorization guard
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (req.user?.role && allowedRoles.includes(req.user.role)) {
      return next();
    }

    if (res.locals.html) {
      return next(
        createError(401, 'You are not authorized to access this page!')
      );
    }
    return res.status(401).json({
      errors: { common: { msg: 'You are not authorized!' } },
    });
  };
}

module.exports = {
  checkLogIn,
  redirectLoggedIn,
  requireRole,
};
