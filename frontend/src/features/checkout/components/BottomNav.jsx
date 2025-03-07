import React from 'react';
import styled from 'react-emotion';

import leftArrow from 'src/assets/images/left-arrow.svg';
import rightArrow from 'src/assets/images/rightArrow.svg';
import { snakeCase } from 'src/common/helpers/formatText';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

import {colors, breakpoints, fontSize, mobileFirstBreakpoints} from 'src/variables';

const Wrapper = styled('div')`
  background: #fff;
  padding: 0;
  width: 400px;
  margin: 0 auto;  
  bottom: 0;
  position: static;
  left: 0;
  transform: none;
   
  ${breakpoints.xs} {
    width: 100%;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
  } 
`;

const ButtonWrapper = styled('div')`
  padding: 0;
  bottom: 0;
  .shop-btn {
    font-size: ${fontSize.small};
    line-height: 22px;
    color: ${colors.shark};
    opacity: 0.5;
    width: 100%;
    &.print-btn {
      text-decoration: underline;
    }

    .back-arrow {
      background: url(${leftArrow}) 0 0 no-repeat;
      background-size: 100%;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
      height: 16px;
      width: 15px;
    }
  }
  .next-btn {
    font-size: ${fontSize.small};
    line-height: 18px;
    font-weight: 800;
    text-align: center;
    padding: 0px;
    height: 55px;
    min-width: 50%;
    width: 100%;

    & + .next-btn {
      margin-left: 10px;
    }
  }

  ${breakpoints.xs} {
    padding: 0;
  }
`;
const ButtonsInner = styled('div')`
  background: transparent;
  display: flex;
  justify-content: ${props => (props.hideBackButton ? 'center' : 'space-between')};
  align-items: center;

  ${breakpoints.xs} {
    margin-top: 0px;
    background: ${colors.clear};
  }
`;

const Button = styled.button`
  cursor: ${props => !props.disabled && 'pointer'};
  border: none;
  width: 114px;
  height: 45px;
  background-color: ${props => (props.disabled ? colors.gallery : colors.facebookBlue)};
  border-radius: 4px;
  font-size: ${props => (`${props.fontSize}px` || fontSize.medium)};
  line-height: 22px;
  color: ${props => (props.disabled ? colors.chambrayOpacity : colors.white)};
  &:hover {
    background-color: ${props => (props.disabled ? colors.gallery : colors.facebookBlue)};
  }
  &:focus {
    box-shadow: none;
    outline: none;
  }

  ${breakpoints.xs} {
    border-radius: 0px;
  }

  ${breakpoints.xs} {
    width: ${props => props.hideBackButton && '100%'};
  }
`;

const StyledIcon = styled.img`
  display: ${props => props.disabled && 'none'};
  width: 18px;
  fill: ${colors.black};
  margin-left: 23px;
  margin-bottom: 3px;
`;

const BackButton = styled.a`
  display: ${props => props.disabled && 'none'};

  ${breakpoints.sm} {
    font-size: ${fontSize.small};
    line-height: 17px;
    font-weigh: 800;
    text-align: center;
    width: 50%;
  }

  ${breakpoints.xs} {
    font-size: ${fontSize.small};
    font-weight: 800;
    text-align: center;
    width: 50%;
  }
`;

const InnerWrapper = styled.div`
  ${breakpoints.sm} {
    margin-left: -15px
  }
`
export default class QuestionnaireBottomNav extends React.Component {
  handleNextButtonClick = e => {
    if (this.props.currentCheckoutStepName !== 'payment confirmation') {
      e.preventDefault();
    }

    if (this.props.currentCheckoutStepName) {
      const stepNameSnakeCase = snakeCase(this.props.currentCheckoutStepName);
      GTMUtils.trackCall(stepNameSnakeCase + '_next_click');
    }

    if (this.props.nextButtonClick) {
      this.props.nextButtonClick();
    }
  };

  handleBackButtonClick = e => {
    e.preventDefault();
    this.props.backButtonClick();
  };

  render() {
    const {
      backButtonType,
      backButtonTitle,
      nextTitle,
      disableBackButton,
      isUserDashboard,
      disableNextButton,
      hideBackButton,
    } = this.props;

    return (
      <Wrapper id="bottom-nav"
        isUserDashboard={isUserDashboard}
      >
        <InnerWrapper>
          <ButtonWrapper className="op-shopping-btn">
            <ButtonsInner id={"buttons-inner"}
              hideBackButton={hideBackButton}
            >
              {backButtonType === 'button' && (
                <Button
                  disabled={disableBackButton}
                  href="#"
                  className="next-btn"
                  onClick={this.handleBackButtonClick}
                >
                  {backButtonTitle}
                </Button>
              )}
              {backButtonType === 'arrow' && (
                <BackButton
                  href="#"
                  disabled={hideBackButton}
                  className="shop-btn"
                  onClick={this.handleBackButtonClick}
                  hideBackButton={hideBackButton}
                >
                  <i className="back-arrow" />
                  {backButtonTitle}
                </BackButton>
              )}
              <Button
                disabled={disableNextButton}
                className="next-btn"
                onClick={this.handleNextButtonClick}
                hideBackButton={hideBackButton}
              >
                {nextTitle}
                {!this.props.hideNextButtonArrow && (<StyledIcon disabled={disableNextButton} src={rightArrow} />)}
              </Button>
            </ButtonsInner>
          </ButtonWrapper>
        </InnerWrapper>
      </Wrapper>
    );
  }
}