const express = require('express');
const app = express();


app.use(require('./payment.route'));
app.use(require('./loan.route'));
app.use(require('./interest.route'));

module.exports = app;