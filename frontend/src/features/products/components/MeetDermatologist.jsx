import React from 'react';
import styled from 'react-emotion';
import LazyLoad from 'react-lazyload';
import { Row, Col, Container } from 'reactstrap';
import { fontFamily, fontWeight } from 'src/variables';

const DrImage = 'https://d17yyftwrkmnyz.cloudfront.net/dr_lana_kashlan_1.jpg';

const Wrapper = styled('div')``;

const DoctorBlock = styled('div')`
    text-align: center;
    background-color: #faf8f7;
    padding: 80px 0;
    @media (max-width: 768px) {
        padding: 80px 0 0;
    }
    .container {
        max-width: 800px;
        margin: 0 auto;
    }
`;

const DocImage = styled('img')`
    border-radius: 50%;
`;

const DocInfoWrapper = styled('div')`
    @media (max-width: 768px) {
        text-align: center;
    }
`;

const DocName = styled('div')`
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    font-size: 21px;
    color: #000000;
    letter-spacing: 0;
    margin-bottom: 20px;
    @media (max-width: 768px) {
        text-align: center;
        margin: 15px 0px;
    }
`;

const AboutDoc = styled('div')`
    text-align: left;
    p {
        margin-bottom: 20px;
    }
    @media (min-width: 768px) {
        padding-right: 35px;
    }
`;

const QuestionsBlock = styled('div')`
    padding-top: 40px;
    padding-bottom: 40px;
    @media (max-width: 768px) {
        padding: 30px 0 0;
    }
    .container {
        max-width: 800px;
        margin: 0 auto;
        @media (max-width: 768px) {
            max-width: 100%;
        }
    }
`;

const Question = styled('div')`
    max-width: 320px;
    padding: 10px 10px 0px 10px;
    background: #ffffff;
    border: 1px solid #000000;
    box-shadow: 0 9px 15px 0 rgba(0, 0, 0, 0.1);
    margin: 0 auto 50px;
    @media (max-width: 400px) {
        max-width: 100%;
        margin: 0 auto 50px;
    }
`;

const QuestionImageWrap = styled('div')`
    img {
        max-width: 100%;
    }
`;

const QuestionInfo = styled('div')`
    font-family: ${fontFamily.baseFont};
    font-size: 16px;
    color: #000000;
    line-height: 18px;
    letter-spacing: 0;
    margin-top: 10px;
    a {
        color: #000000;
        text-decoration: underline;
        &:hover {
            color: #000000;
        }
    }
`;

const AnswerTitle = styled('strong')`
    margin-bottom: 10px;
    display: block;
`;

const LearnMore = styled('h5')`
    text-decoration: underline;
    cursor: pointer;
    font-size: 16px;
    line-height: 18px;
`;

const QuestionContainer = styled('div')`
    cursor: pointer;
`;

export class MeetDermatologist extends React.Component {
    state = {
        retinoidNewbie: false,
        whyPersonalize: false,
    };

    onLearnMoreClick = question => {
        this.setState(prevState => ({
            [question]: !prevState[question],
        }));
    };

    render() {
        const { retinoidNewbie, whyPersonalize } = this.state;
        return (
            <Wrapper>
                <QuestionsBlock>
                    <Container>
                        <Row className="justify-content-center">
                            <Col md={6}>
                                {!retinoidNewbie && (
                                  <Question>
                                        <QuestionImageWrap>
                                            <LazyLoad height={ 50 } offset={ 30 } once>
                                                <img
                                                    src="https://d17yyftwrkmnyz.cloudfront.net/newbie.jpg"
                                                    alt="if you're a newbie"
                                                />
                                            </LazyLoad>
                                        </QuestionImageWrap>
                                        <QuestionInfo>
                                            <Row>
                                                <Col className="text-left">Retinoid newbie?</Col>
                                                <Col className="text-right">
                                                    <LearnMore
                                                        onClick={_.partial(
                                                            this.onLearnMoreClick,
                                                            'retinoidNewbie',
                                                        )}
                                                    >
                                                        Click here
                                                    </LearnMore>
                                                </Col>
                                            </Row>
                                        </QuestionInfo>
                                    </Question>
                                )}
                                { retinoidNewbie && (
<Question>
                                        <QuestionContainer
                                            onClick={_.partial(
                                                this.onLearnMoreClick,
                                                'retinoidNewbie',
                                            )}
                                        >
                                            <AnswerTitle>Retinoid newbie?</AnswerTitle>
                                            <p>
                                                Board-certified doctors will get to know your skin
                                                and start you off with an appropriate strength level
                                                so that even if you&#x27;re new to a retinoid, your
                                                skin learns to tolerate over time. And when they
                                                think you&#x27;re ready, they'll upgrade your
                                                strength. They tailor your retinoid so that whether
                                                you&#x27;re a retinoid newbie or veteran, you get a
                                                great retinoid experience.
                                            </p>
                                        </QuestionContainer>
                                    </Question>
                                )}
                            </Col>
                            <Col md={6}>
                                {!whyPersonalize && (
                                    <Question>
                                        <QuestionImageWrap>
                                            <LazyLoad height={ 50 } offset={ 30 } once>
                                                <img
                                                    src="https://d17yyftwrkmnyz.cloudfront.net/sensitive.jpg"
                                                    alt="if you have sensitive or dry skin"
                                                />
                                            </LazyLoad>
                                        </QuestionImageWrap>
                                        <QuestionInfo>
                                            <Row>
                                                <Col className="text-left">Sensitive or dry?</Col>
                                                <Col className="text-right">
                                                    <LearnMore
                                                        onClick={_.partial(
                                                            this.onLearnMoreClick,
                                                            'whyPersonalize',
                                                        )}
                                                    >
                                                        Click here
                                                    </LearnMore>
                                                </Col>
                                            </Row>
                                        </QuestionInfo>
                                    </Question>
                                )}
                                {whyPersonalize && (
                                    <Question>
                                        <QuestionContainer
                                            onClick={_.partial(
                                                this.onLearnMoreClick,
                                                'whyPersonalize',
                                            )}
                                        >
                                            <AnswerTitle>Why personalize?</AnswerTitle>
                                            <p>
                                                After getting to know your skin, board-certified
                                                doctors can give you a better experience with
                                                tailored retinoids. From sensitive to resistant
                                                skin, whether you&#x27;re a retinoid rookie or not,
                                                they got you. Understanding that every skin is
                                                different, they provide you with an appropriate
                                                strength level for your specific skin type. All of
                                                this is so that you get a great retinoid experience
                                                over time.
                                            </p>
                                        </QuestionContainer>
                                    </Question>
                                )}
                            </Col>
                        </Row>
                    </Container>
                </QuestionsBlock>
                <DoctorBlock>
                    <Container>
                        <Row>
                            <Col sm={12} md={6}>
                                <div>
                                    <LazyLoad height={ 50 } offset={ 30 } once>
                                        <DocImage src={ DrImage }/>
                                    </LazyLoad>
                                </div>
                            </Col>
                            <Col sm={12} md={6}>
                                <AboutDoc>
                                    <DocInfoWrapper>
                                        <DocName>Meet Dr. Lana Kashlan</DocName>
                                        <p className="large">
                                            Dr. Kashlan is a board-certified dermatologist specializing
                                            in cosmetic dermatology.
                                        </p>
                                        <p className="large">
                                            She is an active member of the American Academy of
                                            Dermatology, the American Society for Dermatologic Surgery,
                                            the American Society of Laser Medicine and Surgery, and the
                                            Women’s Dermatologic Society.
                                        </p>
                                    </DocInfoWrapper>
                                </AboutDoc>
                            </Col>
                        </Row>
                    </Container>
                </DoctorBlock>
            </Wrapper>
        );
    }
}
