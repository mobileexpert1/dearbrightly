import styled from 'react-emotion';

import { colors, fontSize, breakpoints } from 'src/variables';

export const HeaderWrapper = styled.div`
  margin-bottom: 10px;
`;

export const HeaderContent = styled.p`
  color: ${colors.darkModerateBlue};
  font-size: ${fontSize.medium};
  margin-bottom: ${props => props.noMargin && 0};
  font-weight: bold;  
`;

export const BreakLine = styled.div`
  height: 1px;
  border-bottom: 1px solid ${colors.darkModerateBlue};
`;

export const FormContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  justify-content: space-between;

  ${breakpoints.xs} {
    flex-direction: column;
  }
`;

export const StyledInput = styled.input`
  color: ${colors.shark};
  height: 2rem;
  background-color: ${props => (props.disabled ? colors.gallery : colors.clear)};
  border: 1px solid ${colors.darkModerateBlueOpacity};
  border-radius: 4px;
  padding: 1rem;
  width: 100%;
  margin-bottom: 0.7rem;
  :focus {
    border: 0.5px solid ${colors.sharkOpacity};
  }
`;

export const InputTitle = styled.p`
  margin-bottom: 5px;
  font-size: ${fontSize.small};
  width: fit-content;
  font-weight: 700;
  text-transform: capitalize;
`;


export const InputWrapper = styled.div`
  margin-bottom: 0.7rem;
  width: 49%;

  ${breakpoints.xs} {
    width: 100%;
  }
`;

export const SaveButton = styled.button`
  cursor: pointer;
  width: 9rem;
  height: 2.5rem;
  background: ${colors.darkModerateBlue};
  border-radius: 4px;
  color: ${colors.clear};
  border: none;

  :hover {
    background: ${colors.blumineLight};
  }

  ${breakpoints.xs} {
    width: 100%;
  }
`;

export const HrefButton = styled('button')`
  padding-left: 15px;
  margin: 0;
  text-align: center;
  background-color: transparent;
  border: none;
  text-decoration: underline;
  color: #0000EE;
  height: 20px;    
  font-size: 16px;
`;