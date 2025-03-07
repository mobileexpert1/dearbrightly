import React, { Component } from 'react';
import styled from 'react-emotion';
import { fontFamily, fontWeight } from 'src/variables';

const Icon1 = 'https://d17yyftwrkmnyz.cloudfront.net/timeline_icon_1.png';
const Icon2 = 'https://d17yyftwrkmnyz.cloudfront.net/timeline_icon_2.png';
const Icon3 = 'https://d17yyftwrkmnyz.cloudfront.net/timeline_icon_3.png';
const Icon4 = 'https://d17yyftwrkmnyz.cloudfront.net/timeline_icon_4.png';

const TimelineSection = styled('section')`
    padding: 50px 0px 0px;
    height: 760px;

    @media (max-width: 768px) {
        margin: 25px 0px;
    }
    
    @media (min-width: 768px) {
        background: rgba(250, 248, 247, 1);
        margin-bottom: 90px;
    }

    .timeline-block {
        background: rgba(250, 248, 247, 1);
        @media (max-width: 768px) {
            padding: 20px;
        }
    }

    .timeline-wrapper {
        margin-top: 40px;
        display: flex;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        .title-block {
            text-align: center;
            margin-top: 35px;
        }
        .timeline-text-div {
            display: flex;
            -webkit-box-pack: justify;
            -webkit-justify-content: space-between;
            -ms-flex-pack: justify;
            justify-content: space-between;
            text-align: center;
            -webkit-flex-direction: column;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            margin-right: 30px;
            margin-left: 30px;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-align: end;
            -webkit-align-items: flex-end;
            -ms-flex-align: end;
            align-items: flex-end;
            max-height: 440px;

            .timeline-title {
                text-align: center;
                width: auto;
                height: 46%;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;

                &.timeline-1 {
                    display: flex;
                    -ms-flex-pack: distribute;
                    justify-content: space-around;
                    width: auto;
                    height: 46%;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -webkit-flex-direction: column;
                    -ms-flex-direction: column;
                    flex-direction: column;
                }

                &.timeline-2 {
                    display: flex;
                    -ms-flex-pack: distribute;
                    justify-content: space-around;
                    width: auto;
                    height: 27%;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -webkit-flex-direction: column;
                    -ms-flex-direction: column;
                    flex-direction: column;
                }

                .source-title {
                    font-size: 12px;
                    color: #696969;
                    font-family: ${fontFamily.baseFont};
                    margin-bottom: 0;
                    .timeline-icon {
                        height: 30px;
                        width: 30px;
                        display: inline-block;
                        vertical-align: middle;
                        margin-right: 8px;

                        &.time-icon-1 {
                            background: url(${Icon1}) center no-repeat;
                            background-size: 24px;
                        }
                        &.time-icon-2 {
                            background: url(${Icon2}) center no-repeat;
                            background-size: 26px;
                        }
                        &.time-icon-3 {
                            background: url(${Icon3}) center no-repeat;
                            background-size: 24px;
                        }
                        &.time-icon-4 {
                            background: url(${Icon4}) center no-repeat;
                            background-size: 22px;
                        }
                    }
                }
            }
        }

        .timeline {
            display: flex;
            -webkit-box-pack: justify;
            -webkit-justify-content: space-between;
            -ms-flex-pack: justify;
            justify-content: space-between;
            background-color: #000;
            height: 440px;
            width: 5px;
            margin-top: 0;
            margin-bottom: 0;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-align: center;
            -webkit-align-items: center;
            -ms-flex-align: center;
            align-items: center;

            .timeline-dot-wrapper {
                display: flex;
                -webkit-justify-content: space-around;
                -ms-flex-pack: distribute;
                justify-content: space-around;
                -webkit-box-align: center;
                -webkit-align-items: center;
                -ms-flex-align: center;
                align-items: center;

                width: 8px;
                height: 46%;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -webkit-flex-direction: column;
                -ms-flex-direction: column;
                flex-direction: column;

                &.time-dot-2 {
                    width: 27%;
                }

                .timeline-dot {
                    height: 15px;
                    width: 15px;
                    border: 3px solid #000;
                    border-radius: 50%;
                    background: rgba(250, 248, 247, 1);
                }
            }
        }
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
export const Timeline = props => {
    return (
        <TimelineSection className="results-timeline">
            <div className="container">
                <div className="timeline-block">
                    <div className="title-block">
                        <Heading2 className="common-title">Results Timeline</Heading2>
                        <p className="text-center">This is a rough timeline as results will depend on one's skin type and consistency of use.</p>
                    </div>

                    <div className="timeline-wrapper">
                        <div className="timeline-text-div">
                            <div className="timeline-title timeline-1">
                                <h4 className="source-title small">
                                    <i className="timeline-icon time-icon-1" />
                                    Uneven skin tone
                                </h4>
                                <h4 className="source-title small">
                                    <i className="timeline-icon time-icon-2" />
                                    Discoloration
                                </h4>
                            </div>
                            <div className="timeline-title timeline-2">
                                <h4 className="source-title small">
                                    <i className="timeline-icon time-icon-3" />
                                    Brown spots
                                </h4>
                            </div>
                            <div className="timeline-title timeline-2">
                                <h4 className="source-title small">
                                    <i className="timeline-icon time-icon-4" />
                                    Fine wrinkles
                                </h4>
                            </div>
                        </div>
                        <div className="timeline">
                            <div className="timeline-dot-wrapper">
                                <div className="timeline-dot" />
                                <div className="timeline-dot" />
                            </div>
                            <div className="timeline-dot-wrapper time-dot-2">
                                <div className="timeline-dot" />
                            </div>
                            <div className="timeline-dot-wrapper time-dot-2">
                                <div className="timeline-dot" />
                            </div>
                        </div>
                        <div className="timeline-text-div right">
                            <div className="timeline-title timeline-1 right">
                                <h4 className="source-title small body-text-1">3 - 4 weeks</h4>
                            </div>
                            <div className="timeline-title timeline-2">
                                <h4 className="source-title small body-text-1 shifted-down">
                                    6-8 weeks
                                </h4>
                            </div>
                            <div className="timeline-title timeline-2">
                                <h4 className="source-title small body-text-1 shifted-down">
                                    3-6 months
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TimelineSection>
    );
};
