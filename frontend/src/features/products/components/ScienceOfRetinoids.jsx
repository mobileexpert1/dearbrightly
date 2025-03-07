import React from 'react';
import styled from 'react-emotion';
import LazyLoad from 'react-lazyload';
import { Container, Row, Col } from 'reactstrap';
import _ from 'lodash';
import { StandardBlueButton, StandardBlueButtonHref } from 'src/common/components/Buttons';
import { fontFamily, fontWeight } from 'src/variables';

const acneImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-acne.png';
const pigmentationImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-pigmentation.png';
const poresImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-pores.png';
const roughSkinImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-rough-skin.png';
const wrinklesImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-wrinkles.png';

const Wrapper = styled('div')`
  background: #fff;
  padding: 40px 0;
  @media (max-width: 768px) {
  }
`;

const TitleWrapper = styled('div')`
  text-align: left;

  @media (min-width: 768px) {
    text-align: center;
  }
`;

const ScienceImageWrapper = styled('div')`
  text-align: center;

  img {
    width: 320px;
    margin: auto;
  }
`;

const ScienceWrapper = styled('div')`
  max-width: 800px;
  margin: auto;
  margin-top: 5px;
`;

const ScienceInner = styled('div')`
  margin-top: 10px;
  @media (min-width: 768px) {
    max-width: 352px;
    margin: auto;
    margin-bottom: 80px;
  }
`;

const ScienceContent = styled('div')`
  h2 {
    margin-bottom: 15px;
  }
  p {
    & ~ p {
      margin-top: 30px;
    }
  }
`;

const BtnWrap = styled('div')`
  margin-top: 50px;
  text-align: center;
  @media (min-width: 768px) {
    text-align: left;
  }
`;

const Heading2 = styled('h2')`
  text-align: center;
  font-size: 36px;
  line-height: 36px;
  letter-spacing: 0.2px;
  margin-bottom: 20px;
  font-family: ${fontFamily.baseFont};
  font-weight: ${fontWeight.bold};
  -webkit-font-smoothing: 'antialiased';
  @media (min-width: 768px) {
    margin-bottom: 50px;
    font-size: 42px;
    line-height: 42px;
  }
`;

const Heading3 = styled('h3')`
font-family: ${fontFamily.baseFont};
font-weight: ${fontWeight.bold};
  font-size: 22px;
  color: #000000;
  letter-spacing: 0;
  line-height: 24px;
`;

const PrimaryButtonContainer = styled('div')`
  text-align: center;
  margin-top: 40px;
  @media (min-width: 768px) {
    text-align: left;
  }
`;

const PrimaryButton = styled('button')`
  color: #fff;
  background-color: rgba(69, 119, 219, 1);
  border-color: rgba(69, 119, 219, 1);
  border-radius: 0;
  outline: 0;
  font-size: 17px;
  font-weight: bold;
  border-width: 2px;
  min-height: 45px;
  line-height: 25px;
  padding: 8px 30px;
  cursor: pointer;
  font-family: ${fontFamily.baseFont};
  &:hover {
    color: #000;
    background-color: transparent;
    border-color: #000;
  }
  &:focus {
    box-shadow: none;
    outline: 0;
  }
  &:active {
    color: #000 !important;
    background-color: transparent !important;
    border-color: #000 !important;
  }
  &.uppercase {
    text-transform: uppercase;
  }
`;

const ProductPagePrimaryButton = styled('a')`
  text-decoration: none;
  color: #fff;
  background-color: rgba(69, 119, 219, 1);
  border-color: rgba(69, 119, 219, 1);
  border-radius: 0;
  outline: 0;
  font-size: 17px;
  font-weight: bold;
  border-width: 2px;
  min-height: 45px;
  line-height: 25px;
  padding: 12px 30px;
  cursor: pointer;
  font-family: ${fontFamily.baseFont};
  &:hover {
    color: #000;
    background-color: transparent;
    border-color: #000;
  }
  &:focus {
    box-shadow: none;
    outline: 0;
  }
  &:active {
    color: #000 !important;
    background-color: transparent !important;
    border-color: #000 !important;
  }
  &.uppercase {
    text-transform: uppercase;
  }
`;

export class ScienceOfRetinoids extends React.Component {
  render() {
    return (
      <Wrapper>
        <Container>
          <TitleWrapper>
            <React.Fragment>
              <Heading2 bold>The Science of Retinoids</Heading2>
            </React.Fragment>
          </TitleWrapper>
          <ScienceWrapper>
            <Row>
              <Col md={6}>
                <ScienceInner>
                  <ScienceContent>
                    <React.Fragment>
                      <Heading3>Wrinkles</Heading3>
                      <p>
                        The less collagen your skin has, the less water it retains, which causes
                        structural folds (i.e., wrinkles and lines).
                      </p>
                    </React.Fragment>
                  </ScienceContent>
                  <ScienceImageWrapper>
                    <LazyLoad offset={30} once>
                      <img src={acneImg} />
                    </LazyLoad>
                  </ScienceImageWrapper>
                </ScienceInner>
                <ScienceInner>
                  <ScienceContent>
                    <React.Fragment>
                      <Heading3>Pores</Heading3>
                      <p>
                        Retinoids can help reduce the appearance of enlarged pores by clearing the
                        cellular debris around them — making them appear smaller.
                      </p>
                    </React.Fragment>
                  </ScienceContent>
                  <ScienceImageWrapper>
                    <LazyLoad offset={30} once>
                      <img src={poresImg} />
                    </LazyLoad>
                  </ScienceImageWrapper>
                </ScienceInner>
                <ScienceInner>
                  <ScienceContent>
                    <React.Fragment>
                      <Heading3>Pigmentation</Heading3>
                      <p>
                        Retinoids can improve the pigmentation of freckles, melasma, age spots, and
                        dark spots by dispersing and exfoliating melanin granules, which protect
                        skin from sun damage, in the deepest layer of our skin
                      </p>
                    </React.Fragment>
                  </ScienceContent>
                  <ScienceImageWrapper>
                    <LazyLoad offset={30} once>
                      <img src={pigmentationImg} />
                    </LazyLoad>
                  </ScienceImageWrapper>
                </ScienceInner>
              </Col>
              <Col md={6}>
                <ScienceInner>
                  <ScienceContent>
                    <React.Fragment>
                      <Heading3>Acne</Heading3>
                      <p>
                        Acne may be classified into 2 types: noninflammatory, which is characterized
                        by comedones, and inflammatory, which predominantly consists of papules and
                        pustules.
                      </p>
                      <p>
                        Retinoids decrease comedones and their precursor, thereby primarily
                        decreasing noninflammatory acne but also causing some reduction of
                        inflammatory acne.
                      </p>
                    </React.Fragment>
                  </ScienceContent>
                  <ScienceImageWrapper>
                    <LazyLoad offset={30} once>
                      <img src={wrinklesImg} />
                    </LazyLoad>
                  </ScienceImageWrapper>
                </ScienceInner>
                <ScienceInner>
                  <ScienceContent>
                    <React.Fragment>
                      <Heading3>Rough Skin</Heading3>
                      <p>
                        Tactile roughness on the skin is attributed to the thickness of the
                        outermost layer of the epidermis, which consists of dead cells and a lack of
                        glycosoaminoglycan (GAG) content. GAG promotes the ability of collagen and
                        elastin fibers to retain moisture.
                      </p>
                      <p>
                        Retinoids can improve rough skin by reducing the outer layer of dead skin
                        cells and increasing the presence of GAG.
                      </p>
                    </React.Fragment>
                  </ScienceContent>
                  <ScienceImageWrapper>
                    <LazyLoad offset={30} once>
                      <img src={roughSkinImg} />
                    </LazyLoad>
                  </ScienceImageWrapper>
                  {this.props.isHomepage ? (
                    <BtnWrap>
                      <StandardBlueButton active={true}
                        onClick={_.partial(this.props.goToProduct, 'science')}
                      >
                        Buy retinoid
                      </StandardBlueButton>
                    </BtnWrap>
                  ) : (
                      <PrimaryButtonContainer>
                        <StandardBlueButtonHref active={true} href="#">
                          Buy now
                        </StandardBlueButtonHref>
                      </PrimaryButtonContainer>
                    )}
                </ScienceInner>
              </Col>
            </Row>
          </ScienceWrapper>
        </Container>
      </Wrapper>
    );
  }
}
