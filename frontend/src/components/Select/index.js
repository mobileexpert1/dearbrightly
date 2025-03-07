import React from 'react';
import styled from 'react-emotion';
import { colors } from 'src/variables';
import Select from 'react-select';

const StyledSelect = styled(Select)`
  color: ${colors.darkModerateBlue};
  margin-top: 5px;
  margin-bottom: 5px;
  width: 100%;
  font-size: 14px;

  &.Select.placeholder {
     text-align: center;
     color: ${colors.darkModerateBlue};
  }
`;

const CustomSelect = (props) => {
  const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? null
          : isSelected
            ? colors.facebookBlue
            : isFocused
              ? null
              : null,
        color: isDisabled
          ? colors.screamingGray
          : isSelected
            ? colors.white
            : isFocused
              ? colors.facebookBlue
              : null,
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    }
  }


  return (
    <StyledSelect styles={colourStyles} {...props} />
  );
};

export default CustomSelect;
