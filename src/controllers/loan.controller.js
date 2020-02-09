const Loan = require("../models/loan.model");
const Payment = require("../models/Payment.model");
const paymentService = require("../services/payment.service");
const moment = require("moment");
const { loanLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;


const createLoand = (req, res) => {
  const loan = new Loan();
  let body = req.body;
  body.dateLoan = moment().format("YYYY-MM-DD");
  let dateLoan = body.dateLoan;
  let nextDatePayment = dateLoan;

  nextDatePayment = moment()
    .add(1, "month")
    .format("YYYY-MM-DD");
  loan.dateLoan = dateLoan;
  loan.amount = parseFloat(body.amount);
  loan.rateInterest = body.rateInterest;
  loan.statusLoan = false;
  loan.finishedDatePayment = body.finishedDatePayment
  loan.idUser = body.idUser;

  consola('modelo loan',loan)

  loanLogger.info({ message: "Modelo creado exitosamente", modelCreate: loan });

  loan.save(function(error, loanSaved) {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "Ha ocurrido un error al tratar de registrar la solicitud"
      });
    } else {
      if (!loanSaved) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      }
      loanLogger.info({
        message: "Prestamo creado en la base de datos",
        loanSave: loanSaved
      });

      payment = new Payment();

      payment.dateDeposit = null;
      payment.valueDeposit = 0;
      payment.amount = 0;
      //Calcular el valor del interes inicial
      payment.interest = parseFloat(
        calInteresValue(loan.rateInterest, loan.amount)
      );
      payment.nextDatePayment = nextDatePayment;
      payment.balanceLoand = loanSaved.amount;
      payment.statusDeposit = false;
      payment.idLoan = loanSaved._id;
      loanLogger.info({
        message: "Funcionabilidad ",
        modelCreate: payment
      });
      paymentService.initialCreatedPayment(payment).then(
        resolve => {
          if (resolve) {
            res.status(200).send({
              status: "Ok",
              loanSaved
            });
          } else {
            //En caso tal de que no se pueda crear el pago de una cuota inicial se debe proceder a crearlo por la interfaz del módulo de payment
            consola("no se pudo crear el pago inicial");
          }
        },
        error => {
          if (error) {
            consola("Error al tratar de iniciar un pago");
          }
        }
      );
    }
  });
};

const listLoan = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamos"
  });
  Loan.find({}, (error, loans) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!loans) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        loanLogger.info({
          message: "lista prestamos Realizada de manera exitosa"
        });
        /*if (loans.finishedDatePayment == 'null') {
          loans.finishedDatePayment = 'Pendiente'
        }*/
        loans.map(function(dato){
          if(dato.finishedDatePayment == "null" || dato.finishedDatePayment == null || dato.finishedDatePayment == 0){
            dato.finishedDatePayment = 'Pendiente';
            
          }
          return dato;
        });

        //res.status(200).send(messages("OK", loans));
        res.status(200).send({data: loans});
      }
    }
  });
};

const loanById = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamo por ID"
  });
  Loan.findById({ _id: req.params.id }, (error, loan) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!loan) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        loanLogger.info({
          message: "listar prestamo por ID realizado exitosamente"
        });
        res.status(200).send(messages("OK", loan));
      }
    }
  });
};

const loanUpdateById = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para actualizar un prestamo"
  });
  let body = req.body;
  body.dateLoan = moment(body.dateLoan).format("YYYY-MM-DD");
  let dateLoan = body.dateLoan;
  let nextDatePayment = dateLoan;
  nextDatePayment = moment()
    .add(1, "month")
    .format("YYYY-MM-DD");
  //consola(nextDatePayment);
  body.amount = parseFloat(body.amount);
  //body.valueIntertest = parseFloat(body.valueIntertest);

  loanLogger.info({
    message: "Modelo creado exitosamente para actualizar prestamo",
    modelCreate: body
  });

  Loan.findByIdAndUpdate(req.params.id, body, (error, loadUpdate) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados"
      });
    } else {
      if (!loadUpdate) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      } else {
        loanLogger.info({
          message: "Prestamo actualizado exitosamente"
        });
        res.status(200).send(messages("OK", loadUpdate));
      }
    }
  });
};

const calInteresValue = (interes, amount) => (amount * interes) / 100;

module.exports = {
  createLoand,
  listLoan,
  loanById,
  loanUpdateById
};
