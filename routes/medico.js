var express = require('express');
var app = express();
const autenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');

/**
 * Obtengo todos los médicos.
 */
app.get('/', (request, response) => {
  const desde = Number(request.query.desde || 0);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital', 'nombre')
    .exec((error, medicos) => {
      if (error) {
        return response.status(500).json({
          ok: false,
          mensaje: 'error al agregar el médico',
          errors: error,
        });
      }

      Medico.count({}, (_, total) => {
        return response.status(200).json({
          ok: true,
          medicos: medicos,
          total,
        });
      });
    });
});

/**
 * Creo un nuevo médico.
 */
app.post('/', autenticacion.verificaToken, (request, response) => {
  //nombre, img, usuario, hospital

  const body = request.body;
  const medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: request.usuario._id,
    hospital: body.hospital,
  });

  medico.save((error, savedMedico) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'error al agregar el médico',
        errors: error,
      });
    }

    response.status(201).json({
      ok: true,
      medico: savedMedico,
    });
  });
});

/**
 * Actualizo un médico
 */
app.put('/:id', autenticacion.verificaToken, (request, response) => {
  const id = request.params.id;
  const body = request.body;

  Medico.findById(id, (error, medico) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    }

    if (!medico) {
      return response.status(400).json({
        ok: false,
        mensaje: 'el médico que intenta modificar no existe.',
      });
    }

    medico.nombre = body.nombre;
    medico.hospital = body.hospital;
    medico.usuario = request.usuario._id;
    medico.save((error, savedMedico) => {
      if (error) {
        return response.status(400).json({
          ok: false,
          mensaje: 'no fue posible guardar el médico',
          errors: error,
        });
      }
      response.status(200).json({
        ok: true,
        medico: savedMedico,
      });
    });
  });
});

/**
 * Elimino un médico
 */
app.delete('/:id', autenticacion.verificaToken, (request, response) => {
  const id = request.params.id;
  Medico.findByIdAndRemove(id, (error, deletedMedico) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'error al agregar el médico',
        errors: error,
      });
    }

    response.status(200).json({
      ok: true,
      mensaje: 'médico eliminado',
    });
  });
});

module.exports = app;
