const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const FormData = require('form-data');

const {
  getOptions,
} = require('./utils');

axiosCookieJarSupport(axios);

const get = async(url, cookieJar, queryParams) => {
  const options = {
    ...getOptions(cookieJar),
    params: queryParams,
  };

  const { data: response } = await axios.get(
    url,
    options,
  );

  return response;
};

const post = async(url, cookieJar, payload, queryParams) => {
  const options = {
    ...getOptions(cookieJar),
    params: queryParams,
  };
    
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const { data: response } = await axios.post(
    url,
    formData,
    options,
  );

  return response;
}

module.exports = {
  get,
  post,
};

