const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (request, response) => {

  const tipo = request.params.tipo;
  const img = request.params.img;



  const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if(fs.existsSync(pathImagen)){
    response.sendFile(pathImagen);
  }else{
    const pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    response.sendfile(pathNoImagen);
  }


});

module.exports = app;
