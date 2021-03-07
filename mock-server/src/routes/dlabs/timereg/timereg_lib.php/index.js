const getProjActivityMock = require('./GET_proj_activity.mock');
const getProjPhaseMock = require('./GET_proj_phase.mock');
const postMock = require('./POST.mock');

module.exports = (app) => {
  app.get('/dlabs/timereg/timereg_lib.php', (req, res) => {
    console.log('GET /dlabs/timereg/timereg_lib.php');

    const {
      person,
      init_userid,
      function: functionParam,
      phase,
    } = req.query;

    res
      .status(200)
      .set('Content-Type', 'text/html');

    if (person === '123'
        && init_userid === '123'
        && !phase
        && functionParam === 'proj_phase') {
      res.send(getProjPhaseMock);
      return;
    }

    if (person === '123'
        && init_userid === '123'
        && phase === '456'
        && functionParam === 'proj_activity') {
      res.send(getProjActivityMock);
      return;
    }

    res.status(404).send();
  });

  app.post('/dlabs/timereg/timereg_lib.php', (req, res) => {
    console.log('POST /dlabs/timereg/timereg_lib.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(postMock);
  });
};
