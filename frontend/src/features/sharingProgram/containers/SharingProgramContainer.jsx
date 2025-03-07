import React from 'react';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { Helmet } from 'react-helmet';

import megaphoneIcon from 'src/assets/images/megaphoneIcon.svg';
import { saveIfEmpty } from 'src/common/helpers/localStorage';
import { colors, breakpoints, fontSize } from 'src/variables';
import { isMobileDevice } from 'src/common/helpers/isMobileDevice';
import { scrollToTop } from 'src/common/helpers/scrollToTop';
import { redirectToUrl } from 'src/common/actions/navigationActions';

import {
  getSharingProgramCodeRequest,
  resetGeneratedCode,
  sharingProgramEmailRequest,
} from 'src/features/sharingProgram/actions/sharingProgramActions';
import {
  getReferralCodes,
  getSharingReferrerEmail,
  getIsEmailSent,
  getIsGenerated,
  getEmailPending,
  getEmailError,
} from 'src/features/sharingProgram/selectors/sharingProgramSelectors';
import {
  communicationMethodsOptions,
  sharingEntryPointOptions,
  sharingProgramTitle,
  mobileFbMessengerLink,
} from 'src/features/sharingProgram/constants/sharingProgramConstants';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import * as selectors from 'src/features/auth/selectors/authenticationSelectors';
import { EmailShare } from 'src/features/sharingProgram/components/EmailShare';
import { MessengerShare } from 'src/features/sharingProgram/components/MessengerShare';
import { CopyShare } from 'src/features/sharingProgram/components/CopyShare';
import { loadFbApi } from 'src/common/helpers/fbInit';
import { setSharingReferrerEmail } from 'src/features/sharingProgram/actions/sharingProgramActions';
import {
  getQueryVariable,
  isSafariBrowser,
  emailContent,
  facebookDialog,
} from 'src/features/sharingProgram/helpers/sharingHelpers';
import { MoreOptionsShare } from 'src/features/sharingProgram/components/MoreOptionsShare';

const PageWrapper = styled.div`
  background-color: ${colors.clear};
  background-size: cover;
  max-height: 42rem;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  overflow: initial;
  display: flex;
  justify-content: center;

  ${breakpoints.xs} {
    background-size: contain;
    background-repeat: repeat;
    background-position: inherit;
    margin-bottom: 3rem;
  }
`;

const InviteFormWrapper = styled.div`
  margin-top: 3rem;
  border-radius: 27px;
  background-color: ${colors.clear};
  width: 569px;
  height: 593px;
  display: flex;
  justify-content: center;
  text-align: center;
  padding: 2rem 2.4rem;

  ${breakpoints.xs} {
    margin-top: 1rem;
    padding: 1.4rem 0.75rem 2rem;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const InviteFormContentWrapper = styled.div`
  width: 100%;
`;

const MegaphoneIcon = styled.img`
  width: 55px;
  height: 65px;
  margin-bottom: 20px;
`;

const InviteHeading = styled.p`
  font-size: ${fontSize.hugeMobile};
  line-height: 36px;
  max-width: 285px;
  margin: 0 auto 10px;
  font-weight: 800;
`;

const InviteSubheading = styled.p`
  font-size: ${fontSize.big};
  line-height: 30px;

  ${breakpoints.xs} {
    font-size: ${fontSize.normal};
    line-height: 20px;
    padding: 15px;
  }  
`;

const AdditionalContent = styled.p`
  font-size: ${fontSize.normal};
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const ShareMethodsWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.isMobile && 'space-around'};
  flex-direction: ${props => !props.isMobile && 'column'};
  margin-top: ${props => props.isMobile && '3rem'};
`;

const Wrapper = styled.div`
  display: ${props => (props.isMobile ? 'contents' : 'flex')};
`;

const initialState = {
  fbLink: '',
  fbCode: '',
  sharingPageURL: window.location.origin + '/invite/',
  isCopied: false,
  emailSent: false,
  emailSentFailed: false,
  isFbMessengerOptionClicked: false,
  isMoreOptionClicked: false,
  isEmailOptionClicked: false,
};

class SharingProgramContainer extends React.Component {
  state = initialState;

  componentDidMount() {
    const { setSharingReferrerEmail } = this.props;

    loadFbApi();
    scrollToTop();

    const referrerEmailQueryVariable = getQueryVariable('re');
    if (referrerEmailQueryVariable) {
      setSharingReferrerEmail(referrerEmailQueryVariable);
    }

    const entryPointQueryVariable = getQueryVariable('ep');
    if (entryPointQueryVariable) {
      saveIfEmpty('sp_ep', parseInt(entryPointQueryVariable, 10));
    }

    const entryPoint = parseInt(localStorage.getItem('sp_ep'), 10);
    const emailTypeQueryVariable = getQueryVariable('et');
    if (emailTypeQueryVariable && entryPoint === sharingEntryPointOptions.email) {
      saveIfEmpty('sp_et', emailTypeQueryVariable);
    }

    const emailReminderIntervalQueryVariable = getQueryVariable('i');
    if (emailReminderIntervalQueryVariable && entryPoint === sharingEntryPointOptions.email) {
      saveIfEmpty('sp_i', emailReminderIntervalQueryVariable);
    }

    this.getSharingProgramCode(communicationMethodsOptions.copy);
  }

  componentDidUpdate(prevProps, prevState) {
    const { fbSharingCode, user, sharingReferrerEmail, isEmailSent, emailError } = this.props;
    const { sharingPageURL } = this.state;

    if (prevProps.fbSharingCode !== fbSharingCode) {
      this.setState({
        fbCode: fbSharingCode,
        fbLink: sharingPageURL + fbSharingCode,
      });
    }

    if (
      (!prevProps.user && user && user.id) ||
      (!prevProps.sharingReferrerEmail && sharingReferrerEmail)
    ) {
      this.getSharingProgramCode(communicationMethodsOptions.copy);
    }

    if (prevProps.isEmailSent !== isEmailSent) {
      this.setState({ emailSent: !this.emailSent });
      setTimeout(() => this.setState({ emailSent: false }), 2000);
    }

    if (prevProps.emailError !== emailError) {
      this.setState({ emailSentFailed: !this.emailSentFailed });
      setTimeout(() => this.setState({ emailSentFailed: false }), 2000);
    }
  }

  copyCodeToClipboard = () => {
    const el = this.textArea;
    el.select();
    document.execCommand('copy');
    this.setState({ isCopied: !this.isCopied });
    setTimeout(() => this.setState({ isCopied: false }), 1000);
  };

  mobileCopyCodeToClipboard = copyLink => {
    const container = document.getElementById('mobileCopyWrapper');
    const inp = document.createElement('input');
    inp.type = 'text';
    container.appendChild(inp);
    inp.value = copyLink;
    inp.select();
    document.execCommand('Copy');
    container.removeChild(container.lastChild);
    this.setState({ isCopied: !this.isCopied });
    setTimeout(() => this.setState({ isCopied: false }), 1000);
  };

  sendInvitation = email => {
    const { sharingProgramEmailRequest } = this.props;

    const entryPoint = localStorage.getItem('sp_ep');
    const sharingEmailType = localStorage.getItem('sp_et');
    const sharingEmailReminderIntervalInDays = localStorage.getItem('sp_i');

    sharingProgramEmailRequest(
      email,
      entryPoint,
      sharingEmailType,
      sharingEmailReminderIntervalInDays,
    );
  };

  getSharingProgramCode = communicationMethod => {
    const { getSharingProgramCodeRequest, sharingReferrerEmail } = this.props;

    const entryPoint = localStorage.getItem('sp_ep');
    const sharingEmailType = localStorage.getItem('sp_et');
    const sharingEmailReminderIntervalInDays = localStorage.getItem('sp_i');

    getSharingProgramCodeRequest(
      entryPoint,
      communicationMethod,
      sharingEmailType,
      sharingEmailReminderIntervalInDays,
      sharingReferrerEmail,
    );
  };

  handleShareButton = shareLink => {
    navigator.share({
      title: sharingProgramTitle,
      text: sharingProgramTitle,
      url: shareLink,
    });
  };

  handleMobileShare = (communicationMethod, triggeredOption) => {
    this.getSharingProgramCode(communicationMethod);
    this.setState({
      [triggeredOption]: true,
    });
    setTimeout(() => this.setState({ [triggeredOption]: false }), 1000);
  };

  createMobileMail = code => {
    const { user } = this.props;
    const mail = emailContent(code, user && user.firstName);
    const a = document.createElement('a');
    a.href = mail;
    a.click();
  };

  render() {
    const {
      sharingPageURL,
      isCopied,
      emailSent,
      emailSentFailed,
      isFbMessengerOptionClicked,
      isMoreOptionClicked,
      isEmailOptionClicked,
      fbLink,
    } = this.state;
    const {
      isGenerated,
      resetGeneratedCode,
      copySharingCode,
      moreSharingCode,
      emailSharingCode,
      isEmailPending,
      isAuthenticated,
    } = this.props;

    const isMobile = isMobileDevice();
    const copyLink = sharingPageURL + copySharingCode;
    const moreLink = sharingPageURL + moreSharingCode;
    const emailLink = sharingPageURL + emailSharingCode;
    const isMobileFbMessengerCodeGenerated =
      isGenerated && isFbMessengerOptionClicked && !isEmpty(this.state.fbLink);
    const isDesktopFbMessengerCodeGenerated = isGenerated && !isEmpty(this.state.fbLink);

    isMobile
      ? isMobileFbMessengerCodeGenerated &&
        (window.location = mobileFbMessengerLink + this.state.fbLink)
      : isDesktopFbMessengerCodeGenerated && facebookDialog(fbLink, resetGeneratedCode);

    isMoreOptionClicked && !isEmpty(moreSharingCode) && this.handleShareButton(moreLink);
    isEmailOptionClicked && !isEmpty(emailSharingCode) && this.createMobileMail(emailLink);

    return (
      <React.Fragment>
        <Helmet>
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.dearbrightly.com/sharing-program" />
          <meta
            property="og:title"
            content="Have you noticed my skin lately? It’s thanks to Dear Brightly."
          />
          <meta
            property="og:description"
            content="Dear Brightly is the easiest way to get derm-grade retinoids to prevent and treat photoaging. Check ’em out."
          />
          <meta
            property="og:image"
            content="https://d17yyftwrkmnyz.cloudfront.net/DearBrightly_2682-min.jpg"
          />
        </Helmet>
        <PageWrapper isMobile={isMobile}>
          <InviteFormWrapper>
            <InviteFormContentWrapper>
              <MegaphoneIcon src={megaphoneIcon} />
              <InviteHeading>Invite the world...or just your friends!</InviteHeading>
              <InviteSubheading>
                They’ll automatically be entered for a chance to win a free trial.
                What’s in it for you? The best kind of karma there is.
              </InviteSubheading>
              <ShareMethodsWrapper isMobile={isMobile}>
                {isAuthenticated && (
                  <EmailShare
                    isEmailPending={isEmailPending}
                    isEmailSent={emailSent}
                    sendInvitation={this.sendInvitation}
                    emailError={emailSentFailed}
                    isMobile={isMobile}
                    handleMobileShare={this.handleMobileShare}
                  />
                )}
                {!isMobile && <AdditionalContent>Share your link:</AdditionalContent>}
                <Wrapper isMobile={isMobile}>
                  <CopyShare
                    textAreaRef={textarea => (this.textArea = textarea)}
                    copyLink={copyLink}
                    copyCodeToClipboard={this.copyCodeToClipboard}
                    mobileCopyCodeToClipboard={this.mobileCopyCodeToClipboard}
                    isCopied={isCopied}
                    isMobile={isMobile}
                  />
                  <MessengerShare
                    handleMobileShare={this.handleMobileShare}
                    getSharingProgramCode={this.getSharingProgramCode}
                    communicationMethod={communicationMethodsOptions.fbMessenger}
                    isMobile={isMobile}
                  />
                  {(isSafariBrowser || isMobile) && (
                    <MoreOptionsShare
                      handleShareButton={this.handleShareButton}
                      handleMobileShare={this.handleMobileShare}
                      isMobile={isMobile}
                      shareLink={moreLink}
                    />
                  )}
                </Wrapper>
              </ShareMethodsWrapper>
            </InviteFormContentWrapper>
          </InviteFormWrapper>
        </PageWrapper>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  sharingReferrerEmail: getSharingReferrerEmail(state),
  isAuthenticated: selectors.isAuthenticated(state),
  fbSharingCode: getReferralCodes(state, communicationMethodsOptions.fbMessenger),
  copySharingCode: getReferralCodes(state, communicationMethodsOptions.copy),
  moreSharingCode: getReferralCodes(state, communicationMethodsOptions.more),
  emailSharingCode: getReferralCodes(state, communicationMethodsOptions.email),
  isGenerated: getIsGenerated(state),
  isEmailSent: getIsEmailSent(state),
  emailError: getEmailError(state),
  isEmailPending: getEmailPending(state),
  user: getUserData(state),
});

export default connect(
  mapStateToProps,
  {
    getSharingProgramCodeRequest,
    setSharingReferrerEmail,
    resetGeneratedCode,
    redirectToUrl,
    sharingProgramEmailRequest,
  },
)(SharingProgramContainer);
