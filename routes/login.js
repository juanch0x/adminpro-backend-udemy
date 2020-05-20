var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
const SEED = require('../config/config').SEED;
const jwt = require('jsonwebtoken');

var Usuario = require('../models/usuario');

app.post('/',(request, response) => {
    var body = request.body;
    Usuario.findOne({email: body.email}, (error, usuario) => {
        //error de conexión a la base de datos,
        if (error) {
            return response.status(400).json({
              ok: false,
              mensaje: 'Error al buscar usuario.',
              errors: error,
            });
          }
          //email inexistente.
          if (!usuario) {
            return response.status(400).json({
              ok: false,
              mensaje: `Credenciales incorrectas. - email`,
              errors: { message: 'Credenciales incorrectas' },
            });
          }
          //contraseña incorrecta.
          if(!bcrypt.compareSync(body.password, usuario.password)){
            return response.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas. - password`,
                errors: { message: 'Credenciales incorrectas' },
              });
          }

          usuario.password = '=)';
          //Crear un token
          const token = jwt.sign({ usuario: usuario}, SEED, { expiresIn: 14400 }); //4 horas

          return response.status(200).json(
              {ok:true
                , token: token
            });

    } );
});

module.exports = app;