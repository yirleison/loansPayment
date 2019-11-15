const mongoose = require('mongoose');
require('../config/config');
const consola = console.log;
const connectiondb = () => {
    mongoose.connect(process.env.URLDB, (err, res) => {
        if (err) {
            throw err;
        }
        consola('La base de datos ha sido conectada exitosamente');
    });
}

module.exports = connectiondb;