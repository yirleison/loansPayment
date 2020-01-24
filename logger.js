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
 module.exports = {
    loanLogger,
    logger,
    paymentLogger,
    interestLogger
 };