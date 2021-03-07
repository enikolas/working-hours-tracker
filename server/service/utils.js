const getOptions = (cookieJar) => ({
  jar: cookieJar,
  withCredentials: true,
  rejectUnauthorized: false
});

module.exports = {
  getOptions,
};
