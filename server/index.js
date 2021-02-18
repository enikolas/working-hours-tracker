const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const api = require('./api');
const router = require('./router');

const app = express();

const port = process.env.PORT || 3000;

api(port).applyMiddleware({
  app,
  path: '/graphql',
});

let compiler;

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

router(app, compiler);

const logger = require('./logger');

app.listen(port, () => logger.info(`listening on ${port}!`));
