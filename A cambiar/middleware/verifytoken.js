const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'UseroNoTieneNiIdeaDeAngular';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) 
    return res.status(401).json({ message: 'No se recibió token' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) 
      return res.status(403).json({ message: 'Token no válido o expirado' });
    req.user = payload; // { sub: username, iat, exp }
    next();
  });
}

module.exports = verifyToken;
