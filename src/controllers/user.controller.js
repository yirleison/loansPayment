const { userLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const User = require("../models/user.model");

const createUser = async (req, res) => {
    userLogger.info({
      message: "Inicio de funcionabilidad para registrar un usuario"
    });
    const payload = req.body;

    user = new User();

    user.name = payload.name; 
    user.fullName = payload.fullName; 
    user.documentType = payload.documentType; 
    user.documentNumber = payload.documentNumber; 
    user.accountType = payload.accountType; 
    user.accountNumber = payload.accountNumber; 
    user.email = payload.email; 
    user.password = payload.password; 

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



  module.exports = {
    createUser,
    listUser
  }