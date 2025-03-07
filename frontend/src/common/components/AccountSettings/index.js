import React, { useEffect, useState } from 'react';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import {
  HeaderWrapper,
  HeaderContent,
  BreakLine,
} from 'src/features/dashboard/shared/myAccountStyles';
import {
  isProcessing,
  getOtpTimeoutSet,
  getOtpIsRequired,
  getOtpTimeoutToggleError,
  getTwoFactorEnabled,
  getTwoFactorError,
  getTwoFactorSetupResponse,
  getTwoFactorSetupError
} from 'src/features/auth/selectors/authenticationSelectors';
import {
  toggleOtpTimeoutRequest
} from 'src/features/auth/actions/authenticationActions'
import {
  twoFactorSetupRequest,
  twoFactorConfirmRequest,
  disableTwoFactorRequest
} from 'src/features/auth/actions/authenticationActions';
import { connect } from 'react-redux';
import QRious from "qrious"
import CustomModal from 'src/components/Modal';
import Checkbox from 'src/common/components/Checkbox';
import PinField from "react-pin-field"

const AccountSettings = (props) => {

  const [otpCode, setOtpCode] = useState("")
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false)
  const [disableTwoFactorCode, setDisableTwoFactorCode] = useState("")
  const [showOtpActivationModal, setShowOtpActivationModal] = useState(false)

  const get2FACode = () => {
    props.twoFactorSetupRequest()
  }

  const confirm2FaActivation = () => {
    props.twoFactorConfirmRequest({
      code: otpCode,
      secretKey: props.twoFactorSetupResponse.code,
    })
  }

  const disableTwoFactor = () => {
    if (disableTwoFactorCode) {
      props.disableTwoFactorRequest(disableTwoFactorCode)
    }
  }

  useEffect(() => {
    if (props.twoFactorSetupResponse && props.twoFactorSetupResponse.url) {
      var qr = new QRious({
        element: document.getElementById('qr'),
        value: props.twoFactorSetupResponse.url
      });
    }
  }, [props.twoFactorSetupResponse])

  useEffect(() => {
    if (!props.twoFactorEnabled) {
      setShowDisableTwoFactor(false)
      setDisableTwoFactorCode("")
    }
  }, [props.twoFactorEnabled])

  useEffect(() => {
    if (otpCode.length === 6) {
      confirm2FaActivation()
    }
  }, [otpCode])

  useEffect(() => {
    if (disableTwoFactorCode.length === 6) {
      disableTwoFactor()
    }
  }, [disableTwoFactorCode])


  const toggleOtpTimeout = () => {
    props.toggleOtpTimeoutRequest()
  }

  return (
    <div style={{ padding: 20, paddingLeft: 30 }}>
      <HeaderWrapper>
        <HeaderContent>Account security</HeaderContent>
        <BreakLine />
      </HeaderWrapper>

      {showOtpActivationModal && props.twoFactorSetupResponse && (
        <CustomModal title=" " onClose={() => {
          setShowOtpActivationModal(false)
        }}>
          {props.twoFactorSetupResponse && (
            <div>
              <div style={{ fontSize: 12, textAlign: "center" }}>
                <ol>
                  <li>1. Get the <a href="https://authy.com/download/" target="_blank" className="text-primary"><u>Authy Authenticator App</u></a>.</li>
                  <li>2. Add a new account in the authenticator app and select <b>Enter key manually</b> or <b>Scan QR code</b>.</li>
                  <li>3. Enter the one-time passcode displayed in the authenticator app.</li>
                </ol>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12 }}>Setup key</div>
                <div style={{ marginBottom: 20, fontSize: 16 }}><b>{props.twoFactorSetupResponse.code}</b></div>
                <div style={{ fontSize: 12 }}>QR Code</div>
                <canvas id="qr"></canvas>
              </div>
              <div className="text-center">
                <div style={{ fontSize: 16, marginTop: 30, marginBottom: 30 }}>
                  Enter your 6-digit code
                </div>

                <PinField
                  autoFocus
                  onComplete={(text) => {
                    setOtpCode(text)
                  }}
                  length={6}
                  className={"field-a"}
                />

                {props.twoFactorError && (
                  <div className="text-danger" style={{
                    fontSize: 12,
                    marginTop: 30,
                  }}>
                    {props.twoFactorError}
                  </div>
                )}

              </div>
            </div>
          )}
        </CustomModal>
      )}

      <Row>
        <Col md={6} xs={12} lg={6}>
          <span>
            <p><b>Two-Factor Authentication (OTP)</b></p>
            <p>
              Two-Factor Authentication (2FA) can be used to help protect your account from
              unauthorized access by requiring you to enter a security code when you sign in.
            </p>
            {props.twoFactorSetupError && (
              <div style={{ marginTop: 10, fontSize: 12 }} className="text-danger">{props.twoFactorSetupError}</div>
            )}
          </span>
        </Col>
        {!props.twoFactorEnabled && (
          <Col className="text-right" md={6} xs={12} lg={6}>
            <div onClick={() => {
              get2FACode()
              setShowOtpActivationModal(true)
            }}>
              <Checkbox checked={props.twoFactorEnabled} />
            </div>
          </Col>)}
        {props.twoFactorEnabled && (
          <Col md={6} xs={12} lg={6} style={{
            textAlign: 'center',
          }}>
            {!showDisableTwoFactor && (<div style={{
              float: "right"
            }} onClick={() => { setShowDisableTwoFactor(true) }} >
              <Checkbox checked={props.twoFactorEnabled} />
            </div>)}

            {showDisableTwoFactor && (
              <CustomModal
                title=" "
                onClose={() => {
                  setShowDisableTwoFactor(false)
                }}
              >
                <div style={{
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: 16,
                    marginBottom: 20
                  }}>
                    Enter your 6-digit code to disable 2FA.
                  </div>
                  <div>
                    <PinField
                      autoFocus
                      onComplete={(text) => {
                        setDisableTwoFactorCode(text)
                      }}
                      length={6}
                      className={"field-a"}
                    />
                  </div>
                  {props.twoFactorError && (<div style={{ marginTop: 30, fontSize: 12 }} className="text-danger">{props.twoFactorError}</div>)}
                </div>
              </CustomModal>)}
          </Col>
        )}
      </Row>
      {props.twoFactorEnabled && (<Row style={{
        alignItems: 'center',
      }}>
        <Col md={6} xs={12} lg={6}>
          <p><b style={{ marginRight: 10}}>Two-Factor Timeout (30 days)</b></p>
          <p>You will only need to re-enter a token after 30 days.</p>
          {props.otpTimeoutToggleError && (
            <div style={{ marginTop: 10, fontSize: 12 }} className="text-danger">{props.otpTimeoutToggleError}</div>
          )}
        </Col>
        <Col md={6} xs={12} lg={6} className="text-center">
          <div style={{
            float: "right"
          }}>
            <Checkbox checked={props.otpTimeoutSet} onChange={toggleOtpTimeout} />
          </div>
        </Col>
      </Row>)}
    </div>
  );
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  twoFactorSetupResponse: getTwoFactorSetupResponse(state),
  otpIsRequired: getOtpIsRequired(state),
  otpTimeoutSet: getOtpTimeoutSet(state),
  otpTimeoutToggleError: getOtpTimeoutToggleError(state),
  twoFactorEnabled: getTwoFactorEnabled(state),
  twoFactorError: getTwoFactorError(state),
  twoFactorSetupError: getTwoFactorSetupError(state),
});

export default connect(
  mapStateToProps,
  {
    twoFactorSetupRequest,
    twoFactorConfirmRequest,
    disableTwoFactorRequest,
    toggleOtpTimeoutRequest
  },
)(AccountSettings);