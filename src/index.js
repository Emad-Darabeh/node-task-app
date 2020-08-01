const app = require('./app');
const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`app is running on http://127.0.0.1:${PORT}`)
);
