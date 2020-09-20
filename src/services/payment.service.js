const Payment = require("../models/Payment.model");
const { messages } = require("../utils/messages");
const { paymentLogger } = require("../../logger");

const createPayment = async (payload) => {
  return new Promise((resolve, reject) => {
    payment = new Payment(payload);
    payment.save((error, paymentSaved) => {
      if (error) {
        reject(error);
      } else {
        if (!paymentSaved) {
          reject(error);
        }
        paymentLogger.info({
          message: "Deposito creado en la base de datos",
          paymentSaved: paymentSaved,
        });
        resolve(paymentSaved);
      }
    });
  });
};

const paymentById = async (id) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar pago por ID",
  });
  return new Promise((resolve, reject) => {
    Payment.findOne({ _id: id })
      .populate({
        path: "idLoan",
        populate: {
          path: "idUser",
          model: "User",
        },
      })
      .exec((error, payment) => {
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

const paymentByIdLoan = async (id) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar pago por ID",
  });
  return new Promise((resolve, reject) => {
    Payment.find({ idLoan: id }, (error, payment) => {
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

const schedulePayment = async (modelPayment) => {
  payment = new Payment();
  payment = modelPayment;
  return new Promise((resolve, reject) => {
    payment.save((error, paymentSaved) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "Ha ocurrido un error al tratar de registrar la solicitud",
        });
      } else {
        if (!paymentSaved) {
          reject(error);
        }
        paymentLogger.info({
          message: "Deposito creado en la base de datos",
          paymentSaved: paymentSaved,
        });
        resolve(paymentSaved);
        //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
      }
    });
  });
};

const paymenUpdateById = async (idPayment, payload) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para actualizar un deposito",
  });
  return new Promise((resolve, reject) => {
    Payment.findByIdAndUpdate(
      idPayment,
      payload,
      { new: true },
      (error, paymentUpdate) => {
        if (error) {
          reject(error);
        } else {
          if (!paymentUpdate) {
            reject(error);
          }
          paymentLogger.info({
            message: "Deposito actualizado en la base de datos",
            paymentUpdate: paymentUpdate,
          });
          resolve(paymentUpdate);
        }
      }
    );
  });
};

module.exports = {
  paymentById,
  schedulePayment,
  paymenUpdateById,
  createPayment,
  paymentByIdLoan,
};
