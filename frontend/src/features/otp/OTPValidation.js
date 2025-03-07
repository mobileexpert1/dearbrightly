import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { validateOtpRequest } from 'src/features/auth/actions/authenticationActions';
import { isProcessing, getTwoFactorError } from 'src/features/auth/selectors/authenticationSelectors';
import { colors } from 'src/variables';
import PinField from "react-pin-field"
import Link from 'react-router-dom/Link';


const OTPValidation = (props) => {
  const ref = useRef()
  const [code, setCode] = useState("")
  const [enable2faTimeout, setEnable2faTimeout] = useState(false)

  const validateCode = () => {
    props.validateOtpRequest({ code, enable2faTimeout })
  }

  useEffect(() => {
    if (code.length === 6) {
      validateCode()
    }
  }, [code])

  return (
    <div className="text-center">
      <h2>Enter your 6-digit code</h2>
      <div style={{
        marginTop: 30,
        marginBottom: 30
      }}>
        <div>
          Enter the code in your authenticator app
        </div>
        <div>
          <Link style={{ color: colors.red }} to='/contact'>Don't have access to your app?</Link>
        </div>
      </div>
      {props.twoFactorError && (
        <div className="text-danger" style={{
          fontSize: 12,
          marginTop: 30,
        }}>
          {props.twoFactorError}
        </div>
      )}
      <div style={{ marginBottom: 30 }}>
        <PinField
          autoFocus
          onComplete={(text) => {
            setCode(text)
          }}
          length={6}
          className={"field-a"}
        />
      </div>


      <div>
        <div class="row" style={{ float: "right", width: "100%", alignItems: "center" }}>

          <div class="col-sm-3" style={{ width: 40 }}>
            <input checked={enable2faTimeout} onChange={() => {
              setEnable2faTimeout(!enable2faTimeout)
            }} type="checkbox" style={{
              height: 20,
              width: 20,
              float: "right"
            }} />
          </div>
          <div>
            <label for="staticEmail" class=" col-form-label">Remember this device for 30 days</label>
          </div>
        </div>
      </div>

    </div>
  );
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  twoFactorError: getTwoFactorError(state),
});

export default connect(
  mapStateToProps,
  { validateOtpRequest },
)(OTPValidation);

