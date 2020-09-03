const BalanceCapital = require('../models/balanceCapital.model')
const { balanceCapilalLogger } = require("../../logger");

const createCapital = async (model) => {
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

const consultBalanceCapital = async () => {
    balanceCapilalLogger.info({
        message: "Funcionabilidad para listar el balance del capital"
    });
    return new Promise((resolve,reject) => {
        BalanceCapital.find({}, (err, balanceCapitalResult) => {
            if (err) {
                reject(err);
            } else {
                if (!balanceCapitalResult) {
                    reject(err);
                } else {
                    balanceCapilalLogger.info({
                        message: "listado de balance del capital realizado exitosamente",
                        balanceCapitalResult: balanceCapitalResult
                    });
                    resolve(balanceCapitalResult);
                }
            }
        });
    })
}

const updateCapital = async (payload, id) => {
    return new Promise((resolve,reject) => {
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

const validateOutput = (expenses, balanceCapital) => {
    let payload;
    /*if (balanceCapital[0].balanceCapital == 0 && balanceCapital[0].balanceInterest == 0 && expenses > 0) {
        console.log('No se puede crear una salida de dinero por que no hay saldo en caja')
    }
    else {*/
        if (expenses) {
            if (expenses > balanceCapital[0].balanceInterest) {
                auxInterest = (expenses - balanceCapital[0].balanceInterest);
                if ((auxInterest - balanceCapital[0].balanceCapital)) {
                    auxCapital = (balanceCapital[0].balanceCapital - auxInterest);
                    payload = {
                        balanceCapital: auxCapital,
                        balanceInterest: 0,
                        balanceCapitalAfter: balanceCapital[0].balanceCapital,
                        balanceInterestAfter: balanceCapital[0].balanceInterest
                    }
                }
            }
            if (expenses < balanceCapital[0].balanceInterest) {
                auxInterest = (balanceCapital[0].balanceInterest - expenses);
                payload = {
                    balanceCapital: balanceCapital[0].balanceCapital,
                    balanceInterest: auxInterest,
                    balanceCapitalAfter: balanceCapital[0].balanceCapital,
                    balanceInterestAfter: balanceCapital[0].balanceInterest
                }
            }
            if (expenses == balanceCapital[0].balanceInterest) {
                payload = {
                    balanceCapital: balanceCapital[0].balanceCapital,
                    balanceInterest: 0,
                    balanceCapitalAfter: balanceCapital[0].balanceCapital,
                    balanceInterestAfter: balanceCapital[0].balanceInterest
                }
            }
            if (expenses > balanceCapital[0].balanceInterest) {
                auxInterest = (expenses - balanceCapital[0].balanceInterest);
                if (auxInterest == balanceCapital[0].balanceCapital) {
                    payload = {
                        balanceCapital: 0,
                        balanceInterest: 0,
                        balanceCapitalAfter: balanceCapital[0].balanceCapital,
                        balanceInterestAfter: balanceCapital[0].balanceInterest
                    }
                }
            }
            /*if(expenses > (balanceCapital[0].balanceCapital + balanceCapital[0].balanceInterest)){
                payload = {
                    noCapital: 0
                }
            }*/
        }
    //}
    return payload
}

const validateBalanceForLoan = (amount) => {
    let capital
// Consulta por el balanceCapital, suma el balance intere + el balance capital luego logica
            if(balanceCapital[0].balanceCapital>0){
                if(amount > (balanceCapital[0].balanceCapital + balanceCapital[0].balanceInterest)){
                    capital = {
                        noCapital: 0
                    }
                } 

            }
        return capital
}


module.exports = {
    createCapital,
    updateCapital,
    validateOutput,
    consultBalanceCapital,
    validateBalanceForLoan
}
