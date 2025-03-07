import React from 'react';
import styled from 'react-emotion';
import { colors } from 'src/variables';

export default function HorizontalLine({ color, style }) {
  const Hr = styled.div`
    height: 1px;
    background: ${color || colors.facebookBlue};
  `
  return (
    <Hr style={{
      ...style
    }} />
  );
}
