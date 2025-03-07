import React from 'react';
import styled from 'react-emotion';
import { Container } from 'reactstrap';
import { history } from 'src/history';
import { BlueButton } from 'src/features/dashboard/shared/styles';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { colors, breakpoints, fontSize } from 'src/variables';
const DEBUG = getEnvValue('DEBUG');
import { sharingEntryPointOptions } from 'src/features/sharingProgram/constants/sharingProgramConstants';
import { saveIfEmpty } from 'src/common/helpers/localStorage';
import { NextStepsSection } from 'src/features/checkout/components/NextStepsSection';
import dbStarCluster from 'src/assets/images/dbStarCluster.svg';


const DbStarClusterIcon = styled.img`
  height: 139px;
  width: 178px;
  padding: 20px 0;
`;

const Wrapper = styled('div')`
  margin: 150px auto;

  ${breakpoints.sm} {
    margin: 0 auto;
    height: fit-content;
  }
`;

const TextContainer = styled.div`
  padding-bottom: 20px;
`;

const ThanksContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 10px 20px 10px;
  text-align: center;
`;

const ThanksText = styled.p`
  font-size: 24px;
  line-height: 28px;
  color: ${colors.blumine};
  font-weight: bold;
`;

const ThanksSubText = styled.p`
  font-size: 18px;
  line-height: 22px;
  color: ${colors.blumine};
  ${breakpoints.sm} {
    font-size: 16px;
    line-height: 20px;
  }
`;

const UserDashboardLink = styled.p`
  cursor: pointer;
  font-size: ${fontSize.small};
  color: ${colors.blumine};
  line-height: 17px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  text-decoration: underline;

  ${breakpoints.sm} {
    margin-right: 0;
  }
`;


export default class OrderConfirmationContainer extends React.Component {
  componentDidMount() {
    sessionStorage.removeItem('gtmCheckoutEvents');
  }

  goToSharingPage = () => {
    if (typeof this.props.toggleCart !== 'undefined') {
      this.props.toggleCart();
    }
    saveIfEmpty('sp_ep', sharingEntryPointOptions.orderConfirmation)
    history.push('/sharing-program');
  };

  goToUserDashboardPage = () => {
    if (typeof this.props.toggleCart !== 'undefined') {
      this.props.toggleCart();
    }
    history.push('/user-dashboard');
  };

  render() {
    return (
      <Wrapper
        ref={section => {
          this.componentTop = section;
        }}
      >
        <Container>
          <ThanksContainer>
            <DbStarClusterIcon src={dbStarCluster} />
            {this.props.isRxOrder ? (
              <TextContainer>
                <ThanksText>You’re good to glow! Your provider will be in touch soon.</ThanksText>
              </TextContainer>
            ) : (
              <TextContainer>
                <ThanksText>Thanks for your order.</ThanksText>
                <ThanksSubText>Expect your order to be delivered in 5-7 business days.</ThanksSubText>
              </TextContainer>
              )}
            <BlueButton fontSize={'14px'} onClick={this.goToSharingPage}>
              Refer a friend
            </BlueButton>
            <UserDashboardLink onClick={this.goToUserDashboardPage}>
              View your dashboard
            </UserDashboardLink>
          </ThanksContainer>
          {this.props.isRxOrder && <NextStepsSection/>}
        </Container>
      </Wrapper>
    );
  }
}
