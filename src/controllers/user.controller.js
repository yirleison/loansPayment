'use strict'
const path = require('path');
const fs = require('fs');
const { userLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const User = require("../models/user.model");
const { uploapFile } = require('../services/upload.service')

const createUser = async (req, res) => {
  userLogger.info({
    message: "Inicio de funcionabilidad para registrar un usuario"
  });
  const payload = req.body;
  //console.log(payload)
  let user = new User();
  user.fullName = payload.fullName;
  user.documentType = payload.documentType;
  user.documentNumber = payload.documentNumber;
  user.accountType = payload.accountType;
  user.accountNumber = payload.accountNumber;
  user.bank = payload.bank
  user.phone = payload.phone;
  user.email = payload.email;
  user.password = payload.password;
  user.photo = payload.photo;
  user.status = payload.status;


  user.save((error, userSaved) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "Ha ocurrido un error al tratar de registrar la solicitud"
      });
    } else {
      if (!userSaved) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      }
      userLogger.info({
        message: "Usuario creado en la base de datos",
        userSaved: userSaved
      });
      //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
      res.status(200).send(messages("OK", userSaved));
    }
  });
};

const listUser = (req, res) => {
  userLogger.info({
    message: "Inicio de funcionabilidad para listar usuarios"
  });
  User.find({}, (error, users) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!users) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        userLogger.info({
          message: "lista de usuarios Realizada de manera exitosa"
        });
        res.status(200).send(messages("OK", users));
      }
    }
  });
};

const listUserById = (req, res) => {
  userLogger.info({
    message: "Inicio de funcionabilidad para listar usuario por ID"
  });
  User.findOne({ _id: req.params.id }, (error, user) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!user) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        userLogger.info({
          message: "lista de usuario Realizada de manera exitosa"
        });
        res.status(200).send(messages("OK", user));
      }
    }
  });
};

const updateUser = (req, res) => {
  userLogger.info({
    message: "Inicio funcionalidad para actualizar un Usuario"
  });
  User.findByIdAndUpdate(req.params.id, req.body, (error, userUpdate) => {
    if (error) {
      res.status(400).send({
        status: "false",
        message: "Error al tratar de procesar la solicitud"
      });
    } else {
      if (!userUpdate) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      }
      res.status(200).send(messages("OK", userUpdate));
    }
  })
}

const changeStatus = (req, res) => {
  userLogger.info({
    message: "Inicio funcionalidad para actualizar un Usuario"
  });
  User.findByIdAndUpdate(req.params.id, {status: req.body.status},{new: true}, (error, userUpdate) => {
    if (error) {
      res.status(400).send({
        status: "false",
        message: "Error al tratar de procesar la solicitud"
      });
    } else {
      if (!userUpdate) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      }
      res.status(200).send(messages("OK", {status: userUpdate.status}));
    }
  })
} 

function getImageFile(req, res) {
  var imageFIle = req.params.imageFile;

  var pathFIle = './uploads/usuario/' + imageFIle;
  fs.exists(pathFIle, function (exists) {
    if (exists) {
      res.sendFile(path.resolve(pathFIle));
    }

    else {
      res.status(404).send({ message: 'No se ha encontrado la imagen' });
    }
  });
}


module.exports = {
  createUser,
  listUser,
  listUserById,
  getImageFile,
  updateUser,
  changeStatus
}