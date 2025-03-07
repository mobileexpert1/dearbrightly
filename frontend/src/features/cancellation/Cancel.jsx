import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import CustomModal from 'src/components/Modal';
import styled from 'react-emotion';
import { ModalTitle, OtherLabel } from 'src/features/dashboard/shared/styles';
import { breakpoints, colors, fontFamily, fontWeight } from 'src/variables';
import CustomCheckbox from 'src/components/CustomCheckbox';
import { Input, Row, Col } from 'reactstrap';
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import HorizontalLine from 'src/components/HorizontalLine';
import leftArrow from 'src/assets/images/left-arrow1.svg';
import useForceUpdate from 'src/common/hooks/useForceUpdate';
import { subscriptionsService } from 'src/rootService';


const SubTitle = styled.span`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-weight: ${fontWeight.bold};
  font-size: 14px;
  line-height: 17px;
  color: ${colors.veryDarkBlue};
  margin-bottom: 20px;
`

const Reasons = [
  "Formula strength is too high",
  "Formula strength is too low",
  "I’m not seeing a difference",
  "Financial reasons",
  "Shipments are too frequent, I need to catch up",
  "I’m pregnant or trying to conceive",
  "Other"
]

const ButtonContainer = styled.div`
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

const Cancel = (props) => {
  const forceUpdate = useForceUpdate()
  const { isMobile } = useDeviceDetect();
  const [step, setStep] = useState(1)
  const [stepResponse, setStepResponse] = useState({})
  const [reasonsToCancel, setReasonsToCancel] = useState("")
  const [other, setOther] = useState("")
  const [feedback, setFeedback] = useState("")
  const [cancellationSuccess, setCancellationSuccess] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [init, setInit] = useState(false)

  useEffect(() => {
    if (init) {
      props.displayOverlay(props.isUpdatingSubscription)
      if (props.isSubscriptionUpdateSuccess && !cancellationSuccess) {
        setCancellationSuccess(props.isSubscriptionUpdateSuccess)
        if (feedback) {
          subscriptionsService.sendFeedbackEmail(feedback, 'Feedback');
        }
      }

      if (props.subscriptionErrorMessage) {
        setErrorMessage(props.subscriptionErrorMessage)
      }
    } else {
      setInit(true)
    }

  }, [props])

  const onClick = (text) => {
    setReasonsToCancel(text)
    forceUpdate()
  }

  const isChecked = (text) => {
    return reasonsToCancel === text;
  }

  const submitCancellation = () => {
    props.updateSubscriptionRequest({
      uuid: props.subscription.uuid,
      cancelDatetime: moment().format('YYYY-MM-DD'),
      cancelReason: reasonsToCancel === "Other" ? `Other: ${other}` : reasonsToCancel,
      isActive: false
    })
  }

  if (cancellationSuccess) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          marginTop: isMobile ? 90 : 30
        }}>
          <ModalTitle>Your plan is now canceled</ModalTitle>
        </div>
        <div style={{
          width: isMobile ? '100%' : '50%',
          margin: '0 auto',
          paddingTop: 20,
          paddingBottom: 30
        }}>
          <OtherLabel style={{ fontSize: 14, lineHeight: '26px' }}>
            Let us know if you need anything else. We’ll be here if and when you need us!
          </OtherLabel>
        </div>

        <ButtonContainer>
          {isMobile && (
            <HorizontalLine style={{
              marginRight: -15,
              marginLeft: -15,
              marginBottom: 30
            }}
              color={colors.whisper}
            />
          )}
          <StandardBlueButton
            onClick={props.onClose}
            maxWidth={isMobile ? '100%' : null}
            horizontalPadding={isMobile ? 10 : 40}
            active={true}
          >
            Back to your plan
          </StandardBlueButton>
        </ButtonContainer>
      </div>
    )
  }

  const isValid = () => {
    if (step === 2) {
      return true
    }
    if (reasonsToCancel === "Other") {
      return other ? true : false
    }

    return reasonsToCancel ? true : false
  }

  return (
    <div style={{
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      <div style={{
        marginTop: isMobile ? 65 : 30,
        marginBottom: 20
      }}>
        <ModalTitle>{step === 1 ? "Why would you like to cancel?" : "How can we improve?"}</ModalTitle>
      </div>

      <SubTitle>{step === 1 ? "Check the best reason that applies." : "We’d love to hear your feedback"}</SubTitle>
      <div style={{ marginTop: 20 }}>
        {step === 1 ? (
          <div>
            {Reasons.map((reason, i) =>
              <CustomCheckbox
                key={i.toString()}
                title={reason}
                checked={isChecked(reason)}
                onClick={() => {
                  onClick(reason)
                }}
              />
            )}
            {(reasonsToCancel.indexOf("Other") > -1) && (<div>
              <OtherLabel>
                Share any unlisted reasons why you’d like to cancel. We value your feedback!
              </OtherLabel>
              <div style={{
                marginTop: 10
              }}>
                <Input maxLength={190} type="textarea" value={other} onChange={(e) => {
                  setOther(e.target.value)
                }} />
                {other.length === 190 && (
                  <div className="text-info text-center">Max length is 200 characters.</div>
                )}
              </div>
            </div>)}
          </div>
        ) : (
            <div>
              <Input maxLength={1000} type="textarea" value={feedback} onChange={(e) => { setFeedback(e.target.value) }} />
              {feedback.length === 1000 && (
                <div className="text-info text-center">Max length is 1000 characters.</div>
              )}
            </div>
          )
        }

      </div>

      {errorMessage && (<div className={"text-center text-danger mt-2"}>{errorMessage}</div>)}

      <ButtonContainer>
        {isMobile && (
          <HorizontalLine style={{
            marginRight: -15,
            marginLeft: -15,
            marginBottom: 30
          }}
            color={colors.whisper}
          />
        )}
        <Row style={{
          marginTop: 20,
          fontSize: isMobile ? 12 : 14,
          justifyContent: isMobile ? 'center' : 'none'
        }}>
          {!isMobile && (<Col className={"text-left"} xs={6}>
            <div style={{ padding: '10 40 10 0', width: '100%', cursor: "pointer" }}
              onClick={() => {
                if (step === 1) {
                  props.onBackPressed()
                } else {
                  setStep(1)
                }
              }}
            >
             <React.Fragment><img style={{ height: 20, marginTop: -2, marginRight: 5 }} src={leftArrow} />
             <span style={{ fontWeight: "bold" }}>Back</span></React.Fragment>
            </div>
          </Col>)}
          <Col xs={6} className={"text-right"}>
            <StandardBlueButton
              disabled={!isValid()}
              onClick={() => {
                if (step === 1) {
                  setStep(2)
                } else {
                  submitCancellation()
                }
              }}
              horizontalPadding={40}
              active={isValid()}
            >
              {step === 1 ? "Continue" : "Cancel plan"}
            </StandardBlueButton>
          </Col>
        </Row>
      </ButtonContainer>



    </div>
  );
};

export default Cancel;
