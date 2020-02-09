const express = require('express');
const app = express();


app.use(require('./payment.route'));
app.use(require('./loan.route'));
app.use(require('./interest.route'));
app.use(require('./user.route'));

module.exports = app;