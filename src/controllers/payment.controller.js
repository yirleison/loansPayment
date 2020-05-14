const moment = require("moment");
const paymentServices = require("../services/payment.service");
const loanServices = require("../services/loans.service");
const Payment = require("../models/Payment.model");
const BalanceCapital = require("../models/balanceCapital.model");
const BalanceInteres = require("../models/expensesIcomes.model");
//Services
const interestServices = require('../services/interest.service');
const expensesIcomesService = require('../services/expensesIcomes.service');

const { paymentLogger } = require("../../logger");
const { balanceCapilalLogger } = require("../../logger");
const { balanceInterestLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const payment = new Payment();
let modelInterest;
let paymentService = {};
let paymentUpdate;
let modelIcomeExpense;
let aux = 0;
let dataInterestPending;
let interestPending = 0;


const paymentRegister = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para registrar un deposito"
  });
  const payload = req.body;
  payload.statusDeposit = (payload.statusDeposit == '1' || payload.statusDeposit == 1 ? false : true);
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
  Payment.findById({ _id: req.params.id }).exec((error, payment) => {
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

const paymentByIdLoan = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para listar pago por ID"
  });
  Payment.find({ idLoan: req.params.id }).sort({ statusDeposit: false }).exec(async (error, payment) => {
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
        console.log('pago', payment)
        //Consulto el interes pendiente
        let dataInterestPending;
        let consulInterestPendingByIdPayment

        let p = [];
        let t = []
        //objectInterest;
        try {
          for (let i = 0; i < payment.length; i++) {
            consulInterestPendingByIdPayment = await interestServices.consulInterestPendingByIdPayment(payment[i]._id)
            p.push(...consulInterestPendingByIdPayment)
          }
          payment.forEach((dat) => {
            t.push({
              _id: dat._id,
              dateDeposit: dat.dateDeposit,
              amount: dat.amount,
              interest: dat.interest,
              nextDatePayment: dat.nextDatePayment,
              balanceLoand: dat.balanceLoand,
              statusDeposit: dat.statusDeposit,
              idLoan: dat.idLoan,
              interestPending: getPendingInterest(p, dat._id)
            })
          })
          res.status(200).send(messages('OK', t))
        } catch (error) {
          console.log('Falta personalizar el error', error)
        }
      }
    }
  });
};

const paymentByIdUser = async (req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para listar pago por ID"
  });
  Payment.find({ idUser: req.params.id }).sort({ statusDeposit: false }).exec(async (error, payment) => {
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
        console.log('pago', payment)
        //Consulto el interes pendiente
        let dataInterestPending;
        let consulInterestPendingByIdPayment

        let p = [];
        let t = []
        //objectInterest;
        try {
          for (let i = 0; i < payment.length; i++) {
            consulInterestPendingByIdPayment = await interestServices.consulInterestPendingByIdPayment(payment[i]._id)
            p.push(...consulInterestPendingByIdPayment)
          }
          payment.forEach((dat) => {
            t.push({
              _id: dat._id,
              dateDeposit: dat.dateDeposit,
              amount: dat.amount,
              interest: dat.interest,
              nextDatePayment: dat.nextDatePayment,
              balanceLoand: dat.balanceLoand,
              statusDeposit: dat.statusDeposit,
              idLoan: dat.idLoan,
              interestPending: getPendingInterest(p, dat._id)
            })
          })
          res.status(200).send(messages('OK', t))
        } catch (error) {
          console.log('Falta personalizar el error', error)
        }
      }
    }
  });
};

getPendingInterest = (data, id) => {
  let result = data.find(x => x.idPayment.toString() === id.toString());
  //console.log('Data',data)
  //console.log('Result',result)
  return result ? result.interestPending : 0;
}

returnNewsInterest = (data, callback) => {
  let p = data.map((element) => {
    return {
      _id: element._id,
      interestPending: element.interestPending,
      state: element.state
    };
  })
  //console.log(p)
  return callback(p);
}

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
      consola("Entro a la funcioanalidad para realizar un pago de una cuota existente");
      consola(payload)
      try {
        let consultPayment = await paymentServices.paymentById(idPayment);
        let consultLoan = await loanServices.loanById(consultPayment.idLoan);
        //Consulto el interes pendiente
        console.log('Consulta interes pendiente', await consultInteresPending(consultPayment))
        //Pendiente consultar en la colección iterestPending si el cliente tiene intereses en mora relacionados a el id de la cuota
        //Pendiente crear el servicio
        if (consultPayment) {
          let amount = 0;
          amount = payload.amount;
          if (amount > consultPayment.balanceLoand) {
            aux = (amount - consultPayment.balanceLoand);
            if (aux == consultPayment.interest) {
              consola("Caso cuando el clidatePaymentnte paga la totalidad del prestamo", aux);
              //Creo un modelo de pagos para actualizar una cuota de pago existente....
              paymentService = createModelPayment(moment().format("YYYY-MM-DD"), parseFloat(payload.amount), parseFloat(consultPayment.interest),
                consultPayment.nextDatePayment = null, 0, true, consultPayment.idLoan)
              try {
                paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
                if (paymentUpdate) {
                  consultLoan.finishedDatePayment = moment().format("YYYY-MM-DD");
                  consultLoan.statusLoan = true;
                  let modelUpdateLoan = createModelLoan(consultLoan.dateLoan, consultLoan.amount, consultLoan.rateInterest,
                    consultLoan.statusLoan, consultLoan.finishedDatePayment, consultLoan.idUser);
                  //consola(modelUpdateLoan)
                  let loanUpdate = loanServices.loanUpdate(consultLoan._id, modelUpdateLoan);
                  if (loanUpdate) {
                    //Creo un modelo para crear una entrada de dinero y actualizo el capital
                    modelIcomeExpense = createModelIcomeExpense(moment().format("YYYY-MM-DD"), null, payload.amount, 0, 'Recaudos de ' + consultLoan._id);
                    createIcome(modelIcomeExpense, 1, 0, 0, 0, 0, consultLoan.amount, consultPayment.interest, function (data, error) {
                      if (data) {
                        //res.status(200).send(messages("OK", paymentService));
                        consola(messages('OK', 'El prestamo se ha pagado en su totalidad'))
                        res.status(200).send(messages('OK', 'El prestamo se ha pagado en su totalidad'));
                      }
                      if (error) {
                        console.log(error)
                      }
                    });

                  }
                }
              } catch (error) {
                consola(error)
                res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
              }
            }
          }
          if (amount == consultPayment.balanceLoand) {
            consola("Caso cuando el cliente realiza un pago y el monto ingresado es == al valor del prestamo", amount);
            //Actualizo la cuota de pago existente y creo una nueva cuota de pago....
            paymentService = createModelPayment(moment().format("YYYY-MM-DD"), payload.amount, consultPayment.interest,
              consultPayment.nextDatePayment, (consultPayment.balanceLoand - consultPayment.interest), true, consultPayment.idLoan)
            paymentUpdate = await paymentServices.paymenUpdateById(idPayment, paymentService);
            if (paymentUpdate) {
              paymentService = createModelPayment(null, 0, calInteresValue(consultLoan.rateInterest, (consultPayment.balanceLoand - consultPayment.interest)),
                moment(consultPayment.nextDatePayment).add(1, "month")
                  .format("YYYY-MM-DD"), (consultPayment.balanceLoand - consultPayment.interest), false, consultPayment.idLoan);
              try {
                let createPayment = await paymentServices.createPayment(paymentService);
                if (createPayment) {
                  //Creo un modelo para crear una entrada de dinero y actualizo el capital
                  modelIcomeExpense = createModelIcomeExpense(moment().format("YYYY-MM-DD"), null, consultPayment.interest, 0, 'Recaudos de ' + consultLoan._id);
                  createIcome(modelIcomeExpense, 0, 0, 0, 0, 1, (consultPayment.balanceLoand - consultPayment.interest), (consultPayment.interest), function (data, error) {
                    if (data) {
                      //Pendiente manejar el error... 
                      res.status(200).send(messages("OK", paymentService));
                    }
                    else {
                      res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                    }
                  });
                }
              } catch (error) {
                consola(error)
                res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
              }
            } else {
              res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
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
                    modelIcomeExpense = createModelIcomeExpense(moment().format("YYYY-MM-DD"), null, consultPayment.interest, aux, 'Recaudos de ' + consultLoan._id);
                    createIcome(modelIcomeExpense, 0, 1, 0, 0, 0, (consultPayment.balanceLoand - aux), consultPayment.interest, function (data, error) {
                      if (data) {
                        //Pendiente manejar el error...
                        res.status(200).send(messages("OK", paymentService));
                      }
                      else {
                        res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                      }
                    });
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
            //Creo un interes pendiente..

            try {
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
                    //Creo un nuevo interest de mora
                    modelInterest = createModelInterestPending(moment().format("YYYY-MM-DD"), (consultPayment.interest - amount), false, createPayment._id)
                    if (await interestServices.createInteresPending(modelInterest)) {
                      //Creo un modelo para crear una entrada de dinero y actualizo el capital
                      modelIcomeExpense = createModelIcomeExpense(moment().format("YYYY-MM-DD"), null, amount, 0, 'Recaudos de ' + consultLoan._id);
                    }
                    createIcome(modelIcomeExpense, 0, 0, 1, 0, 0, 0, 0, function (data, error) {
                      if (data) {
                        console.log('Data', data)
                        res.status(200).send(messages("OK", paymentService));
                      }
                      if (error) {
                        console.log(error)
                      }
                    });
                  }
                } catch (error) {
                  consola(error)
                  res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                }
              } else {
                res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
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
                  //Creo un modelo para crear una entrada de dinero y actualizo el capital
                  modelIcomeExpense = createModelIcomeExpense(moment().format("YYYY-MM-DD"), null, consultPayment.interest, 0, 'Recaudos de ' + consultLoan._id);
                  createIcome(modelIcomeExpense, 0, 0, 0, 1, 0, 0, consultPayment.interest, function (data, error) {
                    if (data) {
                      //Pensiente manejar el error...
                      res.status(200).send(messages("OK", paymentService));
                    }
                    else {
                      res.status(500).send(messages('false', 'Ha ocurrido un error al tratar de procesar la solicitud'));
                    }
                  });
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

        payload.statusDeposit = (payload.statusDeposit == '1' || payload.statusDeposit == 1 ? false : true);
        //consola(payload)
        let dateDeposit = payload.dateDeposit
          ? (payment.dateDeposit = moment(payload.dateDeposit).format("YYYY-MM-DD"))
          : null;
        paymentService = createModelPayment(dateDeposit, parseFloat(payload.amount), parseFloat(payload.interest),
          moment(payload.nextDatePayment).format("YYYY-MM-DD"), parseFloat(payload.balanceLoand), payload.statusDeposit, payload.idLoan)
        consola('paymentService', moment(payload.nextDatePayment).format("YYYY-MM-DD").toString())
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

const deletePayment = (req, res) => {

  console.log(req.params)
  Payment.findOneAndRemove(req.params.id, (error, paymentRemove) => {
    if (error) {
      res.status(500).send({
        status: "false",
        message: "Ha ocurrido un error interno al tratar de procesar la solicitud"
      });
    } else {
      if (!paymentRemove) {
        res.status(400).send({
          status: "false",
          message: "Error al tratar de procesar la solicitud"
        });
      }
      paymentLogger.info({
        message: "Deposito eliminado de la base de datos",
        paymentRemove: paymentRemove
      });
      //Enviar un push al fron para indicarle al usuario de que debe de crearle una cuata de apgo al usuario
      res.status(200).send(messages("OK", paymentRemove));
    }
  })
}
const createModelPayment = (dateDeposit, amount, interest, nextDatePayment, balanceLoand, statusDeposit, idLoan) => {
  return {
    dateDeposit,
    amount: Number(parseFloat(amount).toFixed(2)),
    interest: Number(parseFloat(interest).toFixed(2)),
    nextDatePayment,
    balanceLoand: Number(parseFloat(balanceLoand).toFixed(2)),
    statusDeposit,
    idLoan
  }
}

const createModelLoan = (dateLoan, amount, rateInterest, statusLoan, finishedDatePayment, idUser) => {
  return {
    dateLoan,
    amount: Number(parseFloat(amount)),
    rateInterest,
    statusLoan,
    finishedDatePayment,
    idUser
  }
}

const createModelInterestPending = (dayPayment, interestPending, state, idPayment) => {
  return {
    dayPayment,
    interestPending: Number(interestPending),
    state,
    idPayment
  }
}

consultInteresPending = async (consultPayment) => {
  try {
    let consulInterestPendingByIdPayment = await interestServices.consulInterestPendingByIdPayment(consultPayment._id)
    if (consulInterestPendingByIdPayment) {
      dataInterestPending = consulInterestPendingByIdPayment.filter((data) => {
        if (data => (moment(data.dayPayment).toISOString().slice(0, 10) == consultPayment.nextDatePayment.toString()) && (data.state == fasle))
          return data
      })
      if (dataInterestPending.length > 0) {
        //Actualizo este interes pendiente
        interestPending = dataInterestPending[0].interestPending;
      }
      else {
        interestPending = 0;
      }
      return interestPending;
    }
    else {
      console.log('Pendiente procesar el error')
    }

  } catch (error) {
    console.log('hola', error)
  }
}

updateInterestPending = async (payload, id) => {
  if (await interestServices.interestUpdateById(id, payload)) {
    console.log('Interes actualizado exitosamente')
    interestPending = dataInterestPending[0].interestPending;
    return interestPending;
  }
}

const createModelIcomeExpense = (dateIncome, dateExpense, income, expenses, note) => {
  return {
    dateIncome,
    dateExpense,
    income: Number(parseFloat(income).toFixed(2)),
    expenses: Number(parseFloat(expenses).toFixed(2)),
    note
  }
}

const calInteresValue = (interes, amount) => (amount * interes) / 100;

const consultPendingInteres = (idPayment) => {
  try {

    return true;
  } catch (error) {

  }
}

createIcome = async (modelIcomeExpense, amount1, amount2, amount3, amount4, amount5, amountCapital, amountInterest, callback) => {
  /**
 * 1 ====> amount > consultPayment.balanceLoand
 * 2 ====> consultPayment.balanceLoand > aux
 * 3 ====> amount < consultPayment.interest
 * 4 ====> amount == consultPayment.interest
 * 5 ====> amount == consultPayment.balanceLoand
 * 6 ====>
 * 7 ====>
 * 8 ====>
 * 9 ====>
 * 
 */
  let payload;
  let response;
  let balanceInterest = new BalanceInteres(modelIcomeExpense)
  consola(modelIcomeExpense)
  try {
    let balanceCapital = await expensesIcomesService.consultBalanceCapital();
    balanceCapital = balanceCapital[0];
    if (balanceCapital) {
      //Caso cuando el clidatePaymentnte paga la totalidad del prestamo
      if (amount1 == 1 && amountCapital > 0 && amountInterest > 0) {
        payload = {
          balanceCapital: (balanceCapital.balanceCapital + amountCapital),
          balanceInterest: (balanceCapital.balanceInterest + amountInterest),
        }
      }
      //Caso cuando el cliente realiza un pago mayor al valor del interes pero menor al capital
      if (amount2 == 1 && amountCapital > 0 && amountInterest > 0) {
        payload = {
          balanceCapital: (balanceCapital.balanceCapital + amountCapital),
          balanceInterest: (balanceCapital.balanceInterest + amountInterest),
        }
      }
      //Caso cuando el cliente realiza un pago menor al valor del interes
      if (amount3 == 1 && amountInterest == 0) {
        payload = {
          balanceCapital: (balanceCapital.balanceCapital),
          balanceInterest: (modelIcomeExpense.income + balanceCapital.balanceInterest),
        }
      }
      //Caso cuando el cliente realiza un pago y el monto ingresado es == al interes de la cuota programda
      if (amount4 == 1 && amountCapital == 0 && amountInterest > 0) {
        payload = {
          balanceCapital: (balanceCapital.balanceCapital),
          balanceInterest: (modelIcomeExpense.income + balanceCapital.balanceInterest),
        }
      }
      if (amount5 == 1 && amountCapital > 0 && amountInterest > 0) {
        payload = {
          balanceCapital: (balanceCapital.balanceCapital + amountCapital),
          balanceInterest: (modelIcomeExpense.income + balanceCapital.balanceInterest),
        }
      }
      consola(payload)
      balanceInterest.save(async (error, balanceSaved) => {
        if (error) {
          return "Ha ocurrido un error interno al tratar de procesar la solicitud"
        } else {
          if (!balanceSaved) {
            return "Error al tratar de procesar la solicitud"
          }
          try {
            response = await expensesIcomesService.updateCapital(payload, balanceCapital._id);
            if (response) {
              console.log('response', response)
              return callback(response)
            }

          } catch (error) {
            callback(error)
          }
        }
      })
    }
    else {
      callback('No se ha podido generar el registro del capital asociado a este pago')
    }

  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  paymentRegister,
  listPayment,
  paymentById,
  paymentUpdateById,
  paymentByIdLoan,
  deletePayment,
  paymentByIdUser
};
