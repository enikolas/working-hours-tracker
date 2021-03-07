const getMock = require('./GET.mock');
const postMock = require('./POST.mock');

const cookie = '1e373a93f8901ae9c3971948c80b5fe7';

module.exports = (app) => {
  app.get('/index.php', (req, res) => {
    console.log('GET /index.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .cookie('achievo', cookie)
      .send(getMock);
  });

  app.post('/index.php', (req, res) => {
    console.log('POST /index.php');

    const { achievo } = req.cookies || {};

    res
      .status(200)
      .set('Content-Type', 'text/html');
    
    if (!achievo || achievo !== cookie) {
      res
        .cookie('achievo', cookie)
        .send(getMock);

      return;
    }
    
    res.send(postMock);
  });
};
