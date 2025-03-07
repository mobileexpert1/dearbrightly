import React from "react"
import Link from 'react-router-dom/Link'
import styled from "@emotion/styled"

import closeIcon from "src/assets/images/closeMenuIcon.svg"

import { NextStepButton } from "./styles"
import { fontSize, breakpoints } from "src/variables"

const photo = "https://d17yyftwrkmnyz.cloudfront.net/DearBrightly_1772.jpg"

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100vh;

  ${breakpoints.md} {
    flex-direction: column-reverse;
    height: fit-content;
  }
`

const SectionPhoto = styled.div`
  width: 50%;
  height: 100%;

  ${breakpoints.md} {
    height: fit-content;
    width: 100%;
  }
`

const StyledPhoto = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;

  ${breakpoints.md} {
    height: 21rem;
  }
`

const SectionContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  flex-direction: column;
  padding: 0 3rem 0 9.7rem;
  width: 50%;

  ${breakpoints.lg} {
    padding: 0 3rem 0 5rem;
  }

  ${breakpoints.md} {
    padding: 3rem 2rem;
    width: 100%;
  }
`

const HeaderWrapper = styled.div`
  margin-bottom: 2rem;
`

const SectionHeader = styled.p`
  font-weight: bold;
  font-size: ${fontSize.huge};
  line-height: 46px;
  margin: 0;

  ${breakpoints.md} {
    font-size: ${fontSize.biggest};
    line-height: 36px;
  }
`

const SectionContent = styled.p`
  font-size: ${fontSize.small};
  max-width: 26.32rem;
  font-weight: ${props => props.bolded && "bold"};
  margin-top: ${props => props.bolded && "3rem"};
`

const CloseQuizIcon = styled.img`
  position: absolute;
  right: 3rem;
  top: 2rem;
  width: 1rem;
  height: 1rem;

  ${breakpoints.sm} {
    right: 1.5rem;
    top: 1.5rem;
  }
`

const submitLink = "https://dearbrightly.attn.tv/p/GE7/intro-qnr-submit"

export const QuizComplete = ({ nextStep }) => (
  <Wrapper>
    <Link to="/">
      <CloseQuizIcon src={closeIcon} />
    </Link>
    <SectionPhoto>
      <StyledPhoto src={photo} />
    </SectionPhoto>
    <SectionContentWrapper>
      <HeaderWrapper>
        <SectionHeader>Ready to</SectionHeader>
        <SectionHeader>have your mind blown?</SectionHeader>
      </HeaderWrapper>
      <SectionContent>
        There are 41,000 people for every one dermatologist in this country, so
        getting a consult for a retinoid can be inconvenient and costly—until
        now.
      </SectionContent>
      <SectionContent>
        Dear Brightly is the easiest way to get a doctor’s visit plus tailored
        retinoid serum (two-month trial) online, all for just $59.
      </SectionContent>
      <SectionContent bolded>
        Subscribe today to receive your promo code
      </SectionContent>
      <a href={submitLink} state={{ isQuizOpen: false }}>
        <NextStepButton>Sign up to learn more</NextStepButton>
      </a>
    </SectionContentWrapper>
  </Wrapper>
)
