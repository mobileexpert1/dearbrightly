import styled from "@emotion/styled"
import Link from 'react-router-dom/Link'

import {
  mobileFirstBreakpoints,
  colors,
  fontSize,
  breakpoints,
} from "src/variables"

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  margin-top: 2rem;
  width: 100%;
  max-width: 88rem;

  ${mobileFirstBreakpoints.md} {
    flex-direction: row;
    align-items: center;
  }
`

export const PhotoSection = styled.div`
  max-width: 42.7rem;
  margin: auto;

  ${mobileFirstBreakpoints.md} {
    margin: 0;
  }
`

export const ContentSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${mobileFirstBreakpoints.md} {
    width: 60%;
    height: 100%;
    padding-left: 3.8rem;
    align-items: flex-start;
  }

  ${mobileFirstBreakpoints.xxl} {
    padding-left: 10rem;
  }
`

export const SectionPhoto = styled.img`
  width: 100%;
  height: 45rem;
  object-fit: cover;
  position: relative;

  ${breakpoints.xxl} {
    max-width: 42.7rem;
  }

  ${breakpoints.lg} {
    width: 35rem;
  }

  ${breakpoints.md} {
    width: 28.2rem;
  }

  ${breakpoints.sm} {
    width: 100%;
    height: 18rem;
  }
`

export const Header = styled.p`
  font-weight: bold;
  font-size: ${fontSize.biggest};
  line-height: 30px;
  text-align: center;
  max-width: 17rem;

  ${mobileFirstBreakpoints.md} {
    font-size: ${fontSize.bigHeader};
    max-width: 30rem;
    text-align: left;
    line-height: 62px;
  }

  ${mobileFirstBreakpoints.lg} {
    font-size: ${fontSize.hugeHeader};
  }
`

export const Description = styled.p`
  font-size: ${fontSize.small};
  line-height: 26px;
  text-align: center;
  max-width: 20rem;

  ${mobileFirstBreakpoints.md} {
    max-width: 25rem;
    text-align: left;
  }
`

export const NextStepIcon = styled.img`
  position: absolute;
  display: ${props => props.isIconHidden && "none"};
  right: 1rem;
  margin-left: 0.5rem;
  width: 1rem;
  height: 1.3rem;
  bottom: 1.3rem;

  ${breakpoints.md} {
    position: relative;
    right: 0;
    bottom: 0;
  }
`

export const NextStepButton = styled.button`
  position: relative;
  border: ${props =>
    props.disabled ? `1px solid ${colors.disabledButtonBorder}` : "none"};
  background: ${props =>
    props.disabled ? colors.disabledButton : colors.darkModerateBlue};
  width: 13.83rem;
  height: 4rem;
  border-radius: 4px;
  color: ${props =>
    props.disabled ? colors.disabledButtonBorder : colors.clear};
  font-weight: 800;
  font-size: ${fontSize.medium};
  line-height: 17px;
  margin-bottom: 2rem;

  :hover {
    background: ${props => !props.disabled && colors.blumineLight};
  }

  ${breakpoints.md} {
    font-size: ${fontSize.small};
    border-radius: 0;
    margin-bottom: 0;
    width: 100%;
  }
`

export const QuizStepContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  max-width: ${props => (props.extraWidth ? "59.4rem" : "44.63rem")};
  width: 100%;
  padding-top: ${props => (props.smallMargin ? "4rem" : "6rem")};

  ${breakpoints.lg} {
    padding-top: ${props => (props.smallMargin ? "4rem" : "6rem")};
  }

  ${breakpoints.md} {
    max-width: none;
    padding-top: 3rem;
  }
`

export const StyledLink = styled(Link)`
  position: absolute;
  bottom: 0;

  ${breakpoints.md} {
    position: sticky;
    bottom: 0;
    width: 100%;
  }
`
