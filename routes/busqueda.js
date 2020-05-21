//express
var express = require('express');
var app = express();
//modelos
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');


/**
 * Método para buscar documentos especificando el tipo.
 * @param request.params.tabla {String} El nombre de la tabla
 * @param request.params.busqueda {String} El parámetro a buscar
 */
app.get('/coleccion/:tabla/:busqueda', (request, response) => {
  const table = request.params.tabla;
  const regex = new RegExp(request.params.busqueda, 'i');

  switch (table) {
    case 'usuario':
      buscarUsuarios(regex)
        .then((usuarios) => response.status(200).json({ ok: true, usuarios }))
        .catch((error) => {
          return response.status(500).json({ ok: false, message: error });
        });

      break;
    case 'hospital':
      buscarHospitales(regex)
        .then((hospitales) =>
          response.status(200).json({ ok: true, hospitales })
        )
        .catch((error) => {
          return response.status(500).json({ ok: false, message: error });
        });
      break;
    case 'medico':
      buscarMedicos(regex)
        .then((medicos) => response.status(200).json({ ok: true, medicos }))
        .catch((error) => {
          return response.status(500).json({ ok: false, message: error });
        });
      break;
      default: 
        return response.status(400).json({ok :false, message: 'Los únicos parámetros válidos son hospital, medico y usuario'})
      break;      
  }
});

/**
 * Buscar hospitales, usuarios o médicos.
 * @param {String} request.params.busqueda
 */
app.get('/todo/:busqueda', (request, response) => {
  const busqueda = request.params.busqueda;
  const regex = new RegExp(busqueda, 'i');
  Promise.all([
    buscarHospitales(regex),
    buscarMedicos(regex),
    buscarUsuarios(regex),
  ]).then((respuesta) => {
    const hospitales = respuesta[0];
    const medicos = respuesta[1];
    const usuarios = respuesta[2];
    response.status(200).json({
      ok: true,
      medicos,
      hospitales,
      usuarios,
    });
  });
});

/**
 * Método para buscar hospitales por nombre.
 * @param {RegExp} regex
 * @returns {Promise}
 */
function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate('usuario', 'nombre email')
      .exec((error, hospitales) => {
        if (error) {
          reject('error al obtener los hospitales', error);
        }
        resolve(hospitales);
      });
  });
}

/**
 * Método para buscar médicos por nombre.
 * @param {RegExp} regex
 * @returns {Promise}
 */
function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })

      .populate('hospital')
      .populate('usuario', 'nombre email')
      .exec((error, medicos) => {
        if (error) {
          reject('error al obtener los medicos', error);
        }
        resolve(medicos);
      });
  });
}

/**
 * Método para buscar usuarios por nombre o correo.
 * @param {RegExp} regex
 * @returns {Promise}
 */
function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role')
      .or([{ nombre: regex }, { email: regex }])
      .exec((error, usuarios) => {
        if (error) {
          reject('error al obtener los usuarios', error);
        }
        resolve(usuarios);
      });
  });
}

module.exports = app;
