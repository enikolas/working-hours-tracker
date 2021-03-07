const cheerio = require('cheerio');
const moment = require('moment');
const TimeDuration = require('time-duration');

const logger = require('../logger');
const {
  ACHIEVO_URL,
  extractError,
  activityToPayload,
  workTimeFromHtml,
  breakTimeFromHtml,
  cookieJarFactory,
  stringfyTime,
} = require('../api/utils');

const {
  get,
  post,
} = require('./requestService');

const {
  activities,
} = require('./activityService');

const {
  phases,
} = require('./phaseService');

const {
  getUserDetails,
} = require('./userService');

const commonPayload = (id, formKey, functionName) => ({
  form_key: formKey,
  person: id,
  init_userid: id,
  function: functionName
});

const dailyEntries = date => async (token) => {
  const cookieJar = cookieJarFactory(token);

  const queryParams = {
    datei: date,
  };

  const responseHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/newhours_list.php`,
    cookieJar,
    queryParams
  );

  const $ = cheerio.load(responseHtml);
  const {
    workTimeId,
    startTime,
    phase,
    activity,
    total
  } = workTimeFromHtml($);
  const {
    breakTimeId,
    startBreakTime,
    endBreakTime,
    breakTimeDuration
  } = breakTimeFromHtml($);

  let endTime = '';

  const isValid = Boolean(startTime);

  if (isValid) {
    endTime = moment(startTime, 'hh:mm');
    const totalWorked = moment(total, 'hh:mm');
    const durantion = moment(breakTimeDuration, 'hh:mm');
    endTime.add({ hours: totalWorked.hours(), minutes: totalWorked.minutes() });
    endTime.add({ hours: durantion.hours(), minutes: durantion.minutes() });
    endTime = endTime.format('H:mm');
  }

  const timeEntry = {
    id: { workTimeId, breakTimeId },
    date,
    phase,
    activity,
    startTime: (isValid && startTime) || '',
    endTime: (isValid && endTime) || '',
    startBreakTime: (isValid && startBreakTime) || '',
    endBreakTime: (isValid && endBreakTime) || '',
    total: (isValid && total) || ''
  };

  return timeEntry;
};

const addTimeEntry = timeEntry => async (token) => {
  const cookieJar = cookieJarFactory(token);

  let { phaseId, activityId } = timeEntry;

  if (!timeEntry.phaseId || !timeEntry.activityId) {
    const phaseOptions = await phases()(token);
    const defaultPhaseId = phaseOptions.default;
    phaseId = phaseId || defaultPhaseId;

    const activityOptions = await activities(phaseId)(token);
    const defaultActivityId = activityOptions.default;
    activityId = activityId || defaultActivityId;
  }

  const { personId, formKey } = await getUserDetails(cookieJar);

  const payload = {
    ...commonPayload(personId, formKey, 'timereg_insert'),
    ...activityToPayload(timeEntry, phaseId, activityId)
  };

  const body = await post(
    `${ACHIEVO_URL}/dlabs/timereg/newhours_insert.php`,
    cookieJar,
    payload,
  );

  let error = extractError(body);
  if (error) {
    throw error;
  }
  logger.info('Time keeped!!!');

  const timeBreakPayload = {
    ...payload,
    function: 'insert_break',
  };

  const timeBreakHTML = await post(
    `${ACHIEVO_URL}/dlabs/timereg/newhours_insert.php`,
    cookieJar,
    timeBreakPayload,
  );

  error = extractError(timeBreakHTML);
  if (error) {
    throw error;
  }

  logger.info('Time break registered!!!');

  const response = await dailyEntries(timeEntry.date)(token);

  return response;
};

const delTimeEntry = async (token, id) => {
  const cookieJar = cookieJarFactory(token);

  const queryParams = {
    id,
  };

  const deleteFormHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/newhours_delete.php`,
    cookieJar,
    queryParams,
  );

  let error = extractError(deleteFormHtml);
  if (error) {
    throw error;
  }
  const $ = cheerio.load(deleteFormHtml);
  const formKey = $('input[type="hidden"][name="form_key"]').val();
  const personId = $('select[name="person"]').val();

  const payload = {
    id,
    form_key: formKey,
    person: personId,
    init_userid: personId,
    function: 'timereg_delete'
  };

  const deleteResponseHtml = await post(
    `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`,
    cookieJar,
    payload
  );

  error = extractError(deleteResponseHtml);
  if (error) {
    throw error;
  }

  logger.info('Time deleted!!!');

  return true;
};

const getTodayEntries = async (token, { contractedTime, balance }) => {
  const todayEntry = await dailyEntries(moment().format('YYYY-MM-DD'))(token);

  if (todayEntry.id) {
    const balanceDuration = new TimeDuration(balance);
    balanceDuration.subtract(contractedTime).add(todayEntry.total);

    return [{
      contractedTime,
      ...todayEntry,
      balance: balanceDuration.toString()
    }];
  }

  return [];
};

const weekEntriesByDate = date => async (token) => {
  const refDate = moment(date);
  refDate.day(0);

  const totalWorkedTime = moment().startOf('year');

  const asyncRequests = [];
  for (let i = 0; i < 7; i += 1) {
    const currentDate = refDate.format('YYYY-MM-DD');
    asyncRequests.push(dailyEntries(currentDate)(token));
    refDate.add(1, 'days');
  }

  const timeEntries = await Promise.all(asyncRequests);

  timeEntries.forEach((entry) => {
    if (entry && entry.total) {
      const dailyTotal = moment(entry.total, 'hh:mm');

      totalWorkedTime.add(dailyTotal.hour(), 'hours');
      totalWorkedTime.add(dailyTotal.minute(), 'minutes');
    }
  });

  const totalHours = totalWorkedTime.diff(moment().startOf('year'), 'hours');
  const totalMinutes = totalWorkedTime.diff(moment().startOf('year'), 'minutes') - (totalHours * 60);

  return {
    timeEntries,
    total: stringfyTime(totalHours, totalMinutes)
  };
};

module.exports = {
  addTimeEntry,
  delTimeEntry,
  dailyEntries,
  getTodayEntries,
  weekEntriesByDate,
};
