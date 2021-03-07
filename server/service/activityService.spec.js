const axios = require('axios').default;

const {
  ACHIEVO_URL,
  cookieJarFactory,
  extractSelectOptions,
} = require('../api/utils');

const {
  getUserDetails,
} = require('./userService');

const {
  getOptions,
} = require('./utils');

const {
  activities,
} = require('./activityService');

jest.mock('axios');
jest.mock('../api/utils');
jest.mock('./userService');
jest.mock('./utils');

describe('Activity Service', () => {
  const token = 'token';
  const phase = 'a phase';
  const baseUrl = ACHIEVO_URL;
  const cookieJar = '🍪';
  const options = {
    someOptions: 'someOptions',
  };
  
  let consoleLogBackup;
  let consoleLog;

  beforeEach(() => {
    consoleLog = jest.fn();
    consoleLogBackup = console.info;
    console.info = consoleLog;

    cookieJarFactory.mockReturnValue(cookieJar);
    getOptions.mockReturnValue(options);
  });

  afterEach(() => {
    jest.resetAllMocks();
    console.info = consoleLogBackup;
  });

  describe('activities', () => {
    it('should list all activities', async () => {
      const expectedResult = 'some response';

      const personId = 'expected person id';
      const expectedOptions = {
        ...options,
        params: {
          person: personId,
          init_userid: personId,
          phase,
          function: 'proj_activity',
        },
      };
      const response = {
        data: expectedResult,
      };

      getUserDetails.mockResolvedValueOnce({ personId });
      axios.get.mockResolvedValueOnce(response);
      extractSelectOptions.mockReturnValue(expectedResult);

      const result = await activities(phase)(token);

      expect(cookieJarFactory).toHaveBeenCalledWith(token);
      expect(getUserDetails).toHaveBeenCalledWith(cookieJar);
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/dlabs/timereg/timereg_lib.php`, expectedOptions);
      expect(extractSelectOptions).toHaveBeenCalledWith('proj_phase', expectedResult);
      expect(result).toEqual(expectedResult);
    });
  });
});
