var express = require('express');
var app = express();
const autenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');

/**
 * Devuelve una lista con todos los hospitales
 */
app.get('/', (request, response) => {
  const desde = Number(request.query.desde || 0);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((error, hospitales) => {
      if (error) {
        return response.status(400).json({
          ok: false,
          mensaje: 'error en base de datos.',
          errors: error,
        });
      }

      Hospital.count({}, (_, total) => {
        response.status(400).json({
          ok: true,
          hospitales: hospitales,
          total
        });
      })

    });
});

/**
 * Crear un nuevo hospital
 */
app.post('/', autenticacion.verificaToken, (request, response) => {
  const body = request.body;
  const usuario = request.usuario._id;
  const hospital = new Hospital({
    nombre: body.nombre,
    usuario: usuario,
  });

  hospital.save((error, savedHospital) => {
    if (error) {
      return response.status(400).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    }
    response.status(201).json({
      ok: true,
      hospital: savedHospital,
    });
  });
});

/**
 * Actualizar hospital
 */
app.put('/:id', autenticacion.verificaToken, (request, response) => {
  const id = request.params.id;
  const body = request.body;

  Hospital.findById(id, (error, hospital) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    }
    if (!hospital) {
      return response.status(400).json({
        ok: false,
        mensaje: 'hospital no encontrado',
      });
    }
    hospital.nombre = body.nombre;
    hospital.img = body.img;
    hospital.usuario = request.usuario._id;

    hospital.save((error, savedHospital) => {
      if (error) {
        return response.status(400).json({
          ok: false,
          mensaje: 'error al guardar cambios.',
          errors: error,
        });
      }
      return response.status(200).json({
        ok: true,
        hospital: savedHospital,
      });
    });
  });
});

/**
 * Eliminar hospital
 */
app.delete('/:id', autenticacion.verificaToken, (request, response) => {
  const id = request.params.id;
  Hospital.findByIdAndRemove(id, (error, deletedHospital) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'error en base de datos.',
        errors: error,
      });
    }
    response.status(200).json({
      ok: true,
      message: 'borrado',
    });
  });
});

module.exports = app;
