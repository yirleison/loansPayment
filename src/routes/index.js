const express = require('express');
const app = express();

app.get("/test", (req, res) => {
    res.status(200).send({test: 'probrando inicio de la aplicacion'})
})

app.use(require('./payment.route'));
app.use(require('./loan.route'));
app.use(require('./interest.route'));
app.use(require('./balanceInterest.route'));
app.use(require('./expensesIcomes.route'));
app.use(require('./balanceCapital.route'));
app.use(require('./user.route'));

module.exports = app;