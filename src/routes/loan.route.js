const express = require('express');
const api = express.Router();
const loandController = require('../controllers/loan.controller');

api.post('/registrar-prestamo', loandController.createLoand);
api.get('/listar-prestamos', loandController.listLoan);
api.get('/listar-prestamo/:id', loandController.loanById);

module.exports = api;