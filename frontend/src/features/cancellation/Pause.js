import React, { useState, useEffect } from 'react';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import CustomSelect from 'src/components/Select';
import { ModalTitle, OtherLabel } from 'src/features/dashboard/shared/styles';
import moment from 'moment';
import styled from 'react-emotion';
import { StandardOutlineBlueButton } from 'src/common/components/Buttons';
import CustomCheckbox from 'src/components/CustomCheckbox';
import useForceUpdate from 'src/common/hooks/useForceUpdate';
import { Input } from 'reactstrap';
import DBDatePicker from 'src/components/DatePicker';
import { breakpoints, colors, fontFamily } from 'src/variables';
import { StandardBlueButton } from 'src/common/components/Buttons';
import pauseIcon from 'src/assets/images/planPausedIcon.svg';
import HorizontalLine from 'src/components/HorizontalLine';


const Reasons = [
  "Shipments are too frequent, I need to catch up",
  "I’m traveling",
  "Financial reasons",
  "My skin is still adjusting to my formula",
  "Other"
]

const Title = styled.div`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  padding-bottom: 10px;
  padding-top: 20px;
`

const DateContainer = styled.div`
  width: 60%;
  ${breakpoints.xs} {
    width: 100%;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 25px;
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

const ConfirmationMessage = styled.div`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-size: 14px;
  line-height: 26px;
`

const getStarterDate = (props) => {
  if (props.subscription && props.subscription.currentPeriodEndDatetime) {
    return moment(props.subscription.currentPeriodEndDatetime)
  } else {
    return moment()
  }
}

const CustomSelector = (props) => {
  const [dropdownOptions, setDropdownOptions] = useState([])
  const dropdownOptionsMonths = [1, 2, 3]

  useEffect(() => {
    setDropdown()
  }, [props])

  const setDropdown = () => {
    let temp = dropdownOptionsMonths.map(i => {
      return {
        label: `${i} ${i < 2 ? "Month" : "Months"} /  Next refill: ${getStarterDate(props).add(i * 30, 'd').format("MMM D, YYYY")}`,
        value: moment(getStarterDate(props)).add(i * 30, 'days')
      }
    })

    temp.push({
      label: "Select a date",
      value: "Select a date"
    })

    setDropdownOptions(temp)
  }

  return (
    <CustomSelect
      placeholder='Select duration'
      isClearable={false}
      isSearchable={false}
      options={dropdownOptions}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

const Pause = (props) => {
  const { isMobile } = useDeviceDetect();
  const forceUpdate = useForceUpdate()
  const [selectedDropdown, setSelectedDropdown] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [reasonToPause, setReasonToPause] = useState("")
  const [other, setOther] = useState("")
  const [init, setInit] = useState(false)
  const [pausedSuccess, setPausedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (init) {
      props.displayOverlay(props.isUpdatingSubscription)
      if (props.isSubscriptionUpdateSuccess && !pausedSuccess) {
        setPausedSuccess(props.isSubscriptionUpdateSuccess)
      } else if (props.subscriptionErrorMessage) {
        setErrorMessage(props.subscriptionErrorMessage)
      }
    } else {
      setInit(true)
    }
  }, [props])

  const onDropdownSelect = (selectedOption) => {
    setSelectedDate((selectedOption.value && selectedOption.value !== 'Select a date') ? selectedOption.value : getStarterDate(props))
    setSelectedDropdown(selectedOption)
  }

  const onClick = (text) => {
    setReasonToPause(text)
    forceUpdate()
  }

  const isChecked = (text) => {
    return reasonToPause === text;
  }

  const onDayChange = (date) => {
    setSelectedDate(moment(date))
  }

  const isValid = () => {
    if (reasonToPause === "Other") {
      return (other && selectedDate) ? true : false
    }
    return (reasonToPause && selectedDate) ? true : false
  }

  const pauseSubscription = () => {
    const formattedSelectedDate = moment.utc(selectedDate).format()
    props.updateSubscriptionRequest({
      uuid: props.subscription.uuid,
      cancelReason: reasonToPause === "Other" ? `Other: ${other}` : reasonToPause,
      currentPeriodEndDatetime: formattedSelectedDate,
    });
  }

  if (pausedSuccess) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          marginTop: isMobile ? 90 : 30
        }}>
          <div>
            <img style={{
              width: 56,
              height: 56,
              marginBottom: 20
            }} src={pauseIcon} />
          </div>
          <ModalTitle>Your plan is now paused</ModalTitle>
        </div>
        <div style={{
          width: '100%',
          margin: '0 auto',
          paddingTop: 20,
          paddingBottom: 30
        }}>
          <ConfirmationMessage>
            Your next refill is scheduled for {getStarterDate(props).format('LL')}.
          </ConfirmationMessage>
        </div>

        <ButtonContainer
         style={{justifyContent: 'center'}}
        >
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

  return (
    <div style={{
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      <div style={{
        marginTop: isMobile ? 50 : 30,
        marginBottom: 20
      }}>
        <ModalTitle>I’d like to pause my account</ModalTitle>

        <Title>Select duration</Title>
        <DateContainer>
          <CustomSelector
            value={selectedDropdown}
            onChange={onDropdownSelect}
            {...props}
          />
        </DateContainer>

        {selectedDropdown && selectedDropdown.value === 'Select a date' && (<div>
          <Title>Select date</Title>
          <DBDatePicker
            initialDate={selectedDate.toDate()}
            todayInputLabel="Ship now"
            showTodayInputLabel={true}
            dayPickerInputProps={{
              onDayChange: onDayChange
            }}
            style={{
              fontSize: isMobile ? 14 : 18,
            }}
            dayPickerProps={{
              disabledDays: [
                {
                  before: new Date(),
                }]
            }}
          />
        </div>)}

        <Title>Why would you like to pause?</Title>
        <div style={{ marginTop: 20 }}>
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
            {(reasonToPause.indexOf("Other") > -1) && (<div>
              <OtherLabel>
                Share any unlisted reasons why you’d like to pause. We value your feedback!
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
        </div>

      </div>

      <ButtonContainer >
        {isMobile && (
          <HorizontalLine style={{
            marginRight: -15,
            marginLeft: -15,
            marginBottom: 30
          }}
            color={colors.whisper}
          />
        )} 
        <StandardOutlineBlueButton
        active={true}
        onClick={props.onClose}
        type="button"
      >
        Cancel
      </StandardOutlineBlueButton>
        <StandardBlueButton
          disabled={!isValid()}
          onClick={pauseSubscription}
          horizontalPadding={40}
          active={isValid()}
        >
          Continue
        </StandardBlueButton>
      </ButtonContainer>
    </div>
  );
};

export default Pause;
