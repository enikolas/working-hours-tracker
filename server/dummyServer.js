const http = require('http');
const mockserver = require('mockserver');
const logger = require('./logger');

const dummyServerPort = process.env.DUMMY_SERVER_PORT || 9001;
http.createServer(mockserver(`${__dirname}/dummyServerMocks`)).listen(dummyServerPort);
logger.info(`Serving dummyServer on ${dummyServerPort}!`);
