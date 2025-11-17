require('dotenv').config();

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || 'Dooug#525210';

function superAdminAuth(req, res, next) {
  const secret = req.headers['x-super-admin-secret'] || req.headers['X-Super-Admin-Secret'];
  if (!secret || secret !== SUPER_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Acesso de super admin não autorizado' });
  }
  return next();
}

module.exports = superAdminAuth;

