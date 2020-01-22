const Payment = require("../models/Payment.model");
const { messages } = require("../utils/messages");
const { paymentLogger } = require("../../logger");

const paymentById = async (id) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar pago por ID"
  });

  return new Promise((resolve, reject) => {
    Payment.findOne({ _id: id }, (error, payment) => {
      if (error) {
        reject(false);
      } else {
        if (!payment) {
          reject(false);
        } else {
          resolve(payment);
        }
      }
    });
  });
};

initialCreatedPayment = (modelPayment) => {
  payment = new Payment();
  payment = modelPayment;

  return new Promise((resolve, reject) => {
    payment.save((error, paymentSaved) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "Ha ocurrido un error al tratar de registrar la solicitud"
        });
      } else {
        if (!paymentSaved) {
          reject(error);
        }
        paymentLogger.info({
          message: "Deposito creado en la base de datos",
          paymentSaved: paymentSaved
        });
        resolve(paymentSaved)
        //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
      }
    });
  });
};

module.exports = {
  paymentById,
  initialCreatedPayment
};
