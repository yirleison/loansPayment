const BalanceInteres = require("../models/expensesIcomes.model");
const BalanceCapital = require('../models/balanceCapital.model');
const ExpensesIcomes = require("../models/expensesIcomes.model");
const { balanceInterestLogger } = require("../../logger");
const { balanceCapilalLogger } = require("../../logger");

const createExpensesOrIcomes = async (payload) => {
  let expensesIcomes = new ExpensesIcomes(payload)
  return new Promise((resolve, reject) => {
    expensesIcomes.save(async (error, expensesIcomesSave) => {
      if (error) {
        return reject(error)
      } else {
        if (!expensesIcomesSave) {
          return reject(error)
        }
        return resolve(expensesIcomesSave)
      }
    })
  })
}

const deleteExpensesOrIcomes = async (id) => {
  return new Promise((resolve, reject) => {
    ExpensesIcomes.findByIdAndDelete({_id : id}, (error, expensesIcomesRemove) => {
      if (error) {
        return reject(error)
      } else {
        if (!expensesIcomesRemove) {
          return reject(error)
        }
        return resolve(expensesIcomesRemove)
      }
    })
  })
}

const consultExpensesOrIcomes = async (id) => {
  return new Promise((resolve, reject) => {
    ExpensesIcomes.findOne({_id : id}, (error, expensesIcomes) => {
      if (error) {
        return reject(error)
      } else {
        if (!expensesIcomes) {
          return reject(error)
        }
        return resolve(expensesIcomes)
      }
    })
  })
}

const updateExpensesOrIcomes = async (id,payload) => {
  return new Promise((resolve, reject) => {
    ExpensesIcomes.findOneAndUpdate({_id: id}, {$set: payload}, (error, expensesIcomesUpdate) => {
      if (error) {
        return reject(error)
      } else {
        if (!expensesIcomesUpdate) {
          return reject(error)
        }
        return resolve(expensesIcomesUpdate)
      }
    })
  })
}

const createIcome = (body) => {
  balanceInteres = new ExpensesIcomes();
  balanceInteres.dateIncome = moment(body.dateIncome).format("YYYY-MM-DD");
  balanceInteres.dateExpense = null;
  balanceInteres.income = Number(parseFloat(body.income));
  balanceInteres.expenses = Number(parseFloat(body.expenses));
  balanceInteres.note = body.note;
  let auxInterest = 0;
  let auxCapital = 0;

  return new Promise((reject, resolve) => {
 
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

const consultBalanceCapital = () => {
  balanceCapilalLogger.info({
    message: "Funcionabilidad para listar el balance del capital"
  });
  return new Promise((resolve, reject) => {
    BalanceCapital.find({}, (err, balanceCapital) => {
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
  return new Promise((resolve, reject ) => {
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
  createExpensesOrIcomes,
  consultBalanceInterest,
  consultBalanceCapital,
  createCapital,
  updateCapital,
  createIcome,
  deleteExpensesOrIcomes,
  consultExpensesOrIcomes,
  updateExpensesOrIcomes
}
