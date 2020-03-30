const express = require('express');
const api = express.Router();
const expensesIncomesController = require('../controllers/ExpensesIcomes.controller');

api.post('/registrar-capital', expensesIncomesController.createCapital);
api.get('/listar-capital', expensesIncomesController.listCapital);


module.exports = api;