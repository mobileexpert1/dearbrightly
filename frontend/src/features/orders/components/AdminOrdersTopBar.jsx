import React from 'react';
import styled from 'react-emotion';

import Select from 'src/common/components/Select/Select';

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width};
    justify-content: ${props => props.justifyContent};
`;

const Input = styled.input`
    min-width: 250px;
    padding: 5px;
    min-height: 35px;
`;

const Button = styled.button`
    border: 2px solid #ededed;
    min-height: 35px;
    font-size: 14px;
    margin: 5px;
    background-color: #fff;
    transition: 0.25s all;
    border-radius: 0.25rem;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;

const SelectContainer = styled.div`
    margin: 3px;
    width: auto;
    font-size: 14px;

    & > div {
        margin-bottom: 0;
    }

    select {
        height: 30px;
    }
`;

// const Selector = ({ selects }) => {
//   if (selects.length > 0) {
//     return (
//       <Select style={{ width: 180 }} value={selects.statusFilterValue} onChange={selects.onStatusFilterChange}>
//         {(selects.orderStatusesOptions.length > 0 &&
//         selects.orderStatusesOptions.map(({ value, name }) => (
//           <Select.Option css={{ fontSize: 13 }} key={value} value={value}>
//             {name}
//           </Select.Option>
//         )))}
//       </Select>
//     )
//   } else {
//     return (<h3>Loading...</h3>);
//   }

// }

export const AdminOrdersTopBar = props => (
  <TopBar>
    <Row>
      <Input
        placeholder="Search"
        type="text"
        name="filter"
        value={props.searchValue}
        onChange={props.onSearchChange}
      />
    </Row>
    <Row>
      <SelectContainer>
        <Select
          name="statusfilter"
          handleChange={props.onStatusFilterChange}
          optionItems={props.orderStatusesOptions}
          value={props.statusFilterValue}
          fullWidth
        />
      </SelectContainer>
    </Row>

    <Row>
      <SelectContainer>
        <Select
          name="action"
          handleChange={props.onActionChange}
          optionItems={props.actionsOptions}
          value={props.selectedAction}
          fullWidth
        />
      </SelectContainer>
      <Button onClick={props.onActionConfirm}>Confirm</Button>
    </Row>

    <Row>
      <Button onClick={props.onExportAll}>Export All</Button>
    </Row>

    <Row>
      <SelectContainer>
        <Select
          name="pages"
          handleChange={props.onPerPageChange}
          optionItems={props.perPageOptions}
          value={props.selectedPerPage}
          fullWidth
        />
      </SelectContainer>
    </Row>
  </TopBar>
);