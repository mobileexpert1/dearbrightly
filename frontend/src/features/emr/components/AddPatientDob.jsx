import React, {useState} from 'react';
import { colors } from 'src/variables';
import { Button } from 'reactstrap';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import styled from '@emotion/styled';


const CustomDiv = styled.div`
  padding: 10px;
  cursor: pointer;
`

const AddPatientDob = ({onChange, active, onOkPressed, defaultValue}) => {
  const [showDobInput, setShowDobInput] = useState(false)

  return (
    <div>
      {!showDobInput ? (
      <div onClick={() => {setShowDobInput(true)}}>
          <div style={{
            paddingTop: 5,
            color: colors.linkColor,
            cursor: "pointer"
          }}><u>Edit date of birth</u></div>
      </div>) : (
          <div>
            <div style={{
              fontSize: 12,
              paddingTop: 5,
            }}>Edit date of birth</div>
            <input
              defaultValue={defaultValue}
              onChange={e => { onChange(e.target.value) }}
              maxLength={10}
              style={{
                minHeight: 30
              }}
              class="form-control form-control-sm"
              type="text" placeholder="YYYY-MM-DD"
            />

            <Row style={{
              textAlign: "center",
              marginTop: 5
            }}>
              <Col>
                <CustomDiv onClick={() => {
                  setShowDobInput(false)
              }} style={{
                  background: colors.breakLineGray
                }}>
                  Cancel
                </CustomDiv>
              </Col>
              <Col>
                <CustomDiv
                  onClick={() => {
                    if (active) {
                      setShowDobInput(false)
                      onOkPressed()
                    }
                  }}
                  style={{
                      background: active ? colors.facebookBlue : colors.screamingGray,
                      color: colors.white
                  }}
                >
                  OK
                </CustomDiv>
              </Col>
            </Row>
      </div>
      )}
    </div>
  );
};

export default AddPatientDob;
