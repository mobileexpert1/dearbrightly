import styled from 'react-emotion';
import { fontFamily, fontWeight } from 'src/variables';

export const DetailsTable = styled('div')`
    padding: 20px 10px;
    border: 6px solid #f7f8f9;
    background-color: #fff;
    padding-left: 15px;
    min-height: 80%;
`;

export const DetailsTableHeader = styled('h3')`
    padding-top: 6px;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0;
`;

export const DetailsTableText = styled('p')`
    font-size: 14px;
`;

export const SectionTitle = styled('h2')`
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
`;

export const SectionText = styled('p')`
    font-size: 17px;
    line-height: 24px;
    color: #000;
	font-family: ${fontFamily.baseFont};
`;

export const BenefitsList = styled('ul')``;

export const BenefitsListItem = styled('li')`
    font-size: 16px;
    padding-top: 7px;
    padding-bottom: 7px;
    list-style-type: circle;
`;

export const BenefitsListTitle = styled('h3')`
    font-size: 18px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 15px;
`;

export const Heading1 = styled('h1')`
    font-size: 22px;
    line-height: 28px;
    color: #000;
    font-family: ${fontFamily.baseFont};
    font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
    letter-spacing: 0.08px;
    margin-bottom: 20px;
    text-transform: ${props => (props.uppercase ? 'uppercase' : '')};
`;

export const Heading2 = styled('h2')`
    font-size: 18px;
    line-height: 24px;
    color: #000;
    font-family: ${fontFamily.baseFont};
    font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
    letter-spacing: 0.08px;
    margin-bottom: 0;
    text-transform: ${props => (props.uppercase ? 'uppercase' : '')};
`;

export const Heading3 = styled('h3')`
    font-size: 17px;
    line-height: 24px;
    color: #000;
    font-family: ${fontFamily.baseFont};
    font-weight: ${props => props.bold ? fontWeight.bold : fontWeight.regular };
`;
export const PrimaryButton = styled('button')`
    color: #fff;
    background-color: #000;
    border-color: #000;
    border-radius: 0;
    outline: 0;
    font-size: 17px;
    border-width: 2px;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 30px;
    cursor: pointer;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    &:hover {
        color: #000;
        background-color: transparent;
        border-color: #000;
    }
    &:focus {
        box-shadow: none;
        outline: 0;
    }
    &:active {
        color: #000 !important;
        background-color: transparent !important;
        border-color: #000 !important;
    }
    &.uppercase {
        text-transform: uppercase;
    }
`;
