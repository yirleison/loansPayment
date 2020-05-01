const express = require('express');
const fileUpload = require('express-fileupload');
let uploadService = require('../services/upload.service');
const { ensuerAuth } = require('../middleware/authenticate')
const api = express.Router();
const userController = require('../controllers/user.controller');

api.post('/registrar-usuario', userController.createUser);
//api.get('/usuarios',[ensuerAuth], userController.listUser);
api.get('/usuarios', userController.listUser);
api.get('/usuario/:id', userController.listUserById);
api.get('/imagen/:imageFile', userController.getImageFile);
api.use(fileUpload());
api.put('/upload',uploadService.uploapFile);
api.put('/actualizar-usuario/:id',userController.changeStatus);
api.post('/login', userController.loginUser);

module.exports = api;