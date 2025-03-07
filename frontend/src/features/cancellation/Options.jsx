import React, { Component } from 'react';
import CustomModal from 'src/components/Modal';
import styled from 'react-emotion';
import { breakpoints, colors, fontFamily } from 'src/variables';
import { Col, Row } from 'reactstrap';
import checkBlue from 'src/assets/images/checkBlue.svg';
import { StandardBlueButton, StandardOutlineBlueButton } from 'src/common/components/Buttons';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import HorizontalLine from 'src/components/HorizontalLine';
import { ModalTitle } from '../dashboard/shared/styles';
const Content = styled.div`
  margin: 20px 0px;
`
const Text = styled.span`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  color: ${colors.veryDarkGray};
`

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


const Item = ({ text }) => {
  return (
    <Row>
      <Col xs={1}>
        <img src={checkBlue} />
      </Col>
      <Col>
        <Text>{text}</Text>
      </Col>
    </Row>
  )
}
const Options = (props) => {
  const { isMobile } = useDeviceDetect();

  return (
    <div>
      <div style={{
        marginTop: isMobile ? 90 : 30,
      }}>
        <ModalTitle>Update your plan status</ModalTitle>
      </div>
      <div>
        <Content>
          <Text>
            Would you like to keep an active plan and pause or cancel your plan? Keep in mind, with an active plan, you’ll continue to get:
          </Text>
        </Content>

        <Content>
          <Item text={"your tailored retinoid serums delivered to you"} />
        </Content>

        <Content>
          <Item text={"access to message your provider"} />
        </Content>

        <Content>
          <Item text={"support materials for active members only"} />
        </Content>
      </div>
      <Content>
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
          <Row className={isMobile ? "" : "mt-5"}>
            <Col xs={12} sm={12} xl={6} lg={6}>
              <StandardOutlineBlueButton
                onClick={() => {
                  props.onOptionSelected(1)
                }}
                maxWidth={isMobile ? '100%' : null}
                horizontalPadding={isMobile ? 10 : 40}
                active={true}>
                Cancel plan
              </StandardOutlineBlueButton>
            </Col>
            <Col xs={12} sm={12} xl={6} lg={6} className={isMobile ? "mt-2" : "text-right"}>
              <StandardBlueButton
                onClick={() => {
                  props.onOptionSelected(2)
                }}
                maxWidth={isMobile ? '100%' : null}
                horizontalPadding={isMobile ? 10 : 40}
                active={true}>
                Pause plan
              </StandardBlueButton>
            </Col>
          </Row>
        </ButtonContainer>
      </Content>
    </div>
  );
};

export default Options;
