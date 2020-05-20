var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

//importo rutas.
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');




//body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Conexión a la base de datos
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  (error, resp) => {
    if (error) throw error;
    console.log(`Mongodb server is \x1b[32m%s\x1b[0m.`, 'online');
  }
);

//Rutas
app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Inicialización del servidor.
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor \x1b[32m%s\x1b[0m en el puerto ${port}`, 'online');
});
