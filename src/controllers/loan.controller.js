const Loan = require("../models/loan.model");
const Payment = require("../models/Payment.model");
const User = require("../models/user.model");
const paymentService = require("../services/payment.service");
const userService = require("../services/user.service");
const BalanceCapital = require("../models/balanceCapital.model");
const expensesIcomesService = require("../services/expensesIcomes.service");
const ExpensesIcomes = require("../models/expensesIcomes.model");
const moment = require("moment");
const { loanLogger } = require("../../logger");
const { userLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const balanceCapitalService = require("../services/balanceCapital.service");
const { error, log } = require("winston");
const {
  validateBalanceForLoan,
} = require("../services/balanceCapital.service");
const logger = require("../../logger");
const consola = console.log;
let expensesIcomes;

const createLoand = async (req, res) => {
  const loan = new Loan();
  let body = req.body;
  let nextDatePayment = moment(new Date(body.dateLoan)).add(1, "month").format("YYYY-MM-DD");
  loan.dateLoan = body.dateLoan
  loan.amount = parseFloat(body.amount);
  loan.rateInterest = body.rateInterest;
  loan.statusLoan = false;
  loan.finishedDatePayment = body.finishedDatePayment;
  loan.idUser = body.idUser;
  loan.description = body.description
  loanLogger.info({ message: "Modelo creado exitosamente", modelCreate: loan });

  try {
    let consultBalanceCapital = await balanceCapitalService.consultBalanceCapital();

    if (consultBalanceCapital) {
      if (validateBalanceForLoan(loan.amount, consultBalanceCapital)) {
        //Create loan
        loan.save(async (error, loanSaved) => {
          if (error) {
            res.status(500).send({
              status: "false",
              message:
                "Ha ocurrido un error al tratar de registrar la solicitud",
            });
          } else {
            if (!loanSaved) {
              res.status(400).send({
                status: "false",
                message: "Error al tratar de procesar la solicitud",
              });
            } else {
             // console.log(loanSaved)
              loanLogger.info({
                message: "Prestamo creado en la base de datos",
                loanSave: loanSaved,
              });
              //Create pyament model
              payment = new Payment();
              payment.dateDeposit = null;
              payment.valueDeposit = 0;
              payment.amount = 0;
              //calculate interest initial value
              payment.interest = calInteresValue(parseFloat(loan.rateInterest), loan.amount).toFixed(2)
              payment.nextDatePayment = nextDatePayment;
              payment.balanceLoand = parseFloat(loanSaved.amount).toFixed(2);
              payment.statusDeposit = false;
              payment.idLoan = loanSaved._id;
              try {
                let paymentResponse = await paymentService.schedulePayment(
                  payment
                );
                if (paymentResponse) {
                  try {
                    let { fullName } = await userService.getUserById(loanSaved.idUser)
                    if (fullName) {
                      // Crete model expersesIcomes
                      let expensesIcomes = createModelExpensesIcomes(
                        moment(new Date(body.dateLoan)).format("YYYY-MM-DD"),
                        0,
                        loan.amount,
                        `Prestamo registrado al cliente ${fullName}`,
                        1,
                        loanSaved._id.toString()
                      )
                      try {
                        let expensesIcomesResponse = await expensesIcomesService.createExpensesOrIcomes(
                          expensesIcomes
                        );
                        if (expensesIcomesResponse) {
                          let payload = balanceCapitalService.PayloadForUpdateBalanceCapital(
                            expensesIcomes.expenses,
                             consultBalanceCapital
                          );
                          //console.log('payload ---------> ',payload)
                          try {
                            let upatateBalanceCapitalService = balanceCapitalService.updateCapital(
                              payload,
                              consultBalanceCapital[0]._id
                            );
                            if (upatateBalanceCapitalService) {
                              res.status(200).send({
                                status: "Ok",
                                loanSaved,
                              });
                            }
                          } catch (error) {
                            console.log("Error updating Capital ---> ", error);
                          }
                        }
                      } catch (error) {
                        console.log("Error creating expensesIcomesResponse ---> ", error);
                      }
                    }
                  } catch (error) {
                    console.log("Error consult getUserById ---> ", error);
                  }
                }
              } catch (error) {
                console.log("Error paymentResponse save ---> ", error);
              }
            }
          }
        });
      } else {
        res.status(200).send({
          status: "false",
          message: "El monto ingresado supera el capital",
        });
      }
    }
  } catch (error) {
    console.log("Error loan save ---> ", error);
  }
};

const listLoan = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamos",
  });
  Loan.find({})
    .populate({ path: "idUser" })
    .exec((error, loans) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "La consulta a la base de datos no devolvio resultados",
        });
      } else {
        if (!loans) {
          res.status(400).send({
            status: "false",
            message: "Error al tratar de procesar la solicitud",
          });
        } else {
          loanLogger.info({
            message: "lista prestamos Realizada de manera exitosa",
          });
          /*if (loans.finishedDatePayment == 'null') {
          loans.finishedDatePayment = 'Pendiente'
        }*/
          loans.map(function (dato) {
            if (
              dato.finishedDatePayment == "null" ||
              dato.finishedDatePayment == null ||
              dato.finishedDatePayment == 0
            ) {
              dato.finishedDatePayment = "Pendiente";
            }
            return dato;
          });

          //res.status(200).send(messages("OK", loans));
          res.status(200).send({ data: loans });
        }
      }
    });
};

const loanById = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamo por ID",
  });
  Loan.findById({ _id: req.params.id })
    .populate({ path: "idUser" })
    .exec((error, loan) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "La consulta a la base de datos no devolvio resultados",
        });
      } else {
        if (!loan) {
          res.status(400).send({
            status: "false",
            message: "Error al tratar de procesar la solicitud",
          });
        } else {
          loanLogger.info({
            message: "listar prestamo por ID realizado exitosamente",
          });

          res.status(200).send(messages("OK", loan));
        }
      }
    });
};

const loanUpdateById = (req, res) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para actualizar un prestamo",
  });
  let body = req.body;
  body.dateLoan = moment(body.dateLoan).format("YYYY-MM-DD");
  let dateLoan = body.dateLoan;
  let nextDatePayment = dateLoan;
  nextDatePayment = moment().add(1, "month").format("YYYY-MM-DD");
  //consola(nextDatePayment);
  body.amount = parseFloat(body.amount);
  //body.valueIntertest = parseFloat(body.valueIntertest);

  loanLogger.info({
    message: "Modelo creado exitosamente para actualizar prestamo",
    modelCreate: body,
  });

  Loan.findByIdAndUpdate(req.params.id, body, (error, loadUpdate) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "La consulta a la base de datos no devolvio resultados",
      });
    } else {
      if (!loadUpdate) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud",
        });
      } else {
        loanLogger.info({
          message: "Prestamo actualizado exitosamente",
        });
        res.status(200).send(messages("OK", loadUpdate));
      }
    }
  });
};

const loanByIdUser = (req, res) => {
  let p = null;
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamo por ID de usuario",
  });
  Loan.find({ idUser: req.params.id })
    .populate({ path: "idUser" })
    .exec((error, loans) => {
      if (error) {
        return res.status(500).send({
          status: "false",
          message: "La consulta a la base de datos no devolvio resultados",
        });
      } else {
        if (!loans) {
          return res.status(400).send({
            status: "false",
            message: "Error al tratar de procesar la solicitud",
          });
        } else {
          loanLogger.info({
            message: "listar prestamo por ID de usuario realizado exitosamente",
          });
          if (loans.length > 0) {
            p = loans.filter((x) => x.idUser.status == "1");
            if (p.length > 0) {
              p.map(function (dato) {
                if (
                  dato.finishedDatePayment == "null" ||
                  dato.finishedDatePayment == null ||
                  dato.finishedDatePayment == 0
                ) {
                  dato.finishedDatePayment = "Pendiente";
                }
                return dato;
              });
            }

            //console.log('Loan----------> entro else')
            return res.status(200).send({ data: p });
          } else {
            User.findOne({ _id: req.params.id }, (error, user) => {
              if (error) {
                res.status(500).send({
                  status: "false",
                  message:
                    "La consulta a la base de datos no devolvio resultados",
                });
              } else {
                if (!user) {
                  res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud",
                  });
                } else {
                  userLogger.info({
                    message: "lista de usuario Realizada de manera exitosa",
                  });
                  return res.status(200).send({ data: { user } });
                }
              }
            });
          }
          // return res.status(200).send({ data: p });
        }
      }
    });
};

const calInteresValue = (interes, amount) => ((amount * interes) / 100);
const createModelExpensesIcomes = (
  date,
  income,
  expenses,
  note,
  type,
  id
) => {
  return {
    date,
    income: parseFloat(income),
    expenses: parseFloat(expenses),
    note,
    type,
    id,
  };
};

const getNameUser = (idUser) => { };

const getCurrenDateAndNexPaymentDate = (date) => {
  let currentDate = moment(new Date()).format("YYYY-MM-DD");
  let nextDatePayment = moment(new Date()).add(1, "month").format("YYYY-MM-DD");

  return { current_date: currentDate, nextDate_paymentDate: nextDatePayment };
};

module.exports = {
  createLoand,
  listLoan,
  loanById,
  loanUpdateById,
  loanByIdUser,
};
