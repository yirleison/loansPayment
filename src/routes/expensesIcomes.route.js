const express = require('express');
const api = express.Router();
const expensesIncomesController = require('../controllers/ExpensesIcomes.controller');

// Pendiente programar funcioanlidades para registar entradas y salidas
//api.post('/registrar-capital', expensesIncomesController.createCapital);
//api.get('/listar-capital', expensesIncomesController.listCapital);


module.exports = api;