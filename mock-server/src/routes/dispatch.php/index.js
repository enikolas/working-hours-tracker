const getMock = require('./GET.mock');
const postMock = require('./POST.mock');

module.exports = (app) => {
  app.get('/dispatch.php', (req, res) => {
    console.log('GET /dispatch.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(getMock);
  });

  app.post('/dispatch.php', (req, res) => {
    console.log('POST /dispatch.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(postMock);
  });
};
