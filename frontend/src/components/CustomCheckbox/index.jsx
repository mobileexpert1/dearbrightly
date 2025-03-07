import React from 'react';
import styled from 'react-emotion';
import { Row, Col } from 'reactstrap';
import { colors, fontFamily } from 'src/variables';

const OuterCircle = styled.div`
  height: 25px;
  width: 25px;
  background-color: #eee;
  border: 3px solid ${colors.mulberry};
  border-radius: 50%;
`

const InnerCircle = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${colors.mulberry};
  border-radius: 50%;
`

const Title = styled.span`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  font-family: ${fontFamily.baseFont};
  color: black;
`

const CustomCheckbox = ({ title, onClick, checked = false }) => {
  return (
    <Row onClick={onClick} style={{
      alignItems: "center",
      marginBottom: 20,
      cursor: "pointer"
    }}>
      <Col xs={2} style={{ padding: '5 5 5 15' }}>
        <OuterCircle>
          {checked && (<InnerCircle />)}
        </OuterCircle>
      </Col>
      <Col xs={10}>
        <Title>{title}</Title>
      </Col>
    </Row>
  );
};

export default CustomCheckbox;
