const express = require('express');
const app = express();
require('./db/mongoose');
const apiRouter = require('./routes/api');
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRouter);

module.exports = app;
