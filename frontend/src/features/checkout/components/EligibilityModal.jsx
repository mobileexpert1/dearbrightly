import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'react-emotion';
import moment from 'moment';
import { breakpoints, colors, mobileFirstBreakpoints, fontFamily, fontWeight } from 'src/variables';
import Select from 'src/common/components/Select/Select';
import listOfStates from 'src/common/helpers/listOfStates';
import { DateOfBirth } from 'src/features/checkout/components/DateOfBirth';
import { setConsentToTelehealth, setDateOfBirth, setShippingAddressState} from 'src/features/user/actions/userActions';
import { getUserDateOfBirth, getUserEligibilityStatus, getUserEligibilityErrorMessage, getShippingAddressState } from 'src/features/user/selectors/userSelectors';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { navigateCheckout } from 'src/features/checkout/actions/checkoutStepsActions';
import { TelehealthConsent } from './TelehealthConsent';
import { GTMUtils } from 'src/common/helpers/gtmUtils';

const DEBUG = getEnvValue('DEBUG');
const MANUAL_TEST_MODE = getEnvValue('MANUAL_TEST_MODE');

const EligibilityContainer = styled('div')`
    width: 100%;
    height: 100%;
    margin: 0 auto;
    min-width: 300px;    
    background: ${colors.white};
    overflow-y: scroll;
    @media (min-height:568px) and (min-width: 576px) {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    ${mobileFirstBreakpoints.sm} {
      min-width: 600px
    }      
`;

const StateWrapper = styled('div')`
  padding: 5px 0;
  height: 75px;
  min-width: 300px;
  margin: 10px;
  ${mobileFirstBreakpoints.sm} {
    min-width: 600px
  }    
`;

const TitleWrapper = styled('div')`
  padding: 10px 0; 
  ${mobileFirstBreakpoints.sm} {
    padding: 0;
  }     
`;

const BoldTextContainer = styled('div')`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  @media (max-width: 380px) {
    height: 12px;
  }
  font-size: 30px;
  line-height: 36px;
  color: ${colors.shark};
  margin: 10px;
  ${mobileFirstBreakpoints.sm} {
    font-size: 30px;
  }
  ${mobileFirstBreakpoints.lg} {
    margin: 0; 
  }    
`;

const EligibilityTextContainer = styled('div')`
  font-family: ${fontFamily.baseFont};
  font-size: 14px;
  line-height: 25px;
  padding: 20px 10px 15px 10px;
  ${mobileFirstBreakpoints.lg} {
    padding: 20px 0 15px 0;
  }    
`;

const YourPlanWrapper = styled('div')`
  opacity: ${props => props.theme.yOpacity};
  transition: 0.3s all ease-in;
`;

const MessagesDiv = styled('div')`
  text-align: center;
  margin: 3px 0 10px;
  display: block;
  height: 20px;
`;

const ErrorMessage = styled('div')`
  font-size: 14px;
  color: red;
`;

const SuccessMessage = styled('div')`
  font-size: 14px;
  color: green;
`;

const DateOfBirthContainer = styled('div')`
  margin: 10px;
  min-width: 300px;
  ${mobileFirstBreakpoints.sm} {
    min-width: 600px
  }  
  margin-bottom: 50px;
`;

const InputBoxTitle = styled('p')`
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  font-style: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${colors.shark};
  margin-bottom: 5px;
`;

const BottomNavContainer = styled('div')`
  margin: 0 auto;
  ${breakpoints.xs} {  
    width: 100%;
  }    
`;

const consentWrapperStyles = css`
  margin-top: 10px
`

const consentMessageStyles = css`
  max-width: unset
`

class EligibilityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eOpacity: '1',
      yOpacity: '0',
      displayEligibilityModal: true,
      userEligibilityAcknowledged: false,
      userSelectedDateOfBirth: null,
      userSelectedShippingAddressState: null,
      isConsent: false
    };
  }

  showModal = () => {
    const { isUserEligible } = this.props;

    if (isUserEligible) {
      return false;
    }

    return true;
  };

  componentDidMount() {
    const { shippingAddressState, userDateOfBirth } = this.props;
    
    let gtmCheckoutEvents = (sessionStorage.getItem('gtmCheckoutEvents') !== null) ? JSON.parse(sessionStorage.getItem('gtmCheckoutEvents')) : [];    
    if (gtmCheckoutEvents.indexOf('checkout_eligibility_view') == -1) {
      GTMUtils.trackCall('checkout_eligibility_view');
      gtmCheckoutEvents.push('checkout_eligibility_view');
      sessionStorage.setItem('gtmCheckoutEvents', JSON.stringify(gtmCheckoutEvents))
    }   

    // if (MANUAL_TEST_MODE && DEBUG) {
    //   this.setState({
    //     userSelectedDateOfBirth: moment('1987-08-08').format("YYYY-MM-DD"),
    //     userSelectedShippingAddressState: 'CA'
    //   }, () => {
    //       this.handleStateSelectChange('CA')
    //       this.handleDateChange('1987-08-08')
    //       this.nextButtonClicked()
    //   })
    // }

    if (shippingAddressState) {
      this.setState({ userSelectedShippingAddressState: shippingAddressState });
    }

    if (userDateOfBirth) {
      this.setState({ userSelectedDateOfBirth: moment(userDateOfBirth) });
    }

    this.setState({ displayEligibilityModal: this.showModal() });
  }

  componentDidUpdate(prevProps) {
    const { shippingAddressState, userDateOfBirth } = this.props;
    const { userSelectedDateOfBirth, userSelectedShippingAddressState } = this.state;

    if (this.state.userEligibilityAcknowledged) {
      return;
    }

    if (!userSelectedDateOfBirth && userDateOfBirth) {
      this.setState({ userSelectedDateOfBirth: moment(userDateOfBirth) });
    }

    if (!userSelectedShippingAddressState && shippingAddressState) {
      this.setState({ userSelectedShippingAddressState: shippingAddressState });
    }

  }

  handleStateSelectChange = val => {
    this.setState({ userSelectedShippingAddressState: val }, (val) => {
      this.props.setShippingAddressState(this.state.userSelectedShippingAddressState);
    });
  };

  handleDateChange = val => {
    const { user, updateCustomerDataRequest } = this.props;

    const formattedDate = moment(val, 'YYYY-M-D', true);

    if (formattedDate) {
      this.setState({
        userSelectedDateOfBirth: formattedDate.format('YYYY-MM-DD')
      }, () => {
        this.props.setDateOfBirth(this.state.userSelectedDateOfBirth);
        if (formattedDate.isValid()) {
          if (user && user.id) {
            const userDetails = {
              id: user.id,
              dob: this.state.userSelectedDateOfBirth,
            };
            updateCustomerDataRequest(userDetails);
          }
        }
      })
    }

  }

  handleConsentChange = () => {
    this.setState({
      isConsent: !this.state.isConsent
    }, (val) => {
      this.props.setConsentToTelehealth(this.state.isConsent);
    });
  };

  nextButtonClicked = () => {
    this.setState({ eOpacity: '0', yOpacity: '1', userEligibilityAcknowledged: true, displayEligibilityModal: false });
  }

  render() {
    const {
      displayEligibilityModal,
      userEligibilityAcknowledged,
      userSelectedDateOfBirth,
      userSelectedShippingAddressState,
    } = this.state;

    const {
      isUserEligible,
      eligibilityErrorMessage,
    } = this.props;

    return (
      <div style={{ transition: "0.3s all ease-in", opacity: ".9" }}>
        {displayEligibilityModal && (
            <EligibilityContainer id={"eligibility-container"} theme={this.state}>
              <TitleWrapper>
                <BoldTextContainer>
                  Let's get started!
                </BoldTextContainer>
                <EligibilityTextContainer>
                  First, let’s make sure you’re at the right place, at the right time, to receive a doctor consult.
                </EligibilityTextContainer>
              </TitleWrapper>
              <StateWrapper id={"state-wrapper"}>
                <InputBoxTitle>State</InputBoxTitle>
                <Select
                    name="state"
                    handleChange={e => this.handleStateSelectChange(e.target.value)}
                    optionItems={listOfStates()}
                    value={userSelectedShippingAddressState}
                    fullWidth
                    minHeight
                />
              </StateWrapper>
              <DateOfBirthContainer id={"dob-container"}>
                <InputBoxTitle>Date of birth</InputBoxTitle>
                <DateOfBirth selected={userSelectedDateOfBirth} onChange={val => this.handleDateChange(val)} />
                <TelehealthConsent onChange={this.handleConsentChange} messageStyles={consentMessageStyles} wrapperStyles={consentWrapperStyles} />
              </DateOfBirthContainer>

            {isUserEligible && (
              <MessagesDiv>
                <SuccessMessage>{"Congrats! You're eligible."}</SuccessMessage>
              </MessagesDiv>
            )}
            {eligibilityErrorMessage && (
              <MessagesDiv>
                <ErrorMessage>{eligibilityErrorMessage}</ErrorMessage>
              </MessagesDiv>
            )}
                <BottomNavContainer id={"bottom-nav-container"}>
                  <BottomNav
                      currentCheckoutStepName={"eligibility"}
                      backButtonType={"arrow"}
                      disableBackButton={true}
                      disableNextButton={!isUserEligible || !this.state.isConsent}
                      hideNextButtonArrow={true}
                      hideBackButton={true}
                      nextButtonClick={this.nextButtonClicked}
                      nextTitle={"Continue"}
                  />
                </BottomNavContainer>
          </EligibilityContainer>
        )}
        {(userEligibilityAcknowledged || !displayEligibilityModal) && (
          <YourPlanWrapper>{this.props.children}</YourPlanWrapper>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    eligibilityErrorMessage: getUserEligibilityErrorMessage(state),
    isUserEligible: getUserEligibilityStatus(state),
    shippingAddressState: getShippingAddressState(state),
    userDateOfBirth: getUserDateOfBirth(state),
  }),
  {
    navigateCheckout,
    setConsentToTelehealth,
    setShippingAddressState,
    setDateOfBirth,
  },
)(EligibilityModal);