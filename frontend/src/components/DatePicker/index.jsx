import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment'
import 'react-day-picker/lib/style.css';
import styled from 'react-emotion';
import arrowLeft from 'src/assets/images/arrowLeft.svg';
import arrowRight from 'src/assets/images/arrowRight.svg';
import moment from 'moment';
import { Input } from 'reactstrap';
import { colors } from 'src/variables';

const Arrow = styled.img`
  position: absolute;
`

const LeftAlign = styled.div`
  float: left
`

const RightAlign = styled.div`
  float: right;
  marginRight: 10;
`

function Navbar({
  nextMonth,
  previousMonth,
  onPreviousClick,
  onNextClick,
  className,
  localeUtils,
}) {
  const months = localeUtils.getMonths();
  const prev = months[previousMonth.getMonth()];
  const next = months[nextMonth.getMonth()];

  return (
    <div style={{ padding: 20 }}>
      <LeftAlign onClick={() => { onPreviousClick() }}>
        <Arrow src={arrowLeft} />
      </LeftAlign>

      <RightAlign onClick={() => { onNextClick() }}>
        <Arrow src={arrowRight} />
      </RightAlign>

    </div>
  );
}


const DBDatePicker = (props) => {

  const {
    dayPickerProps,
    dayPickerInputProps,
    inputProps,
    style,
    showTodayInputLabel = false,
    todayInputLabel,
    initialDate,
    customDisabledColor
  } = props;
  const format = "MM-DD-YYYY"

  const renderComponent = (props) => {
    let value = props.value || moment(initialDate).format(format);
    const isSameDay = moment((props.value || initialDate), format).isSame(new Date(), "day");
    if (showTodayInputLabel && isSameDay) {
      value = todayInputLabel
    }

    return (
      <Input
        custom-disabled-color={customDisabledColor}
        className="custom-datepicker"
        {...props}
        value={value}
      />
    )
  }

  return (
    <DayPickerInput
      inputProps={{
        style: {
          borderRadius: 4,
          border: `1px solid ${colors.veryLightBlue}`
        },
        ...inputProps,
      }}
      formatDate={formatDate}
      parseDate={parseDate}
      format={format}
      placeholder={format}
      component={renderComponent}
      dayPickerProps={{
        navbarElement: Navbar,
        localeUtils: MomentLocaleUtils,
        initialMonth: initialDate || moment().toDate(),
        ...dayPickerProps,
      }}
      style={{
        ...style
      }}
      {...dayPickerInputProps}
    />
  );
};

export default DBDatePicker;
