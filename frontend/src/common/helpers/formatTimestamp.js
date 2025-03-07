// Formats local timestamp to MM/dd/YY string format
import moment from 'moment';

export const formatTimestampDateTime = localDate => {
  let date = formatTimestampDate(localDate);

  let hours = localDate.getHours();
  let minutes = localDate.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  let ampm = 'AM';

  if (hours == 12) {
    ampm = 'pm';
  } else if (hours == 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
    ampm = 'PM';
  }

  let formattedData = date + ' ' + hours + ':' + minutes + ' ' + ampm;

  return formattedData;
};

export const formatTimestampDate = localDate => {
  let year = localDate
    .getFullYear()
    .toString()
    .substr(-2);
  let month = localDate.getMonth() + 1;
  let dt = localDate.getDate();
  let hours = localDate.getHours();
  let minutes = localDate.getMinutes();

  if (dt < 10) {
    dt = '0' + dt;
  }

  if (month < 10) {
    month = '0' + month;
  }

  let formattedData = month + '/' + dt + '/' + year + ' ';

  return formattedData;
};

export const formatShortTimestampDate = localDate => {
  let year = localDate
    .getFullYear()
    .toString()
    .substr(-2);
  let month = localDate.getMonth() + 1;
  let dt = localDate.getDate();

  let formattedData = month + '/' + dt + '/' + year + ' ';

  return formattedData;
};

export const formatTimestampDateWithMonthDelta = (localDate, monthDelta) => {
  var newdate = new Date(localDate);
  newdate.setMonth(localDate.getMonth() + monthDelta);
  let year = newdate
    .getFullYear()
    .toString()
    .substr(-2);
  let month = newdate.getMonth() + 1;
  let dt = newdate.getDate();
  let formattedData = month + '/' + dt + '/' + year + ' ';

  return formattedData;
};

export const formatTimestampDateWithDaysDelta = (localDate, daysDelta) => {
  var newdate = new Date(localDate);
  newdate.setDate(localDate.getDate() + daysDelta);

  let year = newdate
    .getFullYear()
    .toString()
    .substr(-2);
  let month = newdate.getMonth() + 1;
  let dt = newdate.getDate();

  let formattedData = month + '/' + dt + '/' + year + ' ';

  return formattedData;
};

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const daysDifference = (a, b) => {
  // var diff = new Date(+d1).setHours(12) - new Date(+d0).setHours(12);
  // return Math.round(diff/8.64e7);

  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export const formatCreatedDateTime = dateTime => moment(dateTime).local().format('M/D/YY h:mm A');

export const formatReadDateTime = dateTime => moment(dateTime).local().format('D MMMM YYYY, hh:mm A');

export const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}