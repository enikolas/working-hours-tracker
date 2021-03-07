require('dotenv').config();
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const cheerio = require('cheerio');

axiosCookieJarSupport(axios);

const {
  ACHIEVO_URL,
  extractError,
  getOptions,
  workTimeFromHtml,
  cookieJarFactory,
} = require('./utils');

const dayDetails = date => async (token) => {
  const cookieJar = cookieJarFactory(token);
  const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/newhours_list.php`, cookieJar);
  options.params = { datei: date };

  const { data: responseHtml } = await axios(options);
  const $ = cheerio.load(responseHtml);
  const {
    phase,
    activity
  } = workTimeFromHtml($);

  return {
    date,
    phase,
    activity
  };
};

module.exports = {
  dayDetails,
};
