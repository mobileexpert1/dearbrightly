//import liraries
import React from 'react';
import { colors, breakpoints, fontFamily } from 'src/variables';
import styled from "@emotion/styled"

const Wrapper = styled.div`
  padding: 0 450 0 450;
  ${breakpoints.xxl} {
    padding: 0 250 0 250;
  }
  ${breakpoints.lg} {
    padding: 0 150 0 150;
  }
  ${breakpoints.sm} {
    padding: 0 50 0 50;
  }
`

// create a component
const PregnancyInfo = () => {
  const errorMessage = `Congratulations! Given where you're at right now, it's best to wait until after pregnancy or nursing. We'll be here as soon as you're ready!`

  const gotoProducts = () => {
    location.href = '/products'
  }

  return (
    <Wrapper style={{textAlign: 'center', fontFamily: fontFamily.baseFont }}>
      <div style={{
        fontWeight: "bold",
        fontSize: 24,
        marginBottom: 10,
        paddingTop: 100
      }}>We're so happy for you.
      </div>

      <div style={{
        paddingBottom: 20
      }}>
        {errorMessage}
      </div>

      <div onClick={gotoProducts} className="btn btn-primary" style={{
        background: colors.facebookBlue,
        padding: '8px 30px',
        borderColor: 'transparent'
      }}>
        Explore other products
      </div>
    </Wrapper>
  );
};

export default PregnancyInfo;
