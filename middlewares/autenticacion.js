const SEED = require('../config/config').SEED;
const jwt = require('jsonwebtoken');

/**
 * Verificar Token Middleware
 */
exports.verificaToken = function (request, response, next) {
  var token = request.query.token;
  jwt.verify(token, SEED, (error, decoded) => {
    if (error) {
      return response.status(401).json({
        ok: false,
        mensaje: 'No Autorizado',
        errors: error,
      });
    }
    request.usuario = decoded.usuario;
    next();
  });
};
