const express = require('express');
const api = express.Router();
const paymentController = require('../controllers/payment.controller');

api.post('/registrar-pago', paymentController.paymentRegister);