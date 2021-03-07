const GET = require('./GET.mock');

module.exports = (app) => {
  app.get('/dlabs/timereg/report.php', (req, res) => {
    console.log('GET /dlabs/timereg/report.php');

    const { init_userid } = req.query;

    if (!init_userid) {
      res.status(404).send();
      return;
    }

    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(GET);
  });
};
