import React from 'react';
import { Row, Col } from 'reactstrap';
import { CardElement } from 'react-stripe-elements';

import styled from 'react-emotion';
// import Card1 from 'src/assets/images/credit-cards_amex.png';
// import Card2 from 'src/assets/images/credit-cards_mastercard.png';
// import Card3 from 'src/assets/images/credit-cards_visa.png';
import CardIcon from 'src/assets/images/card_icon.png';
import { breakpoints, colors, errorMessageStyle, fontFamily, fontWeight } from 'src/variables';

const Wrapper = styled('div')`
    ${breakpoints.sm} {
        padding: 0px 15px 0 15px;
    }
`;

const Heading2 = styled('h2')`
    font-size: 20px;
    color: #000;
    letter-spacing: 0.1px;
    margin: 20px 0 15px 0;
    font-family: ${fontFamily.baseFont};
`;
const DescriptionBlock = styled('div')`
    padding-bottom: 25px;
`;
const Heading3 = styled('div')`
    font-size: 17px;
    line-height: 24px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    color: #000;
`;

const CardsList = styled('ul')`
    display: flex;
    margin: 0;
`;

const CardsListItem = styled('li')`
    padding-left: 8px;
    width: 38px;
    img {
        width: 100%;
    }
`;

const DescriptionInner = styled('div')``;
const Dot = styled('i')`
    height: 18px;
    width: 18px;
    background: #fff;
    border-radius: 50%;
    border: 2px solid #000;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    margin-right: 8px;

    &:after {
        content: '';
        height: 8px;
        width: 8px;
        margin: auto;
        background: #000;
        border-radius: 50%;
        position: absolute;
        top: 0px;
        left: 0;
        right: 0;
        bottom: 0;
    }
`;
const Paragraph = styled('p')`
    margin-top: 15px;
    font-size: 17px;
    color: dimgray;
`;
const FormWrapper = styled('div')``;

const InputWrapper = styled('div')`
    padding: 12px 10px 10px;
    border: 1px solid #e6e0e0;
    outline: 0;
    background: white;
    border-radius: 0.25rem;
`;
const CardNumberWrapper = styled('div')`
    padding: 10px;
    border: 1px solid #e6e0e0;
    outline: 0;
    border-radius: 0.25rem;
    background: #fff url(${CardIcon}) 96% center no-repeat;
    background-size: 30px;
    padding-right: 60px;
`;

const labelStyle = {
    display: 'block',
    width: 'auto',
    fontSize: '14px',
    lineHeight: '18px',
    color: 'dimgray',
    fontFamily: fontFamily.baseFont,
    marginBottom: '.5rem',
};

const createOptions = fontSize => {
    return {
        style: {
            base: {
                fontSize: `${fontSize || 14}`,
                color: '#424770',
                letterSpacing: '0.025em',
                fontFamily: fontFamily.baseFont,
                lineHeight: '24px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                ...errorMessageStyle
            },
        },
    };
};

const CardInfoSection = props => {
    const { fontSize, onCardInfoChange, isUpdatePayment = false } = props;
    return (
        <Wrapper>
            {!isUpdatePayment && (<Heading2> Payment </Heading2>)}
            <FormWrapper>
                <Row>
                    <Col style={props.colStyle && { ...props.colStyle }}>
                        <CardNumberWrapper>
                            <CardElement
                                onChange={onCardInfoChange}
                                {...createOptions(fontSize)}
                                id="cardNumber"
                                onReady={el => el.focus()}
                            />
                        </CardNumberWrapper>
                    </Col>
                </Row>
            </FormWrapper>
        </Wrapper>
    );
};

export default CardInfoSection;