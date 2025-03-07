import styled from 'react-emotion';

import { fontSize, colors } from 'src/variables';

export const Title = styled.h3`
    font-size: ${fontSize.big};
    font-weight: bold;
    margin-bottom: 15px;
`;

export const ItemTitle = styled.p`
    font-size: ${fontSize.normal};
    font-weight: bold;
`;

export const ClientDataGroup = styled.div`
    margin-top: 25px;
`;

export const Container = styled.div`
    font-family: 'PFHandbookPro-Bold';
    font-size: ${fontSize.normal};

    input {
        margin-bottom: 7px;
    }
`;

export const Header = styled.h2`
    font-size: ${fontSize.biggest};
    font-weight: bold;
    margin-bottom: ${props => props.marginBottom};
`;

export const Status = styled.div`
    margin-top: 20px;
    width: 70%;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 45px;
`;

export const Wrapper = styled.div`
    border: 1px solid ${colors.light};
    margin-bottom: 35px;
    padding: 16px;
`;

export const Button = styled.button`
    border: 2px solid ${colors.light};
    font-size: ${fontSize.normal};
    padding: 10px 20px;
    margin-left: 8px;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;

export const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 45px;
`;

export const Row = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width};
    justify-content: ${props => props.justifyContent};
`;

export const Input = styled.input`
    max-width: 100px;
    height: 30px;
    padding: 0;
    display: inline-block;
    min-height: 30px;
`;

export const TopBarButton = styled.button`
    border: 2px solid #ededed;
    height: 30px;
    font-size: 14px;
    margin-left: 6px;
    margin-right: 6px;
    background-color: #fff;
    transition: 0.25s all;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;

export const SelectContainer = styled.div`
    display: flex;
    width: 100px;
    align-items: center;

    & > div {
        margin-bottom: 0;
    }

    select {
        font-size: 14px;
        height: 30px;
    }
`;

export const Label = styled.label`
    font-weight: normal;
    margin: 0 6px;
`;
