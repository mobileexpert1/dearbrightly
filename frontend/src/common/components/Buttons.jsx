import styled from 'react-emotion';
import { breakpoints, colors, fontFamily, fontWeight } from 'src/variables';

export const DarkButton = styled('button')`
  font-size: 18px;
  color: ${colors.clear};
  background-color: ${colors.dark};
  border: 2px solid ${colors.dark};
  padding: 8px 15px;
  text-align: center;
  cursor: pointer;
  max-width: 150px;
  min-width: 150px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  margin-bottom: 5px;
`;

export const ClearButton = styled('button')`
  font-size: 18px;
  color: ${colors.dark};
  background-color: ${colors.clear};
  border: 2px solid #ffc7bd;
  padding: 8px 15px;
  text-align: center;
  cursor: pointer;
  min-width: 150px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  margin-top: 30px;
  display: inline-block;

  :hover {
    border: 2px solid #4d4d4d;
    color: #4d4d4d;
  }
`;


export const StandardBlueButton = styled.button`
  ${props => props.minWidth && `min-width: ${props.minWidth}% !important;`}
  box-sizing: border-box;
  border-radius: 4px;
  text-align: center;
  font-family: ${fontFamily.baseFont};
  ${props => `padding: 10 ${props.horizontalPadding || 40} 10 ${props.horizontalPadding || 40}`};
  ${props => `width: ${props.maxWidth ? props.maxWidth : 'fit-content'};max-width: ${props.maxWidth ? props.maxWidth : 'fit-content'}`};  
  ${props => `color: ${props.color || 'white'}`};
  cursor: pointer;
  font-weight: ${fontWeight.bold};
  ${props => `border: 1px solid ${props.active ? colors.facebookBlue : colors.disabledColor}`};
  ${props => `background: ${props.active ? props.background || colors.facebookBlue : colors.disabledColor}`};
  ${props => props.style && {...props.style}}
`

export const StandardBlueButtonHref = styled.a`
  ${props => props.minWidth && `min-width: ${props.minWidth}% !important;`}
  box-sizing: border-box;
  border-radius: 4px;
  text-align: center;
  font-family: ${fontFamily.baseFont};
  ${props => `padding: 10 ${props.horizontalPadding || 40} 10 ${props.horizontalPadding || 40}`};
  ${props => `color: ${props.color || 'white'}`};
  ${props => `width: ${props.maxWidth ? props.maxWidth : 'fit-content'};max-width: ${props.maxWidth ? props.maxWidth : 'fit-content'}`};  
  text-decoration: none;
  font-weight: ${fontWeight.bold};
  ${props => `border: 1px solid ${props.active ? colors.facebookBlue : colors.disabledColor}`};
  ${props => `background: ${props.active ? props.background || colors.facebookBlue : colors.disabledColor}`};
  :hover {
    text-decoration: none;
    color: white;
  }
  :active {
    text-decoration: none;
    color: white;
  }
  ${props => props.style && { ...props.style }}
  `

export const StandardOutlineBlueButton = styled.button`
  box-sizing: border-box;
  border-radius: 4px;
  text-align: center;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  ${props => `padding: 10 ${props.horizontalPadding || 40} 10 ${props.horizontalPadding || 40}`};
  ${props => `width: ${props.maxWidth ? props.maxWidth : 'fit-content'};max-width: ${props.maxWidth ? props.maxWidth : 'fit-content'}`};
  color: ${colors.facebookBlue};
  cursor: pointer;
  ${props => `border: 1px solid ${props.active ? colors.facebookBlue : colors.disabledColor}`};
  background: white;
  ${props => props.style && { ...props.style }}
`