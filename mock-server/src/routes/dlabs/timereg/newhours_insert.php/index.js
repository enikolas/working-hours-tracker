const getMock = require('./GET.mock');
const postMock = require('./POST.mock');

module.exports = (app) => {
  app.get('/dlabs/timereg/newhours_insert.php', (req, res) => {
    console.log('GET /dlabs/timereg/newhours_insert.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(getMock);
  });

  app.post('/dlabs/timereg/newhours_insert.php', (req, res) => {
    console.log('POST /dlabs/timereg/newhours_insert.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(postMock);
  });
};
