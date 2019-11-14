require('./src/config/config');
const app = require('./app');
const connection = require('./src/db/connection.db');
connection();
let consola = console.log;  

app.listen(process.env.PORT, () => {
    consola('Escuchando en el puerto', process.env.PORT);
});