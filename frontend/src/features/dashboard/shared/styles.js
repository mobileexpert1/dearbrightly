import styled from 'react-emotion';
import { colors, breakpoints, fontSize, mobileFirstBreakpoints, fontFamily, fontWeight } from 'src/variables';

export const OtherLabel = styled.span`
  font-family: ${fontFamily.baseFont};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  opacity: 0.5;
`;

export const ModalTitle = styled.span`
  color: ${colors.veryDarkBlue} !important;
  padding-bottom: 30px;
  padding-top: 50px;
  font-style: normal;
  font-weight: bold;
  font-size: 30px;
  font-family: ${fontFamily.baseFont};
  line-height: 36px ${breakpoints.xs} {
    font-size: 20px;
    line-height: 28px;
  }
  ${breakpoints.sm} {
    font-size: 20px;
    line-height: 28px;
  }
`;
export const BoxContainer = styled.div`
  position: relative;
  background: ${colors.clear};
  border-radius: 4px;
  margin-bottom: 21px;
`;

export const AddToPlanBoxContainer = styled.div`
  position: relative;
  background: ${colors.aliceBlue};
  margin-bottom: 21px;
`;

export const BoxHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 17px 35px 17px;
  border-bottom: 1px solid ${colors.darkModerateBlueOpacity};
  background: ${colors.clear};
  ${breakpoints.sm} {
    padding: 17px 20px 17px;
  }
  align-items: center;
`;

export const TableHeaderWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.darkModerateBlueOpacity};
  background: ${colors.clear};
  align-items: center;
`;

export const BoxHeader = styled.p`
  font-size: ${fontSize.big};
  line-height: 29px;
  margin: 0;
  ${breakpoints.sm} {
    font-size: ${fontSize.normal} !important;
  }
`;

export const TableHeader = styled(BoxHeader)`
  padding: 3rem 0;
  margin-left: 3rem;
  font-weight: bold;
  color: #8b8b8b;
  ${breakpoints.sm} {
    margin-left: 1rem;
    padding: 0.5rem 0;
  }
  &.active {
    color: #1c4d86;
    border-bottom: currentColor solid 3px;
  }
  &:hover {
    cursor: pointer;
  }
`;

export const RxBadge = styled.span`
  background: #c55482;
  box-sizing: content-box;
  border-radius: 30px;
  font-weight: bold;
  font-size: 10px;
  color: white;
  text-align: center;
  line-height: ${props => (props.lineHeight? `${props.lineHeight}px`: '12px')};
  padding: ${props => (props.padding ? `${props.padding}` : '0.3em 0.6em')};
  margin-left: 8px;
  height: 12px;
  width: 16px;
`;

export const BoxContentWrapper = styled.div`
  padding: 18px 35px 18px;
  ${breakpoints.sm} {
    padding: 21px 16px 28px;
  }
`;

export const ProductName = styled.span`
  font-size: ${fontSize.large};
  line-height: 40px;
  color: ${colors.blumine};
  white-space: pre-wrap;
  ${breakpoints.xs} {
    font-size: ${fontSize.hugeMobile};
  }
`;

export const LightBlueButton = styled.button`
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: ${colors.facebookBlue};
  border: none;
  height: ${props => (props.height ? `${props.height}px` : '40px')};
  width: ${props => {
    return props.width ? props.width : 'fit-content';
  }};
  max-width: ${props => {
    return props.width ? props.width : 'fit-content';
  }};
  padding-left: 21px;
  padding-right: 21px;
  border-radius: 4px;
  background-color: ${colors.indigoWhite};
  line-height: 13px;
  border: none;
  margin-left: ${props => props.extraMargin && !props.isOpenInModal && '10px'};
  text-decoration: underline;
  :hover {
    color: ${colors.facebookBlue};
    background-color: ${colors.indigoWhite};
  }

  :disabled {
    background-color: #f0f0f0;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 8px;
    color: rgba(59, 89, 152, 0.5);
  }

  ${breakpoints.xs} {
    width: 50vw;
  }

  ${mobileFirstBreakpoints.sm} {
    margin-right: ${props => props.extraMarginRight && '1rem'};
  }
`;

export const BlueButton = styled.button`
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: ${props => (props.backBtn || props.invertColors ? colors.shark : colors.white)};
  border: ${props => props.backBtn && 'none'};
  height: ${props => (props.height ? `${props.height}px` : '40px')};
  width: ${props => {
    return props.width ? props.width : 'fit-content';
  }};
  max-width: ${props => {
    return props.width ? props.width : 'fit-content';
  }};
  padding-left: 21px;
  padding-right: 21px;
  border-radius: 4px;
  background-color: ${props =>
    props.backBtn || props.invertColors ? colors.clear : colors.facebookBlue};
  line-height: 13px;
  border: none;
  margin-left: ${props => props.marginLeft ? props.marginLeft : 0};
  margin-right: ${props => props.marginRight ? props.marginRight : 0};

  :hover {
    color: ${props => (props.backBtn || props.invertColors ? colors.chambray : colors.white)};
    background-color: ${props =>
      props.backBtn || props.invertColors ? colors.clearDarker : colors.facebookBlue};
  }

  :disabled {
    background-color: #f0f0f0;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 8px;
    color: rgba(59, 89, 152, 0.5);
  }

  ${breakpoints.xs} {
    width: 50vw;
  }

  ${mobileFirstBreakpoints.sm} {
    margin-right: ${props => props.extraMarginRight && '1rem'};
  }
`;

export const PlanStatusWrapper = styled.div`
  display: flex;
`;

export const PlanStatus = styled.span`
  font-size: ${fontSize.normal};
  margin: auto 10px;
  height: fit-content;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
`;

export const PlanStatusIndicatorWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  background: ${props => props.color};
  border-radius: 50%;
  margin: auto;
`;

export const PlanStatusIndicator = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  background: ${props => props.color};
  border-radius: 50%;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const UploadPhotoButton = styled.a`
  display: flex;
  width: ${props =>
    props.isUploadOptional
      ? props.isMobile
        ? '100%'
        : '187'
      : props.isPhotoEditView
        ? '130px'
        : props.isMobile
          ? '100%'
          : '187'};
  height: 55px;
  border-radius: 4px;
  background: ${colors.chambray};
  border: ${props => (props.invertColors ? `1px solid ${colors.chambray}` : `none`)};
  color: ${props => (props.invertColors || props.isUploadOptional ? colors.chambray : colors.remy)};
  font-weight: bold;

  :hover {
    text-decoration: none;
    color: ${props =>
      props.invertColors || props.isUploadOptional ? colors.chambray : colors.remy};
    background-color: ${props => {
      if (props.invertColors) {
        return colors.gallery;
      }
      if (props.isUploadOptional) {
        return colors.questionBorder;
      }
      return colors.blumineLight;
    }};
  }

  ${breakpoints.xs} {
    margin: 0;
  }
`;

export const UploadButtonInner = styled.span`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.white};
`;

export const UploadButtonIcon = styled.img`
  width: 23px;
  height: 23px;
  margin-right: 10px;
  margin-bottom: 5px;
`;

export const ButtonInnerWrapper = styled.div`
  margin: auto;
  padding: 0 20px 0 20px;
`;

export const AnswerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.darkModerateBlueOpacity};
  padding: 24px 35px 24px 35px;
  position: relative;

  ${breakpoints.sm} {
    flex-direction: column;
    padding: 24px 20px 19px 20px;
  }
`;

export const QuestionTitle = styled.p`
  margin: 0;
  width: 65%;
  font-size: ${fontSize.normal};
  color: ${colors.blumine};
  padding-right: 20px;
`;

export const AnswerContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AnswerLabelsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  ${breakpoints.xs} {
    margin-top: 0.5rem;
    flex-direction: column;
  }
`;

export const AnswerAndIconWrapper = styled.div`
  display: flex;
`;

export const Answer = styled.p`
  text-align: right;
  font-size: ${fontSize.normal};
  margin-right: 1rem;
  line-height: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  ${breakpoints.sm} {
    width: 100%;
    text-align: left;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
`;

export const OpenAndCloseIcon = styled.svg`
  background-image:  url('${props => props.iconSrc}') ;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  overflow: initial !important;
  cursor: pointer;
  margin-left: ${props => props.extraMargin && '1rem'};


  ${breakpoints.xs} {
    position: absolute;
    top: 2rem;
    right: 2rem;
  }
`;

export const AnswerInputsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;

  ${breakpoints.xs} {
    justify-content: flex-start;
  }
`;

export const UserInputWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;

  ${breakpoints.xs} {
    justify-content: flex-start;
  }
`;

export const InputAnswer = styled.p`
  font-size: ${fontSize.normal};
  margin-top: 1rem;
  margin-bottom: 0;
  text-align: end;

  ${breakpoints.xs} {
    margin-top: 0.5rem;
    flex-direction: column;
    text-align: start;
  }
`;

export const ComponentHeader = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.huge};
  color: ${colors.blumine};
  line-height: 33px;

  ${breakpoints.xs} {
    font-size: ${fontSize.hugeMobile};
  }
`;

export const ComponentSubheading = styled.p`
  font-size: ${fontSize.small};
  max-width: 28rem;
  line-height: 23px;
  font-weight: ${props => (props.isBold ? fontWeight.bold : fontWeight.regular)};
  font-family: ${fontFamily.baseFont};
  color: ${props => (props.darkBlue ? colors.blumine : '')};
`;

export const ComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${props => (props.extraTopMargin ? '4rem' : '1rem')};
  padding-bottom: ${props => (props.extraBottomMargin ? '4rem' : '1rem')};

  ${breakpoints.xs} {
    padding-top: 4rem;
  }

  * {
    font-family: ${fontFamily.baseFont};
  }
`;

export const ColumnsWrapper = styled.div`
  display: flex;
  margin-top: 2rem;
  justify-content: ${props => (props.wrapContent ? 'flex-start' : 'space-between')};
  flex-wrap: ${props => props.wrapContent && 'wrap'};

  ${breakpoints.sm} {
    flex-direction: ${props => props.wrapOnMobile && 'column'};
  }

  ${breakpoints.xs} {
    margin: 2rem 0;
    flex-direction: column;
  }
`;

export const SeparateLine = styled.div`
  height: 12rem;
  border-left: 1px solid ${colors.remy};
  margin: auto 1rem;

  :last-of-type {
    display: none;
  }

  ${breakpoints.xs} {
    border-left: none;
    border-top: 1px solid ${colors.remy};
    height: 1px;
    margin: 0 1rem 1rem;
  }
`;

export const ContentHeader = styled.p`
  font-size: ${props => (props.smallText ? fontSize.normal : fontSize.big)};
  font-weight: 800;
  margin-bottom: ${props => (props.noMargin ? 0 : '0.5rem')};
  color: ${props => props.color};
`;

export const ContentSubheading = styled.p`
  font-size: ${fontSize.small};
  font-family: ${fontFamily.baseFont};
  font-weight: ${props => (props.isBold ? fontWeight.bold : fontWeight.regular)};
  color: ${props => (props.darkBlue ? colors.blumine : '')};
  line-height: 26px;
  max-width: 26rem;
  text-align: ${props => (props.justify ? 'justify' : '')};
`;

export const BlueContentHeader = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.biggest};
  color: ${colors.blumine};
  ${breakpoints.xs} {
    font-size: ${fontSize.big};
  }
`;

export const SingleColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.narrowColumn && '18rem'};
  margin-right: ${(props => props.narrowColumn || props.extraMarginRight) && '2rem'};

  ${breakpoints.sm} {
    margin-top: ${props => props.extraMarginTop && '2rem'};
    margin-right: auto;
  }
  ${breakpoints.xs} {
    width: auto;
    margin-right: 0;
  }
`;

export const ColumnHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${props => (props.noBottomMargin ? 0 : '1.5rem')};
`;

export const StepNumber = styled.p`
  font-size: ${fontSize.huge};
  color: ${colors.blumine};
  font-family: ${fontFamily.baseFont};
  margin-top: 1rem;
  margin-bottom: 0;
`;

export const ContentIcon = styled.img`
  width: 1.2rem;
  height: 1.2rem;
  margin-left: 0.5rem;
`;
