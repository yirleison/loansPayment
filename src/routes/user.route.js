const express = require('express');
const api = express.Router();
const userController = require('../controllers/user.controller');

api.post('/registrar-usuario', userController.createUser);
api.get('/usuarios', userController.listUser);
//api.get('/prestamo/:id', loandController.loanById);
//api.put('/prestamo/:id', loandController.loanUpdateById);

module.exports = api;