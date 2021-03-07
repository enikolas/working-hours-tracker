const {
  ACHIEVO_URL,
  cookieJarFactory,
  extractSelectOptions,
} = require('../api/utils');

const {
  get,
} = require('./requestService');

const {
  getUserDetails,
} = require('./userService');

const phases = () => async (token) => {
  const cookieJar = cookieJarFactory(token);
  const { personId } = await getUserDetails(cookieJar);

  const queryParams = {
    person: personId,
    init_userid: personId,
    function: 'proj_phase'
  };

  const responseHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`,
    cookieJar,
    queryParams,
  );

  return extractSelectOptions('proj_phase', responseHtml);
};

module.exports = {
  phases,
};
