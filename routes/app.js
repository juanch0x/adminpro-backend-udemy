var express = require('express');
var app = express();

//GET Request
app.get('/', (request, response, _) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición ejecutada satisfactoriamente.'
    });
});

module.exports = app;