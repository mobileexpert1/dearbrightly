import React from 'react';
import styled from 'react-emotion';
import Select from 'react-select';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import cancelArrows from 'src/assets/images/cancelArrows.svg';
import refillIcon from 'src/assets/images/refillBlue.svg';
import confirmationIcon from 'src/assets/images/confirmationIcon.svg';
import infoIcon from 'src/assets/images/info.svg';

import { colors, breakpoints } from 'src/variables';
import { FREQUENCY_OPTIONS } from 'src/common/constants/subscriptions';
import { Row, Col } from 'reactstrap';
import CustomSelect from 'src/components/Select';

const StyledModal = styled(Modal)`
  .modal-body {
    display: block;
    flex-direction: column;
    width: fit-content;
    margin: 0 auto;
    justify-content: center;
    padding: 5px 40px;
  }

  .modal-content {
    margin: 0 auto;
    max-width: 367px;
    max-height: 460px;
    padding-bottom: 420px;
    ${breakpoints.xs} {
      min-height: 100%;
      width: 100%;
      padding-left: 5%;
      padding-right: 5%;
    }
  }

  .modal-close {
    display: none;
  }
`;

export const BlueButton = styled.button`
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: ${colors.white};
  border: none;
  height: 40px;
  width: 100%;
  padding: 0 20px;
  border-radius: 4px;
  background-color: ${colors.facebookBlue};

  :hover {
    color: ${colors.white};
    background-color: ${colors.facebookBlue};
  }

`;

const IconBackground = styled.div`
  position: relative;
  height: 88px;
  width: 88px;
  background: ${colors.blackSqueeze};
  border-radius: 50px;
  margin-bottom: 10px;

  ${breakpoints.sm} {
    margin: 0 auto 10px;
  }
`;

const PlanIcon = styled.img`
  position: absolute;
  height: ${props => props.width};
  width: ${props => props.width};
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const OptionHeader = styled.p`
  font-size: 20px;
  line-height: 24px;
  color: ${colors.darkModerateBlue};
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: ${props => props.centered && 'center'};
  font-weight: bold;

  ${breakpoints.sm} {
    text-align: center;
  }
`;

const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 !important;
  width: 100%;
`;

const CenteredContentWB = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 10px;
`;

const NoteSection = styled(Col)`
  font-size: 12px;
  opacity: .3;
  padding: 0 !important;
`;

const NoteHeading = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const ModalCloseIcon = styled.img`
  cursor: pointer;
  position: absolute;
  height: 18px;
  width: 18px;
  top: 10px;
  right: 10px;
`;

const ConfirmIcon = styled.img`
  height: 56px;
  width: 56px;
`;

const InfoIcon = styled.img`
  height: 20px;
  width: 20px;
  opacity: .3;
`;

const ConfirmMessage = styled.p`
  text-align: center;
  font-size: 14px;
  line-height: 17px;
  max-width: 254px;
`;

const StyledList = styled.ul`
  list-style-type: circle;
`;


const ListElement = styled.li`
  font-size: 14px;
  color: ${colors.sharkOpacity};

  ::before {
    content: '•';
    color: ${colors.sharkOpacity};
    font-weight: bold;
    display: inline-block;
    width: 5px;
  }
`;

const ColoredLine = ({ color }) => (
  <hr
    style={{
      color: color,
      backgroundColor: color,
      marginTop: 0,
      marginBottom: 10,
      opacity: .3,
    }}
  />
);

const buttonAbsolutePosition = {
  top: '1.5rem',
  right: '1.5rem',
  zIndex: 999
};
export class ChangeFrequencyModal extends React.Component {
  state = {
    frequency: this.props.subscription ? this.props.subscription.frequency : 0,
    isThanksVisible: false,
  };

  componentDidMount() {
    this.setState({
      frequency: FREQUENCY_OPTIONS[0],
    });
  }

  updateFrequency = selectedFrequency => {
    if (selectedFrequency) {
      this.setState({
        frequency: selectedFrequency.value,
      });
    }
  };

  showThanks = value => {
    this.setState({
      isThanksVisible: value,
    });
  };

  savePlanSettings = () => {
    const { subscription, updateSubscriptionRequest, toggleFrequencyModal } = this.props;
    const { frequency } = this.state;

    updateSubscriptionRequest({
      uuid: subscription.uuid,
      frequency: frequency,
      isActive: true,
    });

    this.props.resumePlan ? this.showThanks(true) : toggleFrequencyModal();
  };

  render() {
    const { isVisible, toggleFrequencyModal, resumePlan } = this.props;
    const frequencyOptions = FREQUENCY_OPTIONS.map(frequency => ({
      label: `Every ${frequency} Months`,
      value: frequency
    }));
    const selectedFrequency = frequencyOptions.find(option => option.value === this.state.frequency);

    return (
      <StyledModal
        isOpen={isVisible}
        onClosed={() => this.showThanks(false)}
      >
        <ModalHeader>
          <ModalCloseIcon
            src={cancelArrows}
            onClick={toggleFrequencyModal}
            style={buttonAbsolutePosition}
          />
        </ModalHeader>
        <ModalBody>
          {resumePlan && this.state.isThanksVisible ? (
            <React.Fragment>
              <CenteredContent>
                <ConfirmIcon src={confirmationIcon} />
              </CenteredContent>
              <CenteredContent>
                <OptionHeader centered>Your plan will restart</OptionHeader>
              </CenteredContent>
              <CenteredContent>
                <ConfirmMessage>
                  Your plan will restart and your order will be shipped within 5-7 business days.
                </ConfirmMessage>
              </CenteredContent>
              <CenteredContent>
                <BlueButton onClick={toggleFrequencyModal}>Got It</BlueButton>
              </CenteredContent>
            </React.Fragment>
          ) : (
              <React.Fragment>
                <CenteredContent>
                  <IconBackground>
                    <PlanIcon src={refillIcon} height={'29px'} width={'30px'} />
                  </IconBackground>
                </CenteredContent>
                <div>
                  <OptionHeader centered>Change Frequency</OptionHeader>
                </div>
                <div>
                  <CenteredContent>
                    <CustomSelect
                      placeholder='Select Frequency'
                      isClearable={false}
                      isSearchable={false}
                      options={frequencyOptions}
                      value={selectedFrequency}
                      onChange={this.updateFrequency}
                    />
                  </CenteredContent>
                </div>
                <div>
                  <CenteredContent style={{ paddingBottom: 10, paddingTop: 10 }}>
                    <BlueButton onClick={this.savePlanSettings}>
                      Save & Close
                </BlueButton>
                  </CenteredContent>
                </div>
                <div>
                  <CenteredContentWB>
                    <StyledList>
                      <ColoredLine color={colors.darkModerateBlue} />
                      <Row>
                        <Col xs="2" md="2">
                          <InfoIcon src={infoIcon} />
                        </Col>
                        <NoteSection xs="10" md="10">
                          <NoteHeading>Note: </NoteHeading>The frequency change takes effect after your next shipment.
                        </NoteSection>
                      </Row>
                    </StyledList>
                  </CenteredContentWB>
                </div>
              </React.Fragment>
            )}
        </ModalBody>
      </StyledModal>
    );
  }
}
