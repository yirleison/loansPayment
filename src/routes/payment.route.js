const express = require('express');
const api = express.Router();
const paymentController = require('../controllers/payment.controller');

api.post('/registrar-pago', paymentController.paymentRegister);
api.get('/pagos', paymentController.listPayment);
api.get('/pago/:id', paymentController.paymentById);
api.get('/pago-fecha/:id', paymentController.consultPaymentDate);
api.get('/pago-prestamo/:id', paymentController.paymentByIdLoan);
api.put('/pago/:id', paymentController.paymentUpdateById);
api.delete('/pago/:id', paymentController.deletePayment);

module.exports = api;