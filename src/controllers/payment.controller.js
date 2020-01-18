const moment = require("moment");
const loanServices = require("../services/loans.service");
const Payment = require("../models/Payment.model");
const { paymentLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const payment = new Payment();

const paymentRegister = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para registrar un deposito"
  });
  const payload = req.body;

  try {
    let nextDatePayment;
    let loanService = await loanServices.loanById(payload.idLoan);
    if (req.headers.firstPayment) {
      nextDatePayment = loanServices.dateLoan;
      nextDatePayment = moment()
        .add(1, "month")
        .format("YYYY-MM-DD");
    } else {
      nextDatePayment = moment(payload.nextDatePayment)
        .add(1, "month")
        .format("YYYY-MM-DD");
      consola("Entro en el false", nextDatePayment);
    }
    payment.dateDeposit = payload.dateDeposit
      ? (payment.dateDeposit = moment().format("YYYY-MM-DD"))
      : null;
    //deposit.dateDeposit = moment().format("YYYY-MM-DD");
    payment.valueDeposit = payload.valueDeposit;
    payment.amount = payload.amount;
    payment.interest = payload.interest;
    payment.nextDatePayment = nextDatePayment;
    payment.balanceLoand = payload.balanceLoand;
    payment.statusDeposit = payload.statusDeposit;
    payment.idLoan = loanService._id;
    paymentLogger.info({
      message: "Modelo de deposito creado exitosamente",
      modelCreate: payment
    });

    payment.save((error, paymentSaved) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "Ha ocurrido un error al tratar de registrar la solicitud"
        });
      } else {
        if (!paymentSaved) {
          res.status(400).send({
            status: "false",
            message: "Error al tratar de procesar la solicitud"
          });
        }
        paymentLogger.info({
          message: "Deposito creado en la base de datos",
          paymentSaved: paymentSaved
        });
        //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
        res.status(200).send(messages('OK', paymentSaved));
      }
    });
  } catch (error) {
    res.status(500).send({
      status: "false",
      message: "Ha ocurrido un error al tratar de procesar la solicitud"
    });
  }
};

const listPayment = (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para listar depositos"
  });
  Payment.find({}, (error, payments) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!payments) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        paymentLogger.info({
          message: "lista de depositos Realizada de manera exitosa"
        });
        res.status(200).send(messages("OK", payments));
      }
    }
  });
};

const paymentById = (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para listar pago por ID"
  });
  Payment.findById({ _id: req.params.id }, (error, payment) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!payment) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        paymentLogger.info({
          message: "listar pago por ID realizado exitosamente"
        });
        res.status(200).send(messages("OK", payment));
      }
    }
  });
};

const paymentUpdateById = async(req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para actualizar un deposito"
  });
  const payload = req.body;

  try {
    let nextDatePayment;
    let loanService = await loanServices.loanById(payload.idLoan);
    if(loanService) {
      if (req.headers.firstPayment) {
        nextDatePayment = loanServices.dateLoan;
        nextDatePayment = moment()
          .add(1, "month")
          .format("YYYY-MM-DD");
      } else {
        nextDatePayment = moment(payload.nextDatePayment)
          .add(1, "month")
          .format("YYYY-MM-DD");
      }
      payload.dateDeposit = payload.dateDeposit
        ? (payment.dateDeposit = moment().format("YYYY-MM-DD"))
        : null;
        payload.nextDatePayment = nextDatePayment;  
      Payment.findByIdAndUpdate(req.params.id,payload, (error, paymentUpdate) => {
        if (error) {
          res.status(500).send({
            status: "false",
            message: "Ha ocurrido un error al tratar de registrar la solicitud"
          });
        } else {
          if (!paymentUpdate) {
            res.status(400).send({
              status: "false",
              message: "Error al tratar de procesar la solicitud"
            });
          }
          paymentLogger.info({
            message: "Deposito actualizado en la base de datos",
            paymentUpdate: paymentUpdate
          });
          //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
          res.status(200).send(messages('OK', paymentUpdate));
        }
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "false",
      message: "Ha ocurrido un error al tratar de procesar la solicitud"
    });
  }
};

module.exports = {
  paymentRegister,
  listPayment,
	paymentById,
  paymentUpdateById
	
};
