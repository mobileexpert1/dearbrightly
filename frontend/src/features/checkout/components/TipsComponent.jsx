import React from 'react';
import styled from 'react-emotion';

import { colors, breakpoints } from 'src/variables';

const TipsWrapper = styled.div`
  flex-basis: 100%;
  flex: 1;

  ${breakpoints.sm} {
    display: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 184px;
  margin-left: 45px;

  ${breakpoints.lg} {
    margin-left: 35px;
  }

  ${breakpoints.md} {
    margin-left: 25px;
  }
`;

const TipsHeader = styled.p`
  font-size: 24px;
  line-height: 29px;
  color: ${colors.blumine};
`;

const TipsContent = styled.p`
  font-size: 14px;
  line-height: 17px;
`;

export const TipsComponent = () => (
  <TipsWrapper>
    <ContentWrapper>
      <TipsHeader>Tips:</TipsHeader>
      <TipsContent>- Take it where it's well-lit so it's easy to see your skin.</TipsContent>
      <TipsContent>- Fill the entire screen with your face.</TipsContent>
      <TipsContent>- Remember, your Skin Profile is secure and confidential.</TipsContent>
    </ContentWrapper>
  </TipsWrapper>
);
