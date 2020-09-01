const express = require('express');
const api = express.Router();
const balaceCapitalController = require('../controllers/balanceCapital.controller');

api.post('/balance-capital', balaceCapitalController.createBalanceCapital);
api.get('/balance-capital', balaceCapitalController.listBalanceCapital);
api.put('/balance-capital/:id', balaceCapitalController.updateBalanceCapital);

module.exports = api;