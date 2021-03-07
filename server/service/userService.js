const cheerio = require('cheerio');
const moment = require('moment');

const {
  ACHIEVO_URL,
  extractError,
} = require('../api/utils');

const {
  get,
} = require('./requestService');

const getUserDetails = async (cookieJar) => {
  const formKeyHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/newhours_insert.php`,
    cookieJar,
  );

  const error = extractError(formKeyHtml);
  if (error) {
    throw error;
  }

  const $ = cheerio.load(formKeyHtml);
  const formKey = $('input[type="hidden"][name="form_key"]').val();
  const personId = $('input[type="hidden"][name="person"]').val();

  return {
    formKey,
    personId
  };
};

module.exports = {
  getUserDetails,
};
