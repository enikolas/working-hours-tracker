const getMock = require('./GET.mock');

module.exports = (app) => {
  app.get('/dlabs/timereg/newhours_list.php', (req, res) => {
    console.log('GET /dlabs/timereg/newhours_list.php');

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(getMock);
  });
};
