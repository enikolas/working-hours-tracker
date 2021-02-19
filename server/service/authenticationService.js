const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const jwt = require('jwt-simple');

const logger = require('../logger');
const {
  ACHIEVO_URL,
  extractError,
  getOptions,
  cookieJarFactory,
  thereIsSessionFrom,
  setSession,
  removeSession
} = require('../api/utils');

axiosCookieJarSupport(axios);

const jwtSecret = process.env.JWT_SECRET || 'jwtSecret123';
const authenticationSucceed = 'Your browser doesnt support frames, but this is required';
const authenticationFailedMessage = 'Authentication failed!';

const login = async (token) => {
  if (thereIsSessionFrom(token) > 0) {
    setSession(token);
    return token;
  }

  const cookieJar = cookieJarFactory(token);

  let options = getOptions('GET', `${ACHIEVO_URL}/index.php`, cookieJar);
  const { data: response } = await axios(options);

  if (!response || !response.includes(authenticationSucceed)) {
    const { user, password } = jwt.decode(token, jwtSecret);
    options = getOptions('POST', `${ACHIEVO_URL}/index.php`, cookieJar);
    options.formData = { auth_user: user, auth_pw: password };

    const { data: loginResponseHtml } = await axios(options);
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
  const options = getOptions('GET', `${ACHIEVO_URL}/index.php`, cookieJar);
  options.params = {
    atklogout: 1
  };

  await axios(options);

  logger.info('Logged out!!!');
};

module.exports = {
  authenticationSucceed,
  login,
  logout,
};
