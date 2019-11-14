const express = require('express');
const api = express.Router();
const loandController = require('../controllers/loan.controller');

api.post('/registrar-prestamo', loandController.createLoand);

module.exports = api;