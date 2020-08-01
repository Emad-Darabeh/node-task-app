const express = require('express');
const app = express();
require('./db/mongoose');
const apiRouter = require('./routes/api');
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRouter);

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`app is running on http://127.0.0.1:${PORT}`)
);
