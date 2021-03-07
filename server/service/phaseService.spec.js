const axios = require('axios').default;

const {
  ACHIEVO_URL,
  cookieJarFactory,
  extractSelectOptions,
} = require('../api/utils');

const {
  getUserDetails,
} = require('../api/middleware');

const {
  getOptions,
} = require('./utils');

const {
  phases,
} = require('./phaseService');

jest.mock('axios');
jest.mock('../api/utils');
jest.mock('../api/middleware');
jest.mock('./utils');

describe('Phase Service', () => {
  const token = 'token';
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

  describe('phases', () => {
    it('should list all phases', async () => {
      const expectedResult = 'some response';

      const personId = 'expected person id';
      const expectedOptions = {
        ...options,
        params: {
          person: personId,
          init_userid: personId,
          function: 'proj_phase',
        },
      };
      const response = {
        data: expectedResult,
      };

      getUserDetails.mockResolvedValueOnce({ personId });
      axios.get.mockResolvedValueOnce(response);
      extractSelectOptions.mockReturnValue(expectedResult);

      const result = await phases()(token);

      expect(cookieJarFactory).toHaveBeenCalledWith(token);
      expect(getUserDetails).toHaveBeenCalledWith(cookieJar);
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/dlabs/timereg/timereg_lib.php`, expectedOptions);
      expect(extractSelectOptions).toHaveBeenCalledWith('proj_phase', expectedResult);
      expect(result).toEqual(expectedResult);
    });
  });
});
