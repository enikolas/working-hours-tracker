const home = require('./index.php');
const report = require('./report.php');
const dispatch = require('./dispatch.php');
const newhoursDelete = require('./dlabs/timereg/newhours_delete.php');
const newhoursInsert = require('./dlabs/timereg/newhours_insert.php');
const newhoursList = require('./dlabs/timereg/newhours_list.php');
const timeregLib = require('./dlabs/timereg/timereg_lib.php');

module.exports = (app) => {
  home(app);
  report(app);
  dispatch(app);
  newhoursDelete(app);
  newhoursInsert(app);
  newhoursList(app);
  timeregLib(app);
};
