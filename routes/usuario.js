var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const autenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

/**
 * Listar los usuarios.
 */
app.get('/', (request, response, _) => {
  Usuario.find({}, 'nombre email img role').exec((error, usuarios) => {
    if (error)
      return response.status(500).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    response.status(200).json({
      ok: true,
      usuarios: usuarios,
    });
  });
});


/**
 * Agregar un nuevo usuario.
 */
app.post('/', autenticacion.verificaToken ,(request, response) => {
  body = request.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });

  usuario.save((error, savedUser) => {
    if (error) {
      return response.status(400).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    }
    response.status(201).json({
      ok: true,
      usuario: savedUser,
    });
  });
});

/**
 * Actualizar usuario
 */
app.put('/:id', autenticacion.verificaToken , (request, response) => {
  const id = request.params.id;
  var body = request.body;

  Usuario.findById(id, (error, usuario) => {
    //Error al conectar a la db
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: error,
      });
    }
    //En el caso de que el usuario esté vacio.
    if (!usuario) {
      return response.status(400).json({
        ok: false,
        mensaje: `El usuario con el id: '${id}' no existe.`,
        errors: { message: 'No existe un usuario con ese ID' },
      });
    }

    //Actualizo el usuario.
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((error, savedUser) => {
      if (error) {
        return response.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el usuario',
          errors: error,
        });
      }
      usuario.password = ':)';
      return response.status(200).json({
        ok: true,
        usuario: savedUser,
      });
    });
  });
});

/**
 * Borrar usuario
 */
app.delete('/:id', autenticacion.verificaToken ,(request, response) => {
  const id = request.params.id;
  Usuario.findByIdAndRemove(id, (error, usuario) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: error,
      });
    }

    return response.status(200).json({
      ok: true,
      usuario: usuario,
    });
  });
});

module.exports = app;
