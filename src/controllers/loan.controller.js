const Loan = require("../models/loan.model");
const moment = require("moment");
const { loanLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const loan = new Loan();

const createLoand = (req, res) => {
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
  loan.valueIntertest = parseFloat(body.valueIntertest);
  loan.statusLoan = false;
  loan.idUser = body.idUser;

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
      //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
      res.status(200).send({
        status: "Ok",
        loanSave
      });
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
        res.status(200).send(messages("OK", loans));
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
  body.valueIntertest = parseFloat(body.valueIntertest);

  loanLogger.info({
    message: "Modelo creado exitosamente para actualizar prestamo",
    modelCreate: loan
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

module.exports = {
  createLoand,
  listLoan,
  loanById,
  loanUpdateById
};
