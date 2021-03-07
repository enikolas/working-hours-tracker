const axios = require('axios').default;
const jwt = require('jwt-simple');
const FormData = require('form-data');

const {
  ACHIEVO_URL,
  cookieJarFactory,
  thereIsSessionFrom,
  setSession,
  removeSession
} = require('../api/utils');

const {
  getOptions,
} = require('./utils');

const {
  authenticationSucceed,
  login,
  logout,
} = require('./authenticationService');

jest.mock('axios');
jest.mock('../api/utils');
jest.mock('./utils');

describe('Authentication Service', () => {
  const jwtSecret = 'jwtSecret123';
  const user = 'user';
  const password = 'password';
  const token = jwt.encode({user, password}, jwtSecret);
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
    consoleLog.mockRestore();
    console.info = consoleLogBackup;
    cookieJarFactory.mockRestore();
  });

  describe('login', () => {
    it('when there is no session from token, it should set session', async () => {
      thereIsSessionFrom.mockReturnValue(1);
      const result = await login(token);

      expect(setSession).toHaveBeenCalledWith(token);
      expect(result).toEqual(token);
    });

    it('when it is already be authenticated, it should set session', async () => {
      const response = {
        data: `something ${authenticationSucceed} somethin else`,
      };

      thereIsSessionFrom.mockReturnValue(0);
      axios.get.mockResolvedValue(response);

      const result = await login(token);
      expect(cookieJarFactory).toHaveBeenCalledWith(token);
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/index.php`, options);
      expect(setSession).toHaveBeenCalledWith(token);
      expect(consoleLog).toHaveBeenCalledWith('Authenticated!!!');
      expect(result).toEqual(token);
    });

    it('when it is not authenticated, it should call the authentication API and then set session', async () => {
      const response1 = {
        data: 'something else',
      };
      const response2 = {
        data: `something ${authenticationSucceed} somethin else`,
      };

      thereIsSessionFrom.mockReturnValue(0);
      axios.get.mockResolvedValue(response1);
      axios.post.mockResolvedValue(response2);

      const result = await login(token);
      expect(cookieJarFactory).toHaveBeenCalledWith(token);
      expect(getOptions).toHaveBeenLastCalledWith(cookieJar);

      expect(axios.post).toHaveBeenCalledWith(
        `${baseUrl}/index.php`,
        expect.any(FormData),
        options,
      );
      expect(setSession).toHaveBeenCalledWith(token);
      expect(consoleLog).toHaveBeenCalledWith('Authenticated!!!');
      expect(result).toEqual(token);
    });

    it('when it is not authenticated and authentication fails, it should throw error', async () => {
      const response = {
        data: 'something else',
      };

      thereIsSessionFrom.mockReturnValue(0);
      axios.get.mockResolvedValue(response);
      axios.post.mockResolvedValue(response);

      try {
        const result = await login(token);
        expect(result).toBeFalsy();
      } catch(error) {
        expect(error).toEqual('Authentication failed!');
      }
    });
  });

  describe('logout', () => {
    it('when there is no session from token, it should set session', async () => {
      removeSession.mockReturnValue(1);
      await logout(token);

      expect(setSession).toHaveBeenCalledWith(token);
      expect(cookieJarFactory).not.toHaveBeenCalled();
    });

    it('when it authenticated, it should logout properly', async () => {
      removeSession.mockReturnValue(0);

      const response = {
        data: 'response',
      };

      axios.get.mockResolvedValue(response);

      await logout(token);

      expect(cookieJarFactory).toHaveBeenCalledWith(token);
      expect(getOptions).toHaveBeenCalledWith(cookieJar);
      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/index.php`,
        {
          ...options,
          params: {
            atklogout: 1
          }
        },
      );
      expect(consoleLog).toHaveBeenCalledWith('Logged out!!!');
    });
  });
});
