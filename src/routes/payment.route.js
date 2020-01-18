const express = require('express');
const api = express.Router();
const paymentController = require('../controllers/payment.controller');

api.post('/registrar-pago', paymentController.paymentRegister);
api.get('/pagos', paymentController.listPayment);
api.get('/pago/:id', paymentController.paymentById);
api.put('/pago/:id', paymentController.paymentUpdateById);

module.exports = api;