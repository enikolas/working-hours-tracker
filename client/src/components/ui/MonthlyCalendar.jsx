import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import './MonthlyCalendar.css';

const _getStyleClassForCalendarDays = (timeEntries) => {
  const checked = [];
  const unchecked = [];
  const futureDay = [];

  const holidays = [];
  const vacations = [];
  const otanjoubis = [];
  const absences = [];

  timeEntries.forEach((dayEntry) => {
    const day = moment(dayEntry.date).startOf('day').toDate();

    if (dayEntry.isHoliday) {
      holidays.push(day);
    } else if (dayEntry.isVacation) {
      vacations.push(day);
    } else if (dayEntry.isOtanjoubi) {
      otanjoubis.push(day);
    } else if (dayEntry.isJustifiedAbsence) {
      absences.push(day);
    } else if (dayEntry.total && dayEntry.total !== '0:00') {
      checked.push(day);
    } else {
      unchecked.push(day);
    }

    const isDayAfterToday = moment(day).isAfter(moment(), 'day');
    if (isDayAfterToday) {
      futureDay.push(day);
    }
  });

  return [
    { 'calendar-checked': checked },
    { 'calendar-unchecked': unchecked },
    { 'calendar-holiday': holidays },
    { 'calendar-vacation': vacations },
    { 'calendar-otanjoubi': otanjoubis },
    { 'calendar-absence': absences },
    { 'calendar-future-day': futureDay }
  ];
};

const MonthlyCalendar = ({ selectedDate, onDateChange, timeEntries }) => {
  return selectedDate && (
    <DatePicker
      inline
      highlightDates={_getStyleClassForCalendarDays(timeEntries)}
      selected={selectedDate.toDate()}
      onChange={onDateChange}
      filterDate={date => moment(date).isSameOrBefore(moment(), 'day')}
      maxTime={new Date()}
    />
  );
};

MonthlyCalendar.propTypes = {
  selectedDate: PropTypes.object,
  onDateChange: PropTypes.func,
  timeEntries: PropTypes.array
};

MonthlyCalendar.defaultProps = {
  selectedDate: {},
  onDateChange: () => {},
  timeEntries: []
};

export default MonthlyCalendar;
