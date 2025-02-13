const cheerio = require('cheerio');
const moment = require('moment');
const TimeDuration = require('time-duration');

const {
  ACHIEVO_URL,
  extractError,
  cookieJarFactory,
} = require('../api/utils');

const {
  get,
} = require('./requestService');

const {
  getUserDetails,
} = require('./userService');

const {
  getTodayEntries,
} = require('./timeEntryService');

const logger = require('../logger');

const headers = {
  DATE: 0,
  CONTRACTED_TIME: 1,
  START_TIME: 2,
  WORKED_TIME: 3,
  BREAK_TIME: 4,
  END_TIME: 5,
  BALANCE: 8,
  REMARKS: 9
};

const specialCases = {
  VACATION: 'Vacation',
  O_TANJOUBI: 'O-Tanjoubi',
  JUSTIFIED_ABSENCE: 'Justified Absence'
};

const calculateWeekBalance = (entries) => {
  let lastWeeksInYear = -1;
  let weekBalance = new TimeDuration('0:00');

  const result = [];
  for (let i = 0; i < entries.length; i++) { // eslint-disable-line
    const index = entries.length - i - 1;
    const entry = entries[index];
    const weeksInYear = moment(entry.date).isoWeeks();

    if (weeksInYear !== lastWeeksInYear) {
      weekBalance = new TimeDuration('0:00');
    }

    lastWeeksInYear = weeksInYear;
    if (entry.total) {
      weekBalance.add(entry.total);
    }

    result[index] = ({ ...entry, weekBalance: weekBalance.toString() });
  }

  return result;
};

const reportHistory = async (token) => {
  const cookieJar = cookieJarFactory(token);
  const { personId } = await getUserDetails(cookieJar);

  const queryParams = {
    init_userid: personId,
  };
  
  const responseHtml = await get(
    `${ACHIEVO_URL}/dlabs/timereg/report.php`,
    cookieJar,
    queryParams,
  );

  return responseHtml;
};

const extractBreakTime = (breakTime) => {
  const regex = /(\d{1,2}:\d{1,2}:\d{1,2})/g;
  const matches = breakTime.match(regex);
  const [startBreakTime = '', endBreakTime = ''] = matches || [];

  return {
    startBreakTime,
    endBreakTime
  };
};

const allTimesTableToData = ($) => {
  const data = [];
  const trimmedText = element => $(element).text().trim();
  $('table tr').each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length) {
      const [date,,, holiday] = trimmedText(tds[headers.DATE]).split(' ');
      const breakTime = trimmedText($(tds[headers.BREAK_TIME]));
      const remarks = trimmedText(tds[headers.REMARKS]);
      const isVacation = breakTime === specialCases.VACATION;
      const isOtanjoubi = remarks === specialCases.O_TANJOUBI;
      const isJustifiedAbsence = remarks === specialCases.JUSTIFIED_ABSENCE;
      const isHoliday = Boolean(holiday && !isVacation && !isOtanjoubi && !isJustifiedAbsence);

      data.push({
        date,
        contractedTime: trimmedText(tds[headers.CONTRACTED_TIME]),
        startTime: trimmedText(tds[headers.START_TIME]),
        endTime: trimmedText(tds[headers.END_TIME]),
        ...extractBreakTime(breakTime),
        total: trimmedText(tds[headers.WORKED_TIME]),
        balance: trimmedText(tds[headers.BALANCE]),
        isVacation,
        isOtanjoubi,
        isJustifiedAbsence,
        isHoliday,
        holiday: isHoliday ? remarks : null
      });
    }
  });

  return data;
};

const allEntries = () => async (token) => {
  const responseHtml = await reportHistory(token);
  const error = extractError(responseHtml);
  if (error) {
    throw error;
  }

  logger.info('All entries called');

  const $ = cheerio.load(responseHtml);
  const name = $('h4').eq(0).text().trim();
  const admissionRaw = $('h4').eq(1).text();
  const admission = admissionRaw.replace('Admission:', '').trim();
  const allEntriesData = allTimesTableToData($);
  const todayEntry = await getTodayEntries(token, allEntriesData[0]);
  const entries = calculateWeekBalance([...todayEntry, ...allEntriesData]);

  logger.info('All entries finished');

  return {
    name,
    admission,
    entries
  };
};

const getBalance = ($) => {
  const date = moment($('table tr td').eq(0).text().split(' ')[0]);
  const dayOfWeek = date.isoWeekday();
  const targetFriday = dayOfWeek === 5 ? 0 : dayOfWeek;
  const lastFridayBalance = $('table tr td').eq((targetFriday * 10) + 8).text().trim();

  return lastFridayBalance;
};

const userDetails = () => async (token) => {
  const responseHtml = await reportHistory(token);
  const error = extractError(responseHtml);
  if (error) {
    throw error;
  }

  const $ = cheerio.load(responseHtml);
  const name = $('h4').eq(0).text().trim();
  const dailyContractedHours = $('table tr td').eq(1).text();
  const lastFridayBalance = getBalance($);

  return {
    name,
    dailyContractedHours,
    lastFridayBalance
  };
};

module.exports = {
  reportHistory,
  allEntries,
  extractBreakTime,
  allTimesTableToData,
  getBalance,
  userDetails,
}
