import React, { Fragment } from 'react';
import { Checkbox, Message, Wrapper } from './styles/StyledTelehealthConsent';

export const TelehealthConsent = ({ onChange, messageStyles, wrapperStyles }) => {
  const renderLink = (path, title) => (
    <Fragment>
      {' '}
      <a href={path} target="_blank">
        {title}
      </a>
    </Fragment>
  );

  return (
      <Wrapper css={wrapperStyles}>
          <Checkbox
              type="checkbox"
              onChange={onChange}
          />
          <Message css={messageStyles}>
              I agree to the {renderLink('/terms/', 'Terms of Service')},
              {renderLink('/privacy-policy/', 'Privacy Policy')}, and{' '}
              {renderLink('/consent-to-telehealth', 'Consent to Telehealth')}
          </Message>
      </Wrapper>
  );
};
