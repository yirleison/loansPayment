const express = require('express');
const api = express.Router();
const expensesIncomesController = require('../controllers/ExpensesIcomes.controller');

 api.post('/registrar-ingresos-salidas', expensesIncomesController.createExpeseIncome);
api.get('/listar-entradas-salidas', expensesIncomesController.lastBalanceInterest);
api.get('/listar-entradas-salidas/:id', expensesIncomesController.listExpensesIncomesById);
api.put('/listar-entradas-salidas/:id', expensesIncomesController.updateExpensesIncomesById);


module.exports = api;