const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');
const fs = require('fs');

/**
 * Middleware necesario para que funcione express-fileupload
 */
app.use(fileUpload());

app.put('/:tipo/:id', (request, response) => {
  const tipo = request.params.tipo;
  const id = request.params.id;

  //Valido que el tipo sea válido.
  const tiposValidios = ['hospitales', 'medicos', 'usuarios'];
  if (tiposValidios.indexOf(tipo) < 0) {
    return response.status(400).json({
      ok: false,
      mensaje: 'El tipo es inválido.',
      errors: { message: 'Los tipos válidos son: ' + tiposValidios.toString() },
    });
  }

  //Si no vienen archivos, devuelvo status 400
  if (!request.files) {
    return response.status(400).json({
      ok: false,
      mensaje: 'El archivo es obligatorio',
      errors: { message: 'El archivo es obligatorio' },
    });
  }

  //Obtener el nombre del archivo
  const archivo = request.files.imagen;
  const nombreArray = archivo.name.split('.');
  const extension = nombreArray[nombreArray.length - 1];

  //Valido extension
  const extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];
  if (extensionesValidas.indexOf(extension) < 0) {
    return response.status(400).json({
      ok: false,
      mensaje: 'Extensión invalida',
      errors: { message: 'Sólo se aceptan ' + extensionesValidas.toString() },
    });
  }

  //Nombre del archivo
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  //Path
  const path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (error) => {
    if (error) {
      return response.status(500).json({
        ok: false,
        mensaje: 'No se pudo mover el archivo',
        errors: error,
      });
    }

    return SubirPorTipo(tipo, id, nombreArchivo, response);
  });
});

/**
 *
 * @param {String} tipo
 * @param {String} id
 * @param {String} nombreArchivo
 * @param {Response} res
 */
function SubirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === 'usuarios') {
    Usuario.findById(id, (error, usuario) => {
      const pathViejo = './uploads/usuarios/' + usuario.img;

      //Si la imagen anterior existe en el disco, se borra.
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (errors) => {
          if (errors)
            return res.status(500).json({
              ok: false,
              mensaje: 'Error moviendo el archivo',
              errors,
            });
        });
      }
      usuario.img = nombreArchivo;
      usuario.save((error, usuarioActualizado) => {
        usuario.password = '=)';
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del usuario actualizada',
          usuario: usuarioActualizado,
        });
      });
    });
  } else if (tipo === 'medicos') {
    Medico.findById(id, (_, medico) => {
      const pathViejo = './uploads/medicos/' + medico.img;
      //Si la imagen anterior existe en el disco, se borra.
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (errors) => {
          if (errors)
            return res.status(500).json({
              ok: false,
              mensaje: 'Error moviendo el archivo',
              errors,
            });
        });
      }

      medico.img = nombreArchivo;
      medico.save((_, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen del médico actualizada',
          medico: medicoActualizado,
        });
      });
    });
  } else if (tipo === 'hospitales') {
    Hospital.findById(id, (_, hospital) => {
      const pathViejo = './uploads/hospitales/' + hospital.img;
      //Si la imagen anterior existe en el disco, se borra.
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (errors) => {
          if (errors)
            return res.status(500).json({
              ok: false,
              mensaje: 'Error moviendo el archivo',
              errors,
            });
        });
      }

      hospital.img = nombreArchivo;
      hospital.save((_, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imágen del hospital actualizada',
          hospital: hospitalActualizado,
        });
      });
    });
  }
}

module.exports = app;
