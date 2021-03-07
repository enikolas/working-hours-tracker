const jwt = require('jwt-simple');

const logger = require('../logger');
const {
  ACHIEVO_URL,
  extractError,
  cookieJarFactory,
  thereIsSessionFrom,
  setSession,
  removeSession
} = require('../api/utils');

const {
  get,
  post,
} = require('./requestService');

const jwtSecret = process.env.JWT_SECRET || 'jwtSecret123';
const authenticationSucceed = 'Your browser doesnt support frames, but this is required';
const authenticationFailedMessage = 'Authentication failed!';

const login = async (token) => {
  if (thereIsSessionFrom(token) > 0) {
    setSession(token);
    return token;
  }

  const cookieJar = cookieJarFactory(token);

  const response = await get(
    `${ACHIEVO_URL}/index.php`,
    cookieJar,
  );

  if (!response || !response.includes(authenticationSucceed)) {
    const { user, password } = jwt.decode(token, jwtSecret);
    
    const payload = {
      auth_user: user,
      auth_pw: password,
    };

    const loginResponseHtml = await post(
      `${ACHIEVO_URL}/index.php`,
      cookieJar,
      payload,
    );

    const error = extractError(loginResponseHtml);
    if (error ||
      !loginResponseHtml ||
      !loginResponseHtml.includes(authenticationSucceed)) {
      throw authenticationFailedMessage;
    }
  }

  logger.info('Authenticated!!!');

  setSession(token);

  return token;
};

const logout = async (token) => {
  if (removeSession(token) > 0) {
    return;
  }
  const cookieJar = cookieJarFactory(token);

  const queryParams = {
    atklogout: 1,
  };

  await get(
    `${ACHIEVO_URL}/index.php`,
    cookieJar,
    queryParams,
  );

  logger.info('Logged out!!!');
};

module.exports = {
  authenticationSucceed,
  login,
  logout,
};
