import styled from 'react-emotion';
import { colors, breakpoints } from 'src/variables';

export const Wrapper = styled.div`
  margin: 0 auto;
  display: flex;
  align-items: center;
  width: fit-content;
`;

export const Checkbox = styled.input`
  user-select: none;
  min-height: 16px;
  min-width: 16px;
  width: 18px;
  height: 18px;
  border: 1px solid ${colors.grey};
 
  border-radius: 4px;
  margin-right: 15px;

  &:hover, &:focus{
    border: ${colors.black};
  }

  &:checked{
    appearance: checkbox;
  }
`

export const Message = styled.p`
  font-size: 14px;
  line-height: 17px;
  max-width: 334px;
  margin: auto;

  ${breakpoints.xs} {
    max-width: 293px;
  }
`;
