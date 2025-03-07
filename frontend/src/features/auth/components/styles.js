import styled from 'react-emotion';
import { breakpoints, fontFamily, fontWeight } from 'src/variables';

export const Container = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
    padding: 50px 40px 0 30px;
    display: flex;
    flex-direction: column;
    font-family: ${fontFamily.baseFont};
    ${breakpoints.xs} {
        padding: 20px 10px 0 10px;
    }
`;

export const Section = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    justify-content: center;
    align-self: center;
`;

export const Header = styled.div`
    font-size: 30px;
    display: flex;
    justify-content: center;
    padding-top: 45px;
    padding-bottom: 20px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
`;

export const Description = styled.div`
    font-size: 15px;
    margin-bottom: 25px;
    text-align: center;
`;

export const SubmitButton = styled.button`
    font-size: 18px;
    color: #fff;
    margin-top: 17px;
    background-color: #000;
    border: 2px solid #000;
    padding: 8px 15px;
    text-align: center;
    cursor: pointer;
    max-width: 200px;
`;
