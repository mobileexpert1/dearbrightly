import React, { Component } from 'react';
import styled from 'react-emotion';
import { Container } from 'reactstrap';

const StepsWrapper = styled('div')`
  background: #fff;
  position: sticky;
  top: 18px;
  z-index: 9;
`;
const ListWrapper = styled('ol')`
  position: relative;
  display: block;
  padding: 0px;
  margin: 0;
  text-align: center;
`;
const Step = styled('li')`
  position: relative;
  display: inline-block;
  width: 20%;
  height: 50px;

  &:first-child {
    &:before {
      left: 50%;
    }
  }

  &:last-child {
    &:before {
      display: none;
    }
  }

  &:before {
    content: '';
    height: 3px;
    background: #D9D9D9;
    position: absolute;
    width: 100%;
    left: 50%;
    right: 0;
  }

  &.current {
    &:before {
      background: #D9D9D9;
      width: 100%;
    }

    span {
      border-color: #C55482;
      background: #C55482;
      height: 24px;
      width: 24px;
      top: -11px;

      &:before {
        content: '';
        position: absolute;
        top: 0px;
        left: 0px;
        background: #C55482;
        border-radius: 50%;
        z-index: -1;
        height: 18px;
        width: 18px;
        border: 3px solid #fff;
      }
    }
  }

  &.active {
    &:before {
      background: #C55482;
      width: 100%;
    }

    span {
      border-color: #C55482;
      background: #C55482;
    }
  }
`;

const StepText = styled('p')`
  position: absolute;
  width: 100%;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  font-size: 12px;
  line-height: 16px;
  color: rgb(105, 105, 105);
  text-align: center;
`;

const StepDot = styled('span')`
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  display: block;
  width: 12px;
  height: 12px;
  border: 3px solid #D9D9D9;
  border-radius: 50%;
  background: rgb(250, 248, 247);
  transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);

  &.current {
    border-color: #C55482;
    background: #C55482;
    height: 24px;
    width: 24px;
    top: -11px;

    &:before {
      content: '';
      position: absolute;
      top: 0px;
      left: 0px;
      background: #C55482;
      border-radius: 50%;
      z-index: -1;
      height: 18px;
      width: 18px;
      border: 3px solid #fff;
    }
  }
`;

// ['', '', '']
export default class CheckoutSteps extends Component {
  addClass = (step, currentCheckoutStepName) => {
    const { steps } = this.props;

    if (currentCheckoutStepName === 'payment confirmation') {
      currentCheckoutStepName = 'payment';
    }

    // refactor after we chose an onboarding variation type
    if (currentCheckoutStepName === 'photos') {
      if (steps.length === 3) {
        currentCheckoutStepName = 'skin profile';
      } else {
        currentCheckoutStepName = 'photos';
      }
    }

    if (currentCheckoutStepName === 'photo id') {
      if (steps.length === 3) {
        currentCheckoutStepName = 'skin profile';
      } else {
        currentCheckoutStepName = 'photos';
      }
    }

    const currentCheckoutStepIndex = steps.indexOf(currentCheckoutStepName);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentCheckoutStepIndex) {
      return 'active';
    }
    if (stepIndex === currentCheckoutStepIndex) {
      return 'current';
    }
    return '';
  };

  render() {
    const { currentCheckoutStepName, steps } = this.props;

    return (
      <StepsWrapper id="steps-wrapper">
        <Container>
          <ListWrapper className="clearfix">
            {steps.map(item => (
              <Step className={this.addClass(item, currentCheckoutStepName)}>
                <StepText>{item}</StepText>
                <StepDot />
              </Step>
            ))}
          </ListWrapper>
        </Container>
      </StepsWrapper>
    );
  }
}