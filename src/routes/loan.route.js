const express = require('express');
const api = express.Router();
const loandController = require('../controllers/loan.controller');

api.post('/registrar-prestamo', loandController.createLoand);
api.get('/prestamos', loandController.listLoan);
api.get('/prestamo/:id', loandController.loanById);
api.put('/prestamo/:id', loandController.loanUpdateById);

module.exports = api;