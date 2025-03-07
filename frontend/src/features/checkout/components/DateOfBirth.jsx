import React, { Component } from 'react';
import moment from 'moment';
import { InputGroup } from 'reactstrap';
import styled from 'react-emotion';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';

const FormGroup = styled('div')`
  width: 100%;
  &.year {
    width: 50%;
  }
  .birthdayRow {
    display: flex;
    flex-direction: row;
  }
  .birthdayField {
    display: block;
    width: 31%;
    & input::placeholder {
      font-size: 14px;
    }
    & .month {
      border-radius:4px;
      border: 1px solid lightgray;
    }
    & .year {
      border-radius:4px;
      border: 1px solid lightgray;
    }
    & .day {
      border-radius:4px;
      border: 1px solid lightgray;
    }
  }
  .ant-input-number {
     &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
        opacity: 1;
     }
     width: 100%;

     input {
        min-height: 28px;
        line-height: 1;
        &::-webkit-inner-spin-button,
        -webkit-outer-spin-button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          margin: 0;
          opacity: 1;
        }
     }
  }
  &.quiz-select {
    margin-top: 20;
    width: 100%;
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export class DateOfBirth extends Component {
  state = {
    month: this.props.selected ? moment(this.props.selected).month() + 1 : '',
    day: this.props.selected ? moment(this.props.selected).date() : '',
    year: this.props.selected ? moment(this.props.selected).year() : '',
  };

  componentDidUpdate(prevProps) {
    const { selected } = this.props;

    if (!prevProps.selected && selected) {
      this.setState({
        month: selected ? moment(selected).month() + 1 : '',
        day: selected ? moment(selected).date() : '',
        year: selected ? moment(selected).year() : '',
      })
    }
  }

  handleMonthChange = value => {
    this.setState({
      month: value,
    });
  };

  handleDayChange = value => {
    this.setState({
      day: value,
    });
  };

  handleYearChange = e => {
    if (e.target.value && e.target.value.length > e.target.maxLength) {
      this.setState({
        year: e.target.value.slice(0, e.target.maxLength),
      });
    } else {
      this.setState({
        year: e.target.value,
      }, this.handleOnBlur);
    }
  };

  getDOB = () => {
    const { day, month, year } = this.state;
    const monthLength = month.toString().length;
    const dayLength = day.toString().length;
    const dob = `${year}-${monthLength === 1 ? '0' : ''}${month}-${dayLength === 1 ? '0' : ''
      }${day}`;

    return dob;
  };

  handleOnBlur = () => {
    const { day, month, year } = this.state;

    // if (day && month && year) {
    const dob = this.getDOB();
    this.props.onChange(dob);
    // }
  };

  autoTab = (e, to) => {
    if (e.target.value && e.target.value.length === e.target.maxLength) {
      to.focus();
    }
  };

  render() {
    const yearsInterval = 100;
    return (
      <InputGroup
        style={{ textAlign: 'center' }}
        onBlur={this.handleOnBlur}
      >
        <FormGroup>
          <form style={{ marginBottom: "5px" }} name="dateOfBirth" className="birthdayRow">
            <Row>
              <Col className="birthdayField">
                <input
                  autoFocus
                  className="form-control month"
                  pattern="\d*"
                  name="month"
                  type="number"
                  placeholder="MM"
                  min={1}
                  max={12}
                  maxLength={2}
                  value={this.state.month}
                  onInput={e => {
                    this.autoTab(e, document.dateOfBirth.day)
                  }}
                  onChange={e => this.handleMonthChange(e.target.value)}
                />
              </Col>
              <Col className="birthdayField">
                <input
                  pattern="\d*"
                  name="day"
                  className="form-control day"
                  type="number"
                  placeholder="DD"
                  min={1}
                  max={31}
                  maxLength={2}
                  value={this.state.day}
                  onInput={e => this.autoTab(e, document.dateOfBirth.year)}
                  onChange={e => this.handleDayChange(e.target.value)}
                />
              </Col>
              <Col className="birthdayField">
                <input
                  pattern="\d*"
                  name="year"
                  className="form-control year"
                  type="number"
                  placeholder="YYYY"
                  min={moment().year() - yearsInterval}
                  max={moment().year()}
                  maxLength={4}
                  value={this.state.year}
                  onChange={this.handleYearChange}
                />
              </Col>
            </Row>

          </form>
        </FormGroup>
      </InputGroup>
    );
  }
}
