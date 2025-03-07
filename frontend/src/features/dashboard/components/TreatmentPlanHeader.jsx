import React from 'react';
import styled from 'react-emotion';
import { breakpoints, colors, fontSize, fontFamily } from 'src/variables';
import defaultAvatarIcon from 'src/assets/images/defaultAvatar.svg';

const treatmentImage = 'https://d17yyftwrkmnyz.cloudfront.net/DearBrightly_0855-reversed.jpg';

const ComponentWrapper = styled.div`
  display: flex;
  margin-bottom: 2rem;

  * {
    font-family: ${fontFamily.baseFont};
  }

  ${breakpoints.sm} {
    flex-direction: column-reverse;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-basis: 100%;
  flex: 1;
  flex-direction: column;
  height: fit-content;
  margin: auto 95px;

  ${breakpoints.xs} {
    margin: 1rem;
    margin-top: 30px;
  }
`;

const TreatmentImage = styled.img`
  max-height: 26.1rem;
  margin-right: 0.7rem;

  ${breakpoints.md} {
    width: auto;
  }

  ${breakpoints.sm} {
    margin: auto;
  }

  ${breakpoints.xs} {
    max-height: 20rem;
    object-fit: contain;
    width: 100%;
  }
`;

const Header = styled.p`
  font-size: ${fontSize.header};
  line-height: 45px;
  margin-bottom: 0;
  font-family: ${fontFamily.baseFont};
  color: ${colors.blumine};
`;

const Content = styled.p`
  font-size: ${fontSize.medium};
  line-height: 26px;
  margin-top: 1rem;
  margin-bottom: 2rem;
  text-align: justify;
`;

const MedicalProvider = styled.div`
  position: absolute;
  top: 4rem;
  right: 1rem;
  font-size: 13px;
  color: ${colors.black};

  @media (max-width: 1024px) {
    position: static;
    display: flex;
  }
`;

const MedicalProviderAvatar = styled.img`
  margin-left: 1rem;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  object-fit: cover;
`;

export const TreatmentPlanHeader = ({ userFirstName, user }) => {
  const doctorName = user && user.medicalProvider && user.medicalProvider.fullName;
  const medicalProviderAvatar =
    user && user.medicalProvider && user.medicalProvider.profilePhotoFile
      ? user.medicalProvider.profilePhotoFile
      : defaultAvatarIcon;
  return (
    <ComponentWrapper extraTopMargin>
      <TreatmentImage src={treatmentImage} />
      <ContentWrapper>
        <MedicalProvider>
          {doctorName || ''}
          <MedicalProviderAvatar src={medicalProviderAvatar} />
        </MedicalProvider>
        <Header>
          {userFirstName}
          's
        </Header>
        <Header>Treatment Plan</Header>
        <Content>
          <strong>Wow, think about it:</strong> You’re on a self-care journey with your skin, giving
          it exactly what it needs. We can’t wait to see all the benefits you’ll experience with
          your derm-grade retinoid.
        </Content>
      </ContentWrapper>
    </ComponentWrapper>
  );
};
