const express = require('express');
const api = express.Router();
const interestController = require('../controllers/interest.controller');

api.post('/registrar-interest', interestController.createInterest);
api.get('/interest', interestController.listInterest);
api.get('/interest/:id', interestController.interestById);
api.get('/interest-por-pago/:id', interestController.listInterestByIdPayment);
api.put('/interest/:id', interestController.interestUpdateById);

module.exports = api;