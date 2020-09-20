const express = require('express');
const api = express.Router();
const balaceCapitalController = require('../controllers/balanceCapital.controller');

api.post('/registrar-capital', balaceCapitalController.createBalanceCapital);
api.get('/listar-capital', balaceCapitalController.listBalanceCapital);
api.put('/actualizar-capital/:id', balaceCapitalController.updateBalanceCapital);

module.exports = api;