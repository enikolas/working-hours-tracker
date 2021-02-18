require('dotenv').config();
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const cheerio = require('cheerio');
const moment = require('moment');
const jwt = require('jwt-simple');
const TimeDuration = require('time-duration');

axiosCookieJarSupport(axios);

const logger = require('../logger');
const {
	ACHIEVO_URL,
	extractError,
	getOptions,
	stringfyTime,
	activityToPayload,
	extractSelectOptions,
	workTimeFromHtml,
	breakTimeFromHtml,
	cookieJarFactory,
	thereIsSessionFrom,
	setSession,
	removeSession
} = require('./utils');

const jwtSecret = process.env.JWT_SECRET || 'jwtSecret123';

const authenticationSucceed = 'Your browser doesnt support frames, but this is required';

const commonPayload = (id, formKey, functionName) => ({
	form_key: formKey,
	person: id,
	init_userid: id,
	function: functionName
});

const getUserDetails = async (cookieJar) => {
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/newhours_insert.php`, cookieJar);
	const { data: formKeyHtml } = await axios(options);

	const error = extractError(formKeyHtml);
	if (error) {
		throw error;
	}

	const $ = cheerio.load(formKeyHtml);
	const formKey = $('input[type="hidden"][name="form_key"]').val();
	const personId = $('input[type="hidden"][name="person"]').val();

	return {
		formKey,
		personId
	};
};

const authenticationFailedMessage = 'Authentication failed!';

const login = async (token) => {
	if (thereIsSessionFrom(token) > 0) {
		setSession(token);
		return token;
	}

	const cookieJar = cookieJarFactory(token);

	let options = getOptions('GET', `${ACHIEVO_URL}/index.php`, cookieJar);
	const { data: response } = await axios(options);

	if (!response || !response.includes(authenticationSucceed)) {
		const { user, password } = jwt.decode(token, jwtSecret);
		options = getOptions('POST', `${ACHIEVO_URL}/index.php`, cookieJar);
		options.formData = { auth_user: user, auth_pw: password };

		const { data: loginResponseHtml } = await axios(options);
		const error = extractError(loginResponseHtml);
		if (error ||
			!loginResponseHtml ||
			!loginResponseHtml.includes(authenticationSucceed)) {
			throw authenticationFailedMessage;
		}
	}

	logger.info('Authenticated!!!');

	setSession(token);

	return token;
};

const logout = async (token) => {
	if (removeSession(token) > 0) {
		return;
	}
	const cookieJar = cookieJarFactory(token);
	const options = getOptions('GET', `${ACHIEVO_URL}/index.php`, cookieJar);
	options.params = {
		atklogout: 1
	};

	await axios(options);

	logger.info('Logged out!!!');
};

const phases = () => async (token) => {
	const cookieJar = cookieJarFactory(token);
	const { personId } = await getUserDetails(cookieJar);
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`, cookieJar);
	options.params = {
		person: personId,
		init_userid: personId,
		function: 'proj_phase'
	};

	const { data: responseHtml } = await axios(options);

	return extractSelectOptions('proj_phase', responseHtml);
};

const activities = phase => async (token) => {
	const cookieJar = cookieJarFactory(token);
	const { personId } = await getUserDetails(cookieJar);
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`, cookieJar);
	options.params = {
		person: personId,
		init_userid: personId,
		phase,
		function: 'proj_activity'
	};

	const { data: responseHtml } = await axios(options);

	return extractSelectOptions('proj_activity', responseHtml);
};

const getBalance = ($) => {
	const date = moment($('table tr td').eq(0).text().split(' ')[0]);
	const dayOfWeek = date.isoWeekday();
	const targetFriday = dayOfWeek === 5 ? 0 : dayOfWeek;
	const lastFridayBalance = $('table tr td').eq((targetFriday * 10) + 8).text().trim();

	return lastFridayBalance;
};

const reportHistory = async (token) => {
	const cookieJar = cookieJarFactory(token);
	const { personId } = await getUserDetails(cookieJar);
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/report.php`, cookieJar);
	options.params = {
		init_userid: personId
	};

	const { data: responseHtml } = await axios(options);
	return responseHtml;
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

const dayDetails = date => async (token) => {
	const cookieJar = cookieJarFactory(token);
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/newhours_list.php`, cookieJar);
	options.params = { datei: date };

	const { data: responseHtml } = await axios(options);
	const $ = cheerio.load(responseHtml);
	const {
		phase,
		activity
	} = workTimeFromHtml($);

	return {
		date,
		phase,
		activity
	};
};

const dailyEntries = date => async (token) => {
	const cookieJar = cookieJarFactory(token);
	const options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/newhours_list.php`, cookieJar);
	options.params = { datei: date };

	const { data: responseHtml } = await axios(options);
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

const extractBreakTime = (breakTime) => {
	const regex = /(\d{1,2}:\d{1,2}:\d{1,2})/g;
	const matches = breakTime.match(regex);
	const [startBreakTime = '', endBreakTime = ''] = matches || [];

	return {
		startBreakTime,
		endBreakTime
	};
};

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

	const options = getOptions('POST', `${ACHIEVO_URL}/dlabs/timereg/newhours_insert.php`, cookieJar);
	const payload = {
		...commonPayload(personId, formKey, 'timereg_insert'),
		...activityToPayload(timeEntry, phaseId, activityId)
	};

	options.formData = payload;

	const { data: body } = await axios(options);
	let error = extractError(body);
	if (error) {
		throw error;
	}
	logger.info('Time keeped!!!');

	options.formData = { ...payload, function: 'insert_break' };

	const { data: timeBreakHTML } = await axios(options);

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

	let options = getOptions('GET', `${ACHIEVO_URL}/dlabs/timereg/newhours_delete.php`, cookieJar);
	const { data: deleteFormHtml } = await axios({
		...options,
		param: { id }
	});
	let error = extractError(deleteFormHtml);
	if (error) {
		throw error;
	}
	const $ = cheerio.load(deleteFormHtml);
	const formKey = $('input[type="hidden"][name="form_key"]').val();
	const personId = $('select[name="person"]').val();

	options = getOptions('POST', `${ACHIEVO_URL}/dlabs/timereg/timereg_lib.php`, cookieJar);
	const payload = {
		id,
		form_key: formKey,
		person: personId,
		init_userid: personId,
		function: 'timereg_delete'
	};

	options.formData = payload;

	const { data: deleteResponseHtml } = await axios(options);
	error = extractError(deleteResponseHtml);
	if (error) {
		throw error;
	}

	logger.info('Time deleted!!!');

	return true;
};

module.exports = {
	login,
	logout,
	addTimeEntry,
	delTimeEntry,
	dailyEntries,
	allEntries,
	weekEntriesByDate,
	activities,
	phases,
	userDetails,
	getBalance,
	extractBreakTime,
	allTimesTableToData,
	dayDetails,
	getUserDetails
};
