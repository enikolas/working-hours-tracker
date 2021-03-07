require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const start = () => {
  const app = express();
  const port = process.env.PORT || 9001;

  app.use(cors());
  app.use(cookieParser());

  routes(app);

  app.listen(port, () => console.log(`listening on ${port}!`));
};

module.exports = {
  start,
};
