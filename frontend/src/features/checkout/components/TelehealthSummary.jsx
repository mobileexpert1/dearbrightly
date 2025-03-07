import React from 'react';
import styled, { css } from 'react-emotion';
import { colors, breakpoints, fontFamily } from 'src/variables';
import Mask_1 from 'src/assets/images/mask_1.png';
import Mask_2 from 'src/assets/images/mask_2.png';
import car from 'src/assets/images/car.png';
import logo_small from 'src/assets/images/logo_small_blue.png';
import pad from 'src/assets/images/pad.png';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { withIsMobile } from 'src/common/hooks/withIsMobile';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { TelehealthConsent } from './TelehealthConsent';


const PageContainer = styled.div`
  font-family: ${fontFamily.baseFont};
  background-color: #fff;
  display: flex;
  flex-direction: row;
  max-width: 1054px;
  min-height: 268px;
  padding-top: 100px;
  overflow: auto;
  margin: 0 auto;

  ${breakpoints.sm} {
    width: 100%;
    height: 92%;
    min-height: 268px;
    padding-top: 0px; 
  }
  ${breakpoints.lg} {  
    flex-direction: column;
    margin: 0 auto;
  }  
`;

const TextButtonContainer = styled('div')`
  margin: 0 auto;
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding-left: 30px; 
  ${breakpoints.md} {  
    padding-left: 0px; 
  }  
`;

const ImageContainer = styled('div')`
  margin: 0 auto;
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const TextContainer = styled('div')`
  margin: 0 auto;
  align-items: left;
  display: flex;
  flex-direction: column;
  max-height: 450px;
  overflow-y: auto;  
  @media (max-height: 700px) {
    overflow-y: scroll;  
    min-height: 0;
    height: 329px;
  }  
`;

const ContentHeader = styled.p`
  text-align: center;
  font-size: 40px;
  line-height: 42px;
  color: ${colors.black};
  max-width: 693px;
  padding-top: 20px;  
  padding-bottom: 30px;
  ${breakpoints.xs} {
    line-height: 32px;
    font-size: 30px;
    padding: 10px;
  }
`;

const MaskOne = styled.div`
    background-image: url(${Mask_1});
    background-repeat: no-repeat;
    background-size: 100%;
    width: 315px;
    height: 450px;
    
    ${breakpoints.lg} {
      width: 200px;
      height: 250px;
    } 
    @media (max-height:568px){
      width: 175px;
      height: 175px;
    }     
`

const MaskTwo = styled.div`
    background-image: url(${Mask_2});
    background-repeat: no-repeat;
    background-size: 100%;
    width: 315px;
    height: 450px;

    ${breakpoints.lg} {
      width: 200px;
      height: 250px;
    } 
    @media (max-height:568px){
      width: 175px;
      height: 175px;
    }    
`

const checkBoxWrapperStyles = css`
  margin: 50px auto
`

const BulletPoint = ({image, text, isMobile}) => {
  return (
      <Row style={{
        margin: 0,
        padding: 0,
        flex: 0
      }}>
        <Col xs={1} style={{
          padding: 0,
          textAlign: "right",
          paddingTop: isMobile ? "12px" : 0
        }}>
          <div>
            <img style={{height: 24, width: 24}} src={image} />
          </div>
        </Col>
        <Col>
          <div style={{
            color: colors.facebookBlue,
            fontSize: 14
          }}>
            {text}
          </div>
        </Col>
      </Row>
  )
}


class TelehealthSummary extends React.Component {
  state = {
    isChecked: false,
  };

  componentDidMount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onChange = () => {
    this.setState({
      isChecked: !this.state.isChecked,
    });
  };

  handleButtonClick = () => {
    this.props.submitConsent();
  };

  render() {
    return (
        <PageContainer id={"page-container"}>
          <ImageContainer id={"image-container"}>
            <MaskOne />
            <MaskTwo />
          </ImageContainer>
          <TextButtonContainer id={"text-button-container"}>
            <TextContainer id={"text-container"}>
              <ContentHeader>
                Let's get skin deep{' '}
              </ContentHeader>
              <BulletPoint isMobile={this.props.isMobile} image={logo_small} text={"Create your Skin Profile and answer questions about your skin"} />
              <div style={{marginTop: 20}}>
                <BulletPoint isMobile={this.props.isMobile} image={pad} text={"Once submitted, your provider will review it and tailor your Night Shift formula"} />
              </div>
              <div style={{marginTop: 20}}>
                <BulletPoint isMobile={this.props.isMobile} image={car} text={"Get your tailored Night Shift formula delivered to you, for free"} />
              </div>
              <TelehealthConsent onChange={this.onChange} wrapperStyles={checkBoxWrapperStyles} />
            </TextContainer>
            <BottomNav
                currentCheckoutStepName={"telehealth-consent"}
                backButtonType={"arrow"}
                backButtonTitle={"Back"}
                disableBackButton={true}
                disableNextButton={!this.state.isChecked}
                hideNextButtonArrow={false}
                hideBackButton={true}
                nextButtonClick={this.handleButtonClick}
                nextTitle={'Start Skin Profile'}
            />
          </TextButtonContainer>
        </PageContainer>
    );
  }
}

export default withIsMobile(TelehealthSummary);