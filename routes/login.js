var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
const SEED = require('../config/config').SEED;
const jwt = require('jsonwebtoken');
var Usuario = require('../models/usuario');

const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**
 * Método que se encarga de recibir un token de google y devolver su información correspondiente.
 * @param {String} token
 * @returns { Object } devuelve un objeto anónimo con los datos relevantes al usuario dentro de nuestra aplicación.
 */
async function getGoogleData(token) {
  //Debo desactivar la necesidad de certificado SSL, de modo contrario, es imposible realizar la verificación.
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

/**
 * Login normal
 */
app.post('/', (request, response) => {
  var body = request.body;
  Usuario.findOne({ email: body.email }, (error, usuario) => {
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
    if (!bcrypt.compareSync(body.password, usuario.password)) {
      return response.status(400).json({
        ok: false,
        mensaje: `Credenciales incorrectas. - password`,
        errors: { message: 'Credenciales incorrectas' },
      });
    }

    usuario.password = '=)';
    //Crear un token
    const token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //4 horas

    return response.status(200).json({ ok: true, token: token, usuario });
  });
});

app.post('/google', async (request, response) => {
  const token = request.body.token;
  const googleUser = await getGoogleData(token).catch((error) =>
    response.status(403).json({ ok: false, mensaje: 'Token no válido.', error })
  );

  Usuario.findOne({ email: googleUser.email }, (error, usuario) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'Error al conectar a la base de datos.',
        errors: error,
      });
    }
    //Si el usuario existe en la base de datos..
    if (usuario) {
      //y fue creado con google
      if (!usuario.google) {
        return response.status(400).json({
          ok: false,
          mensaje:
            'El usuario no fue creado con Google Sign In.\n Debe usar la autenticación normal',
          errors: { message: ' El usuario no fue creado con Google Sign In ' },
        });
      }
      //autenticación exitosa.
      else {
        //Crear un token
        const token = jwt.sign({ usuario: usuario }, SEED, {
          expiresIn: 14400,
        }); //4 horas

        return response
          .status(200)
          .json({ ok: true, token: token, usuario, usuario_id: usuario._id });
      }
    }
    //El usuario no existe.. hay que crearlo
    else {
      var usuario = new Usuario({
        nombre: googleUser.nombre,
        email: googleUser.email,
        img : googleUser.img,
        google: true,
        password: 'google'
      });

      usuario.save((error, usuarioGuardado) => {
        if(error) {
          return response.status(500).json({ ok:false, mensaje: 'Fue imposible guardar el nuevo usuario de google', errors: error });
        }
          //Crear un token
          const token = jwt.sign({ usuario: usuarioGuardado }, SEED, {
            expiresIn: 14400,
          }); //4 horas
        return response.status(200).json({ok : true, token, usuario: usuarioGuardado, usuario_id: usuarioGuardado._id});
      });

    }
  });
});

module.exports = app;
