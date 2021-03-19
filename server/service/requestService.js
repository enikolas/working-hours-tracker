const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const querystring = require('querystring');

const {
  getOptions,
} = require('./utils');

axiosCookieJarSupport(axios);

const get = async(url, cookieJar, queryParams) => {
  try {
    const options = {
      ...getOptions(cookieJar),
      params: queryParams,
    };
  
    const { data: response } = await axios.get(
      url,
      options,
    );
  
    return response;
  } catch (error) {
    console.error('Your GET request failed:', error);
    return false;
  }
};

const post = async(url, cookieJar, payload, queryParams) => {
  try {
    const options = {
      ...getOptions(cookieJar),
      params: queryParams,
    };
  
    const { data: response } = await axios.post(
      url,
      querystring.stringify(payload),
      options,
    );
  
    return response;
  } catch (error) {
    console.error('Your POST request failed:', error);
    return false;
  }
}

module.exports = {
  get,
  post,
};

