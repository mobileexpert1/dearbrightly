//import liraries
import React from 'react';
import smileyFace from 'src/assets/images/smileyFace.svg';
import { StandardBlueButton } from 'src/common/components/Buttons';
import styled from 'react-emotion';
import CustomModal from 'src/components/Modal';
import HorizontalLine from 'src/components/HorizontalLine';
import { breakpoints, colors, fontFamily } from 'src/variables';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';

const fontFamilyAndStyle = `
    font-family: ${fontFamily.baseFont};
    font-style: normal;
`

const SuccessMessage = styled.span`
  ${fontFamilyAndStyle}
  font-style: normal;
  font-weight: bold;
  font-size: 30px;
  line-height: 44px;
  text-align: center;
  margin-bottom: 30px;
`

const BottomPadding = styled.div`
  margin-bottom: 20px;
`

const SuccessModalContainer = styled.div`
  text-align: center;
  margin-top: 100px;
  ${breakpoints.lg} {
    margin-top: 50px;
  }
  ${breakpoints.xl} {
    margin-top: 50px;
  }
  height: 100%;
`

const Smiley = styled.img`
  text-align: center
`

const ButtonContainer = styled.div`
  ${breakpoints.xs} {
    margin: 20px auto auto;
    bottom: 0;
    position: absolute;
    left: 0;
    right: 0;
  }
`

const PaymentUpdateSuccessModal = (props) => {
  const { isMobile } = useDeviceDetect();
  return (
    <CustomModal onClose={props.onClose}>
      <SuccessModalContainer>
        <BottomPadding>
          <Smiley src={smileyFace} />
        </BottomPadding>
        <BottomPadding>
          <SuccessMessage>
            Your payment method is updated!
          </SuccessMessage>
        </BottomPadding>

        <ButtonContainer>
          {isMobile && (<HorizontalLine color={colors.whisper} style={{
            marginLeft: -20,
            marginRight: -20
          }} />)}
          <StandardBlueButton
            active={true}
            horizontalPadding={90}
            onClick={props.onClose}
            style={{
              marginTop: 30
            }}
          >
            Back to plan
          </StandardBlueButton>
        </ButtonContainer>

      </SuccessModalContainer>
    </CustomModal>
  );
};

export default PaymentUpdateSuccessModal;
