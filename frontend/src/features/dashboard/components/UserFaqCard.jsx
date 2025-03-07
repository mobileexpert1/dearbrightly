import React from 'react';
import { Collapse } from 'reactstrap';
import styled from 'react-emotion';

import plusIcon from 'src/assets/images/plusCircle.svg';
import minusIcon from 'src/assets/images/minusCircle.svg';

import { colors, breakpoints, fontSize } from 'src/variables';

const QuestionsWrapper = styled.div`
  display: flex;

  ${breakpoints.sm} {
    flex-direction: column;
  }
`;

const QuestionsColumn = styled.div`
  flex: 1 0 40%;
  margin-right: ${props => props.withMargin && '30px'};

  ${breakpoints.sm} {
    margin-right: 0;
  }
`;

const CollapseContent = styled(Collapse)`
  max-height: 119px;
  overflow-y: scroll;
`;

const CollapseInner = styled.div`
  margin-bottom: 30px;

  @media (max-width: 767px) {
    margin-bottom: 20px;
  }

  &.last-child {
    margin-bottom: 0;
  }
`;

const SingleQuestionWrapper = styled.div`
  border-bottom: ${props => props.withBorder && `1px solid ${colors.questionBorder}`};

  ${breakpoints.sm} {
    border-bottom: ${props => (props.noBorder ? 'none' : `1px solid ${colors.questionBorder}`)};
  }
`;

const QuestionTitleWrapper = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  margin: 10px auto;
`;

const QuestionTitle = styled.p`
  font-size: ${fontSize.normal};
  line-height: 22px;
  margin: auto 0;
  max-width: 364px;
`;

const QuestionContent = styled.p`
  font-size: ${fontSize.small};
  line-height: 18px;
  padding-right: 40px;
`;

const FAQQuestionIcon = styled.svg`
  background-image:  url('${props => props.iconSrc}') ;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  overflow: initial !important;
`;

class UserFaqCard extends React.Component {
  state = {
    activeCollapse: '',
  };

  toggleCollapse = value => {
    if (this.state.activeCollapse === value) {
      this.setState({
        activeCollapse: '',
      });
    } else {
      this.setState({
        activeCollapse: value,
      });
    }
  };

  render() {
    return (
      <QuestionsWrapper>
        <QuestionsColumn withMargin={1}>
          <SingleQuestionWrapper withBorder={1}>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('1')}>
              <QuestionTitle>How do I know if my retinoid is working? </QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '1' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '1'}>
              <CollapseInner>
                <QuestionContent>
                  Your retinoid formulation has the active, Tretinoin, which has over 50 years of
                  research behind it. The first few weeks your skin is acclimating to Tretinoin and
                  learning to tolerate this new active ingredient. Even if you don’t see a
                  difference right away, a great deal is happening under the surface. When it comes
                  to Tretinoin, patience is key.
                </QuestionContent>
                <QuestionContent>
                  Specifically, for the first two to four weeks of retinoid use, the skin is
                  undergoing many changes—dry, rough cells are being exfoliated, oil glands are
                  shrinking, collagen is remodeling, and a whole host of skin proteins and enzymes
                  are being activated. At three months, the skin is undergoing changes that are both
                  visible to the eye and noticeable under the microscope. Under the microscope,
                  there would be a new zone of actively repairing collagen that stretches the skin
                  taut and reduces fine lines. Individual skin cells would appear more organized and
                  oil glands and pores will be smaller. At six months, the skin continues to improve
                  with new collagen in place and fresh blood vessels to bring in skin nutrients.
                  Looking at the skin, it would appear more smooth and firm. In short, for visible
                  changes, give it six to twelve weeks.
                </QuestionContent>
                <QuestionContent>
                  * This content is not served for the purpose of medical advice and is only
                  informational.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
          <SingleQuestionWrapper withBorder={1}>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('2')}>
              <QuestionTitle>
                What products or facial services should I avoid using with my retinoid?
              </QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '2' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '2'}>
              <CollapseInner>
                <QuestionContent>
                  Benzoyl peroxide is known to decrease the stability of your retinoid. If you use
                  it, benzoyl peroxide and other topical antibiotics are best applied in the AM and
                  your retinoid applied in the PM.
                </QuestionContent>
                <QuestionContent>
                  It’s best to avoid unnecessarily abrasive exfoliators/cleansers (e.g., face wash
                  with glycolic or AHA/BHA acids), especially at the same time as using a retinoid.
                  These products can make the skin more sensitive and impact the epidermal barrier.
                  If these products are used, it’s a good idea to spread them out with your retinoid
                  use.
                </QuestionContent>
                <QuestionContent>
                  Other products or services to spread out and use on days that you’re not using
                  your retinoid:
                </QuestionContent>

                <QuestionContent>- Drying agents</QuestionContent>
                <QuestionContent>- Wax procedures</QuestionContent>
                <QuestionContent>- Laser procedures</QuestionContent>
                <QuestionContent>- Facials</QuestionContent>
                <QuestionContent>- Dermaplaning</QuestionContent>
                <QuestionContent>- Microneedling</QuestionContent>
                <QuestionContent>- Etc.</QuestionContent>

                <QuestionContent>
                  * This content is not served for the purpose of medical advice and is only
                  informational.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
          <SingleQuestionWrapper>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('3')}>
              <QuestionTitle>
                I’m experiencing new acne breakouts, dryness, sensitivity, and/or peeling. Is this
                normal?
              </QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '3' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '3'}>
              <CollapseInner>
                <QuestionContent>
                  This is totally normal in the first few weeks. Your skin is learning to adjust to
                  your new Tretinoin formulation.
                </QuestionContent>
                <QuestionContent>
                  For those prone to acne, there may be a two to four week “purging” period where
                  you experience acne breakouts before your skin clears up. There’s hidden acne
                  underneath the surface. This acne will surface sooner or later, but retinoids
                  force them to come out faster. Patience is key.
                </QuestionContent>
                <QuestionContent>
                  For those experiencing dryness, sensitivity, redness, or peeling, again this is
                  normal and expected for the first few weeks as your skin is acclimating to
                  Tretinoin. The good news is you can do a lot to prevent and combat these temporary
                  side effects. Some pro tips:
                </QuestionContent>
                <QuestionContent>
                  1. Use only a pea-sized amount. Using more than a pea-sized will increase your
                  risk of dryness, irritation, and redness. It does not increase efficacy. Retinoids
                  diffuse upon application (meaning a pea-sized amount is all you need).
                </QuestionContent>
                <QuestionContent>
                  2. Start slow and work your way up to nightly use. If your skin is new to
                  retinoids or you’re starting on a higher strength, start off by applying your
                  retinoid every three days. Then gradually increase to nightly as your skin learns
                  to tolerate. If three days a week is too much, dial it back. Always listen to your
                  skin.
                </QuestionContent>
                <QuestionContent>
                  3. Moisturize. Use your favorite moisturizer right after applying your retinoid to
                  prevent dryness. If that doesn’t do the trick, try applying your
                  moisturizer before your retinoid.
                </QuestionContent>
                <QuestionContent>
                  4. Use sunscreen. At first retinoids can make your skin more sensitive to the sun,
                  but after a few months your skin’s response to UV rays will return to normal.
                  Always make sure to apply SPF daily (important regardless to prevent photoaging).
                </QuestionContent>
                <QuestionContent>
                  * This content is not served for the purpose of medical advice and is only
                  informational.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
        </QuestionsColumn>
        <QuestionsColumn>
          <SingleQuestionWrapper withBorder={1}>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('4')}>
              <QuestionTitle>
                When is it time to increase my retinoid use to nightly?{' '}
              </QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '4' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '4'}>
              <CollapseInner>
                <QuestionContent>
                  It’s all about listening to your skin. If you’re not experiencing any side effects
                  like dryness, sensitivity, peeling, or redness, it’s reasonable to increase your
                  frequency of use and eventually work up to nightly use.
                </QuestionContent>
                <QuestionContent>
                  If your skin is new to retinoids or you’re starting on a higher strength, start
                  off by applying your retinoid every three days. As your skin learns to tolerate,
                  gradually increase to nightly. If three days a week is too much, dial it back and
                  work your way up to nightly as you notice your skin tolerating.
                </QuestionContent>
                <QuestionContent>
                  * This content is not served for the purpose of medical advice and is only
                  informational.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
          <SingleQuestionWrapper withBorder={1}>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('5')}>
              <QuestionTitle>How do I get my refill sooner?</QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '5' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '5'}>
              <CollapseInner>
                <QuestionContent>
                  If you need to get your refill sooner, you can go to Plan settings -> Next shipment -> Ship now.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
          <SingleQuestionWrapper noBorder={1}>
            <QuestionTitleWrapper onClick={() => this.toggleCollapse('6')}>
              <QuestionTitle>I’m not peeling, should I increase my strength?</QuestionTitle>
              <FAQQuestionIcon iconSrc={this.state.activeCollapse === '6' ? minusIcon : plusIcon} />
            </QuestionTitleWrapper>
            <CollapseContent isOpen={this.state.activeCollapse === '6'}>
              <CollapseInner>
                <QuestionContent>
                  Peeling is not always what you want. Once the ideal strength and formulation of
                  Tretinoin is achieved where your skin is acclimated and you’re not experiencing
                  dryness, peeling, etc., it is reasonable to continue on that product. The ideal
                  strength and formulation creates the desired cosmetic effect of improved skin tone
                  and texture while minimizing side effects. There is likely no greater benefit to
                  using a higher percentage, as studies have shown that they have similar outcomes
                  over a different period of time. If you’d like to read more on this, read our post
                  here.
                </QuestionContent>
                <QuestionContent>
                  * This content is not served for the purpose of medical advice and is only
                  informational.
                </QuestionContent>
              </CollapseInner>
            </CollapseContent>
          </SingleQuestionWrapper>
        </QuestionsColumn>
      </QuestionsWrapper>
    );
  }
}

export default UserFaqCard;
