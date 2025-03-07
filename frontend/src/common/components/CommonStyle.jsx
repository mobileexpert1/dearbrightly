import styled from 'react-emotion';
import { fontFamily, fontWeight } from 'src/variables';

export const Heading2 = styled('h2')`
    font-family: ${fontFamily.baseFont};
    font-size: 24px;
    line-height: 29px;
    color: #000;
    letter-spacing: 0.1px;
    @media (max-height: 667px) {
        font-size: 24px !important;
    }
`;

export const FormLabel = styled('label')`
    font-size: 14px;
    line-height: 18px;
    color: rgb(105, 105, 105);
    font-family: ${fontFamily.baseFont};
`;
export const FormControl = styled('input')`
    font-size: 12px;
    height: 48px;
    line-height:1 !important;
    padding: 0 15px;
    border: 1px solid rgb(230, 224, 224);
    outline: 0;

    &:focus {
        box-shadow: none;
    }
`;
export const FormError = styled('div')`
    font-family: ${fontFamily.baseFont};
    font-size: 14px;
    color: red;
    padding-top: 5px;
`;
