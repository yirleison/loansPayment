const moment = require("moment");
const paymentServices = require("../services/payment.service");
const loanServices = require("../services/loans.service");
const Payment = require("../models/Payment.model");
const { paymentLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const payment = new Payment();

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
        res.status(200).send(messages('OK', paymentSaved));
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

const paymentUpdateById = async(req, res) => {
  paymentLogger.info({
    message: "Inicio de funcionabilidad para actualizar un deposito"
  });
  const payload = req.body;
  const idPayment = req.params.id;
  const typePayment = req.headers.typepayment;
  
  //Valido el tipo de pago si es 1 es porque se va pagar una cuota, si es 2 es porque se va actualizar una cuota existente..
  switch (typePayment) {
    case '1':
      //consola('Entro a la funcioanalidad para realizar un pago de una cuota existente') 
      try {
        let consultPayment = await paymentServices.paymentById(idPayment);
        let paymentUpload = {};
        if (consultPayment) {
          let aux = 0;
          let amount = 0; amount = payload.amount;
          if (amount > consultPayment.interest) {
            paymentUpload.dateDeposit = moment().format("YYYY-MM-DD");
            paymentUpload.amount = parseFloat(amount);
            paymentUpload.interest = consultPayment.interest;
            paymentUpload.nextDatePayment = consultPayment.nextDatePayment;
            paymentUpload.balanceLoand =(consultPayment.balanceLoand - (amount - consultPayment.interest))
            paymentUpload.statusDeposit = false;
            paymentUpload.idLoan = consultPayment.idLoan
            consola('Caso cuando el monto es mayor que el interes',paymentUpload);  
          }
          else if(amount > consultPayment.interest) {
            aux = (consultPayment.balanceLoand - (amount - consultPayment.interest))
            if(aux == consultPayment.balanceLoand){
              //Es porque el cliente en esta cuota paga la totalidad del prestamo
            }
          }
          else if(amount == consultPayment.interest){
            //Cuando el monto ingresado es === al valor del interes, se debe de crear otra cuota.
          }
          else if(amount < consultPayment.interest) {
            /*Cuando el monto ingresado es ---al valor del interes de la cuota programada se 
              toma como un abono, se crea una nueva cuota y el valor faltante del interes se debe
              guadar en una colección llama InteresMora para luego en la proxima cuota hacer el res
              pectivo cuadre...
            */
          }
          
        } else {
          
        }
      } catch (error) {
        error => (consola(error));
      }
      break;
      case '0':
      
        break;
    default:
      consola('Entro al error del swicth')
      break;
  }

  
};


module.exports = {
  paymentRegister,
  listPayment,
	paymentById,
  paymentUpdateById
	
};
