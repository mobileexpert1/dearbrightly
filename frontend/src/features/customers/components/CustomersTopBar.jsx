import React from 'react';
import styled from 'react-emotion';

import Select from 'src/common/components/Select/Select';

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
    font-size: 16px;
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
    margin-bottom: 0;
    vertical-align: middle;
`;

export const CustomersTopBar = ({
    onAddClick,
    onRemoveClick,
    onExportAllClick,
    // onExportSelectedClick,
    onSearchValueChange,
    onPagesValueChange,
    searchValue,
    pagesOptions,
    pagesValue,
    rxStatusOptions,
    rxStatusOptionValue,
    rxStatusOptionValueChange,
}) => (
    <TopBar>
        <Row width="65%">
            <Button disabled onClick={onAddClick}>
                Add
            </Button>
            <Button onClick={onRemoveClick}>Remove</Button>
            <Button onClick={onExportAllClick}>Export All</Button>
            {/* <Button onClick={onExportSelectedClick}>Export Selected</Button> // not used anymore */}
            <Row>
                <Label>Search</Label>
                <Input type="text" value={searchValue} onChange={onSearchValueChange} />
            </Row>
        </Row>
        <Row>
          <SelectContainer>
            <Select 
              required={false}
              handleChange={rxStatusOptionValueChange}
              optionItems={rxStatusOptions}
              value={rxStatusOptionValue}
              fullWidth
            />
          </SelectContainer>
        </Row>
        <Row width="15%" justifyContent="flex-end">
            <SelectContainer>
                <Select
                    required={false}
                    handleChange={onPagesValueChange}
                    optionItems={pagesOptions}
                    value={pagesValue}
                    fullWidth
                />
            </SelectContainer>
        </Row>
    </TopBar>
);