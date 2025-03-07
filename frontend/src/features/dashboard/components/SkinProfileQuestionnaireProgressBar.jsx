import React from 'react';
import styled from 'react-emotion';
import { history } from 'src/history';
import { colors, breakpoints, fontSize } from 'src/variables';

const NotificationContainer = styled.div`
  position: relative;
  background: ${colors.whiteSmokeOpacity};
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  height: fit-content;
  ${breakpoints.xs} {
    flex-direction: column;
  }
`;

const NotificationMessage = styled.p`
  padding: ${props => (props.noPadding ? '14px 10px 15px' : '14px 32px 15px')};
  font-size: ${fontSize.medium};
  line-height: 22px;
  margin: 0;
  z-index: 1;
  ${breakpoints.xs} {
    width: ${props => !props.noPadding && '200px'};
    padding: ${props => (props.noPadding ? '14px 10px 15px' : '14px 0px 15px 19px')};
  }
`;

const NotificationMarker = styled.div`
  position: absolute;
  height: 100%;
  width: 5px;
  background: ${props => (props.isComplete ? colors.darkModerateBlue : colors.mulberry)};
  border-radius: 6px 0px 0px 6px;
`;

const NotificationButton = styled.button`
  cursor: pointer;
  width: 137px;
  height: 40px;
  background: ${colors.mulberryOpacity};
  border-radius: 4px;
  margin: 6px 10px;
  border: none;
  color: ${colors.mulberry};
  z-index: 1;
  ${breakpoints.xs} {
    margin-left: 19px;
  }
  :hover {
    background: ${colors.mulberry};
    color: ${colors.clear};
  }
`;

const ButtonText = styled.span`
  text-transform: uppercase;
  font-size: ${fontSize.small};
  font-weight: 600;
  z-index: 1;
`;

const ProgressFill = styled.div`
  position: absolute;
  width: ${props => `${props.width}%`};
  background: ${props => (props.isComplete ? colors.blackSqueeze : colors.lightGrayishRed)};
  height: 100%;
  z-index: 0;
  border-radius: 4px;
`;

const MessageWrapper = styled.div`
  display: flex;
`;

export const SkinProfileQuestionnaireProgressBar =
  ({
     currentQuestionnaireStep,
     questionsLength,
     visitSkinProfileComplete
   }) => {
    const goToPage = (option, page, e) => {
      e.preventDefault();
      history.push(page, option);
    };

    const progressPercentage = Number(((currentQuestionnaireStep * 100) / questionsLength).toFixed(0));
    const isComplete = visitSkinProfileComplete || Number(currentQuestionnaireStep) === 10;

    return (
      <NotificationContainer>
        <ProgressFill isComplete={isComplete} width={isComplete ? 100 : progressPercentage} />
        <NotificationMarker isComplete={isComplete} />
        <MessageWrapper>
          {isComplete ? (
            <NotificationMessage>Skin Profile Complete</NotificationMessage>
          ) : (
            <React.Fragment>
              <NotificationMessage>Skin Profile Questionnaire Incomplete</NotificationMessage>
              {/*<NotificationMessage>*/}
              {/*  {currentQuestionnaireStep} / {questionsLength}*/}
              {/*</NotificationMessage>*/}
            </React.Fragment>
          )}
        </MessageWrapper>
        {!isComplete && (
          <NotificationButton
            onClick={e => goToPage('continue', '/user-dashboard/skin-profile', e, 'Action button')}
          >
            <ButtonText>Continue</ButtonText>
          </NotificationButton>
        )}
      </NotificationContainer>
    );
  };
