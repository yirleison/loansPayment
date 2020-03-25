const BalanceInteres = require("../models/expensesIcomes.model");
const BalanceCapital = require('../models/balanceCapital.model')
const { balanceInterestLogger } = require("../../logger");
const { balanceCapilalLogger } = require("../../logger");

const createIcome =  (body) => {
  balanceInteres = new ExpensesIcomes();
  balanceInteres.dateIncome = moment(body.dateIncome).format("YYYY-MM-DD");
  balanceInteres.dateExpense = null;
  balanceInteres.income = Number(parseFloat(body.income));
  balanceInteres.expenses = Number(parseFloat(body.expenses));
  balanceInteres.note = body.note;
  let auxInterest = 0;
  let auxCapital = 0;
  let payload;
  return new Promise((reject, resolve) => {
    try {
      let balanceCapital =  expensesIcomesService.consultBalanceCapital();
      console.log(balanceCapital[0]._id)
      if (balanceCapital[0].balanceCapital == 0 && balanceCapital[0].balanceInterest == 0 && body.expenses > 0) {
        console.log('No se puede crear una salida de dinero por que no hay saldo en caja')
      }
      else {
        if (body.expenses) {
          if (body.expenses > balanceCapital[0].balanceInterest) {
            auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
            if ((auxInterest - balanceCapital[0].balanceCapital)) {
              auxCapital = (balanceCapital[0].balanceCapital - auxInterest);
              payload = {
                balanceCapital: auxCapital,
                balanceInterest: 0,
              }
            }
          }
          if (body.expenses < balanceCapital[0].balanceInterest) {
            auxInterest = (balanceCapital[0].balanceInterest - body.expenses);
            payload = {
              balanceCapital: balanceCapital[0].balanceCapital,
              balanceInterest: auxInterest,
            }
          }
          if (body.expenses == balanceCapital[0].balanceInterest) {
            payload = {
              balanceCapital: balanceCapital[0].balanceCapital,
              balanceInterest: 0,
            }
          }
          if (body.expenses > balanceCapital[0].balanceInterest) {
            auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
            if (auxInterest == balanceCapital[0].balanceCapital) {
              payload = {
                balanceCapital: 0,
                balanceInterest: 0,
              }
            }
          }
        }
        //Actualizo la colección de balance capital...
        try {
          let updateCapital = expensesIcomesService.updateCapital(payload, balanceCapital[0]._id);
          console.log(updateCapital);
          resolve(updateCapital)
        } catch (error) {
          console.log('error', error);
          reject(error)
        }
      }
    } catch (error) {
      console.log('error', error);
      reject(error)
    }
  })
}

const consultBalanceInterest = async () => {
  balanceInterestLogger.info({
    message: "Funcionabilidad para listar el balance de intereses"
  });
  return new Promise((reject, resolve) => {
    BalanceInteres.find({}).sort({ _id: '-1' }).exec((balanceInterest, err) => {
      if (err) {
        reject(err);
      } else {
        if (!balanceInterest) {
          reject(err);
        } else {
          balanceInterestLogger.info({
            message: "listado de balance intereses realizado exitosamente",
            balanceInterest: balanceInterest
          });
          resolve(balanceInterest);
        }
      }
    });
  })
}

const consultBalanceCapital = async () => {
  balanceCapilalLogger.info({
    message: "Funcionabilidad para listar el balance del capital"
  });
  return new Promise((reject, resolve) => {
    BalanceCapital.find({}, (balanceCapital, err) => {
      if (err) {
        reject(err);
      } else {
        if (!balanceCapital) {
          reject(err);
        } else {
          balanceCapilalLogger.info({
            message: "listado de balance del capital realizado exitosamente",
            balanceCapital: balanceCapital
          });
          resolve(balanceCapital);
        }
      }
    });
  })
}

const createCapital = (model) => {
  modelBalanceCapita = new BalanceCapital();
  modelBalanceCapita = model;
  console.log(modelBalanceCapita)
  return new Promise((reject, resolve) => {
    modelBalanceCapita.save((balanceCapital, err) => {
      if (err) {
        reject(err);
      } else {
        if (!balanceCapital) {
          reject(err);
        } else {
          balanceCapilalLogger.info({
            message: "listado de balance del capital realizado exitosamente",
            balanceCapital: balanceCapital
          });
          resolve(balanceCapital);
        }
      }
    });
  })
}

const updateCapital = (payload, id) => {
  return new Promise((reject,resolve) => {
    BalanceCapital.findByIdAndUpdate(id, payload, { new: true }, (error, capitalUpdate) => {
      if (error) {
        reject(error);
      } else {
        if (!capitalUpdate) {
          reject(error);
        }
        balanceCapilalLogger.info({
          message: "Capital actualizado en la base de datos",
          capitalUpdate: capitalUpdate
        });
        resolve(capitalUpdate);
      }
    });
  });
}


module.exports = {
  consultBalanceInterest,
  consultBalanceCapital,
  createCapital,
  updateCapital,
  createIcome
}
