import React, { useState, useEffect } from 'react';
import styled from 'react-emotion';
import { colors, breakpoints, errorMessageStyle, fontFamily } from 'src/variables';
import CardInfoSection from 'src/features/checkout/components/CardInfoSection';
import { Elements, StripeProvider } from 'react-stripe-elements';
import CreditCardForm from './CreditCardForm';
import DBDatePicker from 'src/components/DatePicker';
import HorizontalLine from 'src/components/HorizontalLine';
import moment from 'moment';
import { connect } from 'react-redux';
import { isCreditCardUpdating, isCreditCardUpdateSuccess } from 'src/features/checkout/selectors/paymentSelectors';
import {
  isUpdatingSubscription, getSubscriptionsErrorMessage, isSubscriptionUpdateSuccess
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import CustomModal from 'src/components/Modal';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { StandardBlueButton } from 'src/common/components/Buttons';
import { getEnvValue } from 'src/common/helpers/getEnvValue';


const STRIPE_KEY = getEnvValue('STRIPE_KEY_PUBLISHABLE');
const StripeCardInput = (CardInfoSection)

const fontFamilyAndStyle = `
  font-family: ${fontFamily.baseFont};
  font-style: normal;
`

const SubTitle = styled.span`
    ${fontFamilyAndStyle}
    font-weight: bold;
    font-size: 14px;
    line-height: 24px;
    color: #3B5998;
    padding-bottom: 10px;
  `

const CardLabel = styled.div`
    ${fontFamilyAndStyle}
    font-weight: bold;
    font-size: 10px;
    line-height: 12px;
    color: #24272A;
    padding-bottom: 10px
  `

const Container = styled.div`
    padding-top: 20px;
    padding-bottom: 20px;
  `

const MarginLeft = styled.div`
      margin-left: -15px
`

const ButtonContainer = styled.div`
    ${breakpoints.lg} {
      float: right
    }
    ${breakpoints.xl} {
      float: right
    }
    ${breakpoints.xxl} {
      float: right
    }
    ${breakpoints.md} {
      float: right
    }
    ${breakpoints.xs} {
      margin: 20px auto auto;
      bottom: 0;
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
    }
  `

let submit = null

const UpdatePaymentModal = (props) => {
  const { isMobile } = useDeviceDetect();
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState("")
  const [cardEntryComplete, setCardEntryComplete] = useState(false)

  useEffect(() => {
    const {
      subscriptionErrorMessage,
      isCreditCardUpdateSuccess,
      isSubscriptionUpdateSuccess,
    } = props;

    if (isCreditCardUpdateSuccess && !subscriptionErrorMessage) {
      updateShipmentDate()
    }

    if (isSubscriptionUpdateSuccess) {
      window.history.pushState({}, null, '/user-dashboard/my-plan');
      props.onSuccess()
    }

    if (subscriptionErrorMessage) {
      setError(subscriptionErrorMessage)
    }
  }, [props])

  const updateShipmentDate = () => {
    const days = moment(moment(selectedDate)).diff(moment(), 'days')
    let payload = {
      uuid: props.subscription.uuid,
      isActive: true
    }

    if (days === 0) {
      payload['shipNow'] = true
    } else {
      payload['delayInDays'] = days
    }
    props.updateSubscriptionRequest(payload);
  }

  const handleSubmit = (event) => {
    submit(event)

  }

  const onDayChange = (val) => {
    setSelectedDate(val)
  }

  const onCardInfoChange = (value) => {
    setCardEntryComplete(value.complete)
  }

  const buttonActive = selectedDate && cardEntryComplete;

  return (

    <CustomModal
      title={"Update payment method"}
      onClose={props.onClose}
      showOverlay={props.isCreditCardUpdating}
      overlayText={"We're processing your request. Please don't navigate away or close this window until your request is complete."}
    >
      <div>
        <SubTitle>Payment method</SubTitle>
        <HorizontalLine />
        <Container>
          <StripeProvider apiKey={STRIPE_KEY}>
            <Elements>
              <div>
                <div>
                  <CardLabel>Card info</CardLabel>
                  <MarginLeft>
                    <CreditCardForm
                      onCardInfoChange={onCardInfoChange}
                      fontSize={isMobile ? 14 : 18}
                      isUpdatePayment={true}
                      submitCardInfo={click => {
                        submit = click
                      }}
                    />
                  </MarginLeft>
                </div>
                <div>
                  {error && (
                    <span style={{
                      ...errorMessageStyle,
                      marginTop: -10
                    }} >
                      {error}
                    </span>
                  )}
                </div>
              </div>
            </Elements>
          </StripeProvider>
        </Container>

        <SubTitle>Shipment date</SubTitle>
        <HorizontalLine />

        <Container>
          {/*<DateRestrictionLabel>Select within 30-day period</DateRestrictionLabel>*/}
          <DBDatePicker
            initialDate={moment().toDate()}
            showTodayInputLabel={true}
            todayInputLabel="Ship now"
            dayPickerInputProps={{
              onDayChange: onDayChange,
              inputProps: {
                disabled: true
              }
            }}
            style={{
              fontSize: isMobile ? 14 : 18,
            }}
            dayPickerProps={{
              disabledDays: [
                {
                  after: moment().toDate(),
                  before: moment().toDate(),
                }]
            }}
          />
        </Container>


        <ButtonContainer>
          {isMobile && (<HorizontalLine color={colors.whisper} style={{
            marginLeft: -20,
            marginRight: -20,
            marginBottom: 30
          }} />)}

          <StandardBlueButton
            horizontalPadding={isMobile ? 90 : 40}
            disabled={(props.isCreditCardUpdating || !buttonActive) ? true : false}
            onClick={handleSubmit}
            active={buttonActive}
          >
            {props.isCreditCardUpdating ? "Updating" : "Update"}
          </StandardBlueButton>
        </ButtonContainer>
      </div>
    </CustomModal>
  );
};

const mapStateToProps = state => ({
  isSubscriptionUpdateSuccess: isSubscriptionUpdateSuccess(state),
  isSubscriptionUpdating: isUpdatingSubscription(state),
  subscriptionErrorMessage: getSubscriptionsErrorMessage(state),
  isCreditCardUpdating: isCreditCardUpdating(state),
  isCreditCardUpdateSuccess: isCreditCardUpdateSuccess(state),
});

export default connect(
  mapStateToProps,
  null
)(UpdatePaymentModal)