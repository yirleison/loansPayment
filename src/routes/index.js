const express = require('express');
const app = express();


app.use(require('./payment.route'));
app.use(require('./loan.route'));

module.exports = app;