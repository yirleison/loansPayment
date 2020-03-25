const { createLogger, format, transports, config } = require('winston');
 
const logger = createLogger({
   transports: [
       new transports.Console()
     ]
 });

 const loanLogger = createLogger({
    transports: [
        new transports.Console()
      ]
 });

 const paymentLogger = createLogger({
   transports: [
       new transports.Console()
     ]
});

const interestLogger = createLogger({
  transports: [
      new transports.Console()
    ]
});

const userLogger = createLogger({
  transports: [
      new transports.Console()
    ]
});

const balanceCapilalLogger = createLogger({
  transports: [
      new transports.Console()
    ]
});

const balanceInterestLogger = createLogger({
  transports: [
      new transports.Console()
    ]
});

 module.exports = {
    loanLogger,
    logger,
    paymentLogger,
    interestLogger,
    userLogger,
    balanceCapilalLogger,
    balanceInterestLogger
 };