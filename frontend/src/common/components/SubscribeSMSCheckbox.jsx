import React from 'react';
import styled from 'react-emotion';

const Checkbox = styled.input`
  appearance: none;
  user-select: none;
  min-height: 16px;
  min-width: 16px;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: ${props => `1px solid ${props.borderColor ? props.borderColor : 'rgb(230, 224, 224)'}`};
  border-radius: ${props => `${props.borderRadius ? props.borderRadius : '4px'}`};

  &:hover, &:focus{
    border: ${props => `1px solid ${props.outlineColor ? props.outlineColor : '#000'}`};
  }

  &:checked{
    appearance: checkbox;
  }
`

const Row = styled.div`
  display: flex;
  gap: 0.25rem;
  min-height: 45px;
`

const Container = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
  color: ${props => `${props.color ? props.color : 'rgb(105, 105, 105)'}`};
  fontFamily: ${props => `${props.fontFamily ? props.fontFamily : 'Roboto'}`};
`

const SubscribeDescriptionParagraph = styled.p`
  font-size: 14px;
  line-height: 16px;
  font-weight: 400;
  color: inherit;
  font-family: inherit;
  padding: 1px 3px;
  margin-bottom: 0;
`

const SubscribeTermsParagraph = styled(SubscribeDescriptionParagraph)`
  font-size: 12px;
`

const TermsHref = styled.a`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  font-family: inherit;
  color: inherit;
`

const SubscribeSMSCheckbox = ({
  name,
  value,
  onChangeHandle,
  ...props
}) => {
  const subscribeTerms = `By checking this box, you consent to DearBrightly, 
  Inc. sending recurring autodialed SMS texts or calls to the phone number you have listed on this page. 
  You are not required to consent to purchase any DearBrightly, Inc. goods or services. 
  Message and data rates may apply. 
  Text STOP to cancel; HELP for help.`

  return (
    <Container fontFamily={props.fontFamily} color={props.color}>
        <Row>
            <Checkbox 
                type="checkbox" 
                name={name} 
                defaultChecked={value}
                value={value}
                onChange={onChangeHandle}
                {...props}
            />
            <SubscribeTermsParagraph>
                {props.subscribeTerms ? props.subscribeTerms : subscribeTerms}
            </SubscribeTermsParagraph>
        </Row>
    </Container>
  );
}

export default SubscribeSMSCheckbox;
