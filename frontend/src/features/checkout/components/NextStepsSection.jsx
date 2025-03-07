import React from 'react';
import styled from 'react-emotion';

import { breakpoints } from 'src/variables';

const AfterQuestionsWrapper = styled.div`
  display: flex;
  padding: 30px;
  justify-content: center;
  padding: 31px;
  position: relative;
  margin: auto;
  width: fit-content;

  ${breakpoints.lg} {
    flex-direction: column;
  }

  ${breakpoints.xs} {
    height: 36rem;
    padding: 20px;
  }
`;

const QuestionColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 63px;
  width: fit-content;
  text-align: left;
  height: fit-content;

  ${breakpoints.lg} {
    padding-right: 0;
  }
`;

const QuestionHeader = styled.p`
  font-size: 18px;
  line-height: 20px;
  font-weight: bold;
`;

const QuestionContent = styled.p`
  font-size: 14px;
  line-height: 16px;
  width: 309px;
`;

export const NextStepsSection = () => (
  <AfterQuestionsWrapper>
    <QuestionColumn>
      <QuestionHeader>What do I do next?</QuestionHeader>
      <QuestionContent>
        Sit back and relax. We are sending your information to your board-certified medical
        provider. They will message you with any follow-up questions.
      </QuestionContent>
      <QuestionHeader>How long does it take?</QuestionHeader>
      <QuestionContent>
        Expect your order to be delivered in 5-7 business days pending your skin profile review by
        your provider
      </QuestionContent>
    </QuestionColumn>
    <QuestionColumn>
      <QuestionHeader>Pharmacy selection?</QuestionHeader>
      <QuestionContent>
        Dear Brightly’s preferred pharmacy selection guarantees competitive pricing, quality of
        ingredients, and free shipping. However, if you would like to specify a compounding pharmacy
        of your choice, please email us at support@dcdearbrightly.com
      </QuestionContent>
    </QuestionColumn>
    <QuestionColumn>
      <QuestionHeader>What if I have any questions or concerns?</QuestionHeader>
      <QuestionContent>
        Dear Brightly: Feel free to email us at support@dearbrightly.com.
      </QuestionContent>
      <QuestionContent>
        Provider: Get in touch with your provider any time by logging into your account and using
        our secure messaging system.
      </QuestionContent>
      <QuestionContent>
        Pharmacy: Our preferred pharmacy, Curexa, is located at 3007 Ocean Heights Ave Egg Harbor
        Twp, NJ 08234 and can be reached at (855) 927-0390.
      </QuestionContent>
    </QuestionColumn>
  </AfterQuestionsWrapper>
);
