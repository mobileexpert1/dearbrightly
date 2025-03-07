import React from 'react';
import styled from 'react-emotion';
import Select from 'src/common/components/Select/Select';
import * as S from 'src/features/orders/components/styles';

const TopBar = styled('div')`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 45px;
`;

const Row = styled('div')`
    display: flex;
    align-items: center;
    width: ${props => props.width};
    justify-content: ${props => props.justifyContent};
`;

const Input = styled('input')`
    max-width: 100px;
    height: 30px;
    padding: 0;
    display: inline-block;
    min-height: 30px;
`;

const Button = styled.button`
    border: 2px solid #ededed;
    height: 30px;
    font-size: 14px;
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

const SelectContainer = styled('div')`
    width: 200px;
    font-size: 14px;

    & > div {
        margin-bottom: 0;
    }

    select {
        height: 30px;
    }
`;

const Label = styled('label')`
    font-weight: normal;
    margin-left: 6px;
    margin-right: 6px;
`;

export const CustomerOrdersTopBar = props => (
    <S.TopBar>
        <S.Row width="65%">
            <S.TopBarButton onClick={props.onExport}>Export All</S.TopBarButton>
            <S.Row>
                <S.Label>Filter</S.Label>
                <S.Input
                    type="text"
                    value={props.filterValue}
                    onChange={props.onFilterValueChange}
                />
            </S.Row>
        </S.Row>
        <S.Row width="35%" justifyContent="flex-end">
            <S.SelectContainer>
                <S.Label>View</S.Label>
                <Select
                    name="pages"
                    handleChange={props.onPageAmountChange}
                    optionItems={props.pagesOptions}
                    value={props.pagesValue}
                    fullWidth
                />
            </S.SelectContainer>
        </S.Row>
    </S.TopBar>
);
