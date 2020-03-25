const express = require('express');
const api = express.Router();
const balaceInterestController = require('../controllers/ExpensesIcomes.controller');

api.post('/registrar-balance-interest', balaceInterestController.createBalanceInterest);
api.get('/balance-intereses', balaceInterestController.lastBalanceInterest);

module.exports = api;