const moment = require("moment");
const paymentServices = require("../services/payment.service");
const loanServices = require("../services/loans.service");
const Payment = require("../models/Payment.model");
const Interest = require('../models/interest.model');
const interestServices = require('../services/interest.service');
const { paymentLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const payment = new Payment();
const modelInterest = {};
let paymentService = {};

const paymentRegister = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para registrar un deposito"
  });
  const payload = req.body;

  try {
    let nextDatePayment;
    let loanService = await loanServices.loanById(payload.idLoan);
    if (!req.headers.id) {
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

    //valido si el pago el pago existe mediante el ID que viene en el header.

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
        res.status(200).send(messages("OK", paymentSaved));
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

const paymentUpdateById = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para actualizar un deposito"
  });
  const payload = req.body;
  const idPayment = req.params.id;
  const typePayment = req.headers.typepayment;

  //Valido el tipo de pago si es 1 es porque se va pagar una cuota, si es 2 es porque se va actualizar una cuota existente..
  switch (typePayment) {
    case "1":
      consola(
        "Entro a la funcioanalidad para realizar un pago de una cuota existente"
      );
      try {
        let consultPayment = await paymentServices.paymentById(idPayment);
        //consola(consultPayment)
        //Pendiente consultar en la colección iterestPending si el cliente tiene intereses en mora relacionados a el id de la cuota
        //Pendiente crear el servicio
        let paymentUpload = {};
        if (consultPayment) {
          let aux = 0;
          let amount = 0;
          amount = payload.amount;
          if (amount > consultPayment.amount) {
            aux = amount - consultPayment.balanceLoand;
            if (aux == consultPayment.interest) {
              consola(
                "Caso cuando el cliente paga la totalidad del prestamo",
                aux
              );
            }
          }
          if (amount > consultPayment.interest && amount < consultPayment.balanceLoand) {
            consola(
              "Caso cuando el cliente realiza un pago mayor al valor del interes pero menor al capital",
              amount
            );
          }
          if (amount < consultPayment.interest) {
            consola("Caso cuando el cliente realiza un pago menor al valor del interes ", amount);
            modelInterest.dayPayment = moment().format("YYYY-MM-DD");
            modelInterest.interestPending = parseFloat(consultPayment.interest - amount);
            modelInterest.idPayment = consultPayment._id;
            //falta el campo del statePendingInteres
            try {
              let interestCreated = await interestServices.createInteresPending(consultPayment._id, modelInterest);
              if (interestCreated) {
                //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
                paymentService = createModelPayment(moment().format("YYYY-MM-DD"), payload.amount, amount,
                  consultPayment.nextDatePayment, consultPayment.balanceLoand, true, consultPayment.idLoan)
                const paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
                if (paymentUpdate) {
                  paymentService = createModelPayment(null, 0, consultPayment.interest,
                    moment(consultPayment.nextDatePayment).add(1, "month")
                      .format("YYYY-MM-DD"), consultPayment.balanceLoand, false, consultPayment.idLoan);
                  try {
                    let createPayment = await paymentServices.createPayment(paymentService);

                    if (createPayment) {
                      res.status(200).send(messages("OK", paymentService));
                    }
                  } catch (error) {
                    consola(error)
                  }
                } else {

                }
              }
              else {

              }
            } catch (error) {
              consola(error)
            }
          }
          if (amount == consultPayment.interest) {
            consola(
              "Caso cuando el cliente realiza un pago y el monto ingresado es == al interes de la cuota programda",
              amount
            );
          }
          //Pendiente funcionabilidad cuando un cliente quiere pagar lo que lleva del prestamo hasta la fecha.
        } else {
        }
      } catch (error) {
        error => consola(error);
      }
      break;
    case "0":
      break;
    default:
      consola("Entro al error del swicth");
      break;
  }
};

const createModelPayment = (dateDeposit, amount, interest, nextDatePayment, balanceLoand, statusDeposit, idLoan) => {
  return {
    dateDeposit,
    amount,
    interest,
    nextDatePayment,
    balanceLoand,
    statusDeposit,
    idLoan
  }
}

const consultPendingInteres = (idPayment) => {
  try {
    
    return true;
  } catch (error) {
    
  }
}

module.exports = {
  paymentRegister,
  listPayment,
  paymentById,
  paymentUpdateById
};
