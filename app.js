var express = require('express');
var mongoose = require('mongoose');

var app = express();

const port = 3000;

//Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017', (error, resp) => {
    if(error) throw error;
    console.log(`Mongodb server is \x1b[32m%s\x1b[0m.`, 'online')
});

//GET Request
app.get('/', (request, response, _) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición ejecutada satisfactoriamente.'
    });
})

app.listen(port, () => {
    console.log(`Servidor \x1b[32m%s\x1b[0m en el puerto ${port}`, 'online')
})