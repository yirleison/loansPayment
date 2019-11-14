const express = require('express');
const app = express();

app.use(require('./payment.route'));

module.exports = app;