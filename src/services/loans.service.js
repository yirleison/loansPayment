const Loan = require("../models/loan.model");
const { messages } = require("../utils/messages");
const { loanLogger } = require("../../logger");

const loanById  = async (id) => {
    console.log('loan service id',id);
  loanLogger.info({
    message: "Inicio de funcionabilidad para listar prestamo por ID"
  });

  return new Promise((resolve, reject) => {
    Loan.findOne({ _id: id }, (error, loan) => {
        if (error) {
            reject(false);
        } else {
          if (!loan) {
            reject(false);
          } else {
            resolve(loan)
          }
        }
      });
  })
  
};

module.exports = {
  loanById
};
