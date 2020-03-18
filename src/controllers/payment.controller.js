const moment = require("moment");
const paymentServices = require("../services/payment.service");
const loanServices = require("../services/loans.service");
const Payment = require("../models/Payment.model");
const interestServices = require('../services/interest.service');
const { paymentLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const payment = new Payment();
const modelInterest = {};
let paymentService = {};
let paymentUpdate;
let aux = 0;

const paymentRegister = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para registrar un deposito"
  });
  const payload = req.body;

  try {
    let loanService = await loanServices.loanById(payload.idLoan);
    payload.dateDeposit = payload.dateDeposit
      ? (payment.dateDeposit = moment().format("YYYY-MM-DD"))
      : null;
    let paymentModel = new Payment(createModelPayment(payload.dateDeposit, payload.amount, payload.interest,
      payload.nextDatePayment, payload.balanceLoand, payload.statusDeposit, loanService._id))
    paymentLogger.info({
      message: "Modelo de deposito creado exitosamente",
      modelCreate: paymentModel
    });
    paymentModel.save((error, paymentSaved) => {
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
        res.status(200).send({ data: payments });
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

const paymentByIdLoan = (req, res) => {
  consola('entrrrrrrrooo', req.params.id)
  paymentLogger.info({
    message: "Inicio de funcionabilidad para listar pago por ID"
  });
  Payment.find({ idLoan: req.params.id }, (error, payment) => {
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

  consola( req.body)
  consola(idPayment)
  consola(typePayment)
  consola( req.headers)
  //Valido el tipo de pago si es 1 es porque se va pagar una cuota, si es 2 es porque se va actualizar una cuota existente..
  switch (typePayment) {
    case "1":
      consola(
        "Entro a la funcioanalidad para realizar un pago de una cuota existente"
      );
      try {
        let consultPayment = await paymentServices.paymentById(idPayment);
        let consultLoan = await loanServices.loanById(consultPayment.idLoan);
        //consola(consultPayment)
        //Pendiente consultar en la colección iterestPending si el cliente tiene intereses en mora relacionados a el id de la cuota
        //Pendiente crear el servicio
        if (consultPayment) {
          let amount = 0;
          amount = payload.amount;
          if (amount > consultPayment.balanceLoand) {
            aux = (amount - consultPayment.balanceLoand);
            consola('entro 1', consultLoan)
            if (aux == consultPayment.interest) {
              consola("Caso cuando el clidatePaymentnte paga la totalidad del prestamo", aux);
              //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
              paymentService = createModelPayment(moment().format("YYYY-MM-DD"), parseFloat(payload.amount), parseFloat(consultPayment.interest),
                consultPayment.nextDatePayment = null, 0, true, consultPayment.idLoan)
              try {
                paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
                if (paymentUpdate) {
                  consultLoan.finishedDatePayment = moment().format("YYYY-MM-DD");
                  consultLoan.statusLoan = true;
                  let modelUpdateLoan = createModelLoan(consultLoan.dateLoan, consultLoan.amount, consultLoan.rateInterest,
                    consultLoan.statusLoan, consultLoan.finishedDatePayment, consultLoan.idUser);
                  consola(modelUpdateLoan)
                  let loanUpdate = loanServices.loanUpdate(consultLoan._id, modelUpdateLoan);
                  if (loanUpdate) {
                    res.status(200).send(messages('OK', 'El prestamo se ha pagado en su totalidad'));
                  }
                }
              } catch (error) {
                consola(error)
                res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
              }
            }
          }
          if (amount > consultPayment.interest && amount < consultPayment.balanceLoand) {
            consola("Caso cuando el cliente realiza un pago mayor al valor del interes pero menor al capital", amount);
            try {
              //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
              aux = (amount - consultPayment.interest);
              if (consultPayment.balanceLoand > aux) {
                consola('El restande del monto - interes es menor que el balance', aux);
                paymentService = createModelPayment(moment().format("YYYY-MM-DD"), parseFloat(payload.amount), parseFloat(consultPayment.interest),
                  consultPayment.nextDatePayment, parseFloat((consultPayment.balanceLoand - aux)), true, consultPayment.idLoan)
              }
              paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
              if (paymentUpdate) {
                paymentService = createModelPayment(null, 0, parseFloat(calInteresValue(consultLoan.rateInterest, paymentUpdate.balanceLoand)),
                  moment(paymentUpdate.nextDatePayment).add(1, "month")
                    .format("YYYY-MM-DD"), paymentUpdate.balanceLoand, false, paymentUpdate.idLoan);
                consola(paymentService)
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
            } catch (error) {
              consola(error)
              res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
            }
          }
          if (amount < consultPayment.interest) {
            consola("Caso cuando el cliente realiza un pago menor al valor del interes ", amount);
            modelInterest.dayPayment = moment().format("YYYY-MM-DD");
            modelInterest.interestPending = parseFloat(consultPayment.interest - amount);
            modelInterest.idPayment = consultPayment._id;
            try {
              let interestCreated = await interestServices.createInteresPending(consultPayment._id, modelInterest);
              if (interestCreated) {
                //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
                paymentService = createModelPayment(moment().format("YYYY-MM-DD"), payload.amount, amount,
                  consultPayment.nextDatePayment, consultPayment.balanceLoand, true, consultPayment.idLoan);
                paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
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
                    res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                  }
                } else {
                  res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                } loanUpdate

              }
            } catch (error) {
              consola(error)
              res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
            }
          }
          if (amount == consultPayment.interest) {
            consola("Caso cuando el cliente realiza un pago y el monto ingresado es == al interes de la cuota programda", amount);
            //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
            paymentService = createModelPayment(moment().format("YYYY-MM-DD"), payload.amount, amount,
              consultPayment.nextDatePayment, consultPayment.balanceLoand, true, consultPayment.idLoan)
            paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
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
                res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
              }
            } else {
              res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
            }
          }
          //Pendiente funcionabilidad cuando un cliente quiere pagar lo que lleva del prestamo hasta la fecha.
        } else {
        }
      } catch (error) {
        error => consola(error);
        res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
      }
      break;
    case "0":
      consola("Entro a la funcionabilidad para actualizar un pago");
      try {

        payload.statusDeposit = ( payload.statusDeposit == '1' ? true : false );

        let dateDeposit = payload.dateDeposit
          ? (payment.dateDeposit = moment().format("YYYY-MM-DD"))
          : null;
        paymentService = createModelPayment(dateDeposit, parseFloat(payload.amount), parseFloat(payload.interest),
          payload.nextDatePayment, parseFloat(payload.balanceLoand), payload.statusDeposit, payload.idLoan)
        consola(paymentService)
        let paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
        consola('Hola')
        if (paymentUpdate) {
          res.status(200).send(messages("OK", paymentUpdate));
        } else {
          res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
        }
      } catch (error) {
        res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
      }
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

const createModelLoan = (dateLoan, amount, rateInterest, statusLoan, finishedDatePayment, idUser) => {
  return {
    dateLoan,
    amount,
    rateInterest,
    statusLoan,
    finishedDatePayment,
    idUser
  }
}

const calInteresValue = (interes, amount) => (amount * interes) / 100;

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
  paymentUpdateById,
  paymentByIdLoan
};
