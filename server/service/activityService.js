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
} = require('../api/middleware');

const activities = phase => async (token) => {
  const cookieJar = cookieJarFactory(token);
  const { personId } = await getUserDetails(cookieJar);

  const queryParams = {
    person: personId,
    init_userid: personId,
    phase,
    function: 'proj_activity'
  };

  const responseHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`,
    cookieJar,
    queryParams,
  );

  return extractSelectOptions('proj_activity', responseHtml);
};

module.exports = {
  activities,
};
