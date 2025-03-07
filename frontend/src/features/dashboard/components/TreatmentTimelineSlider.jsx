import React from 'react';
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators } from 'reactstrap';
import styled from 'react-emotion';

import leftArrowIcon from 'src/assets/images/left-arrow1.svg';
import rightArrowIcon from 'src/assets/images/right-arrow2.svg';

import {
  ContentHeader,
  ContentSubheading,
  ColumnHeaderWrapper,
  StepNumber,
  ContentIcon,
} from 'src/features/dashboard/shared/styles';
import { colors } from 'src/variables';

const CarouselWrapper = styled.div`
  position: relative;
  height: ${props => (props.withExtraHeader ? '24rem' : '11rem')};

  .carousel-inner {
    height: fit-content;
  }
`;

const CarouselSlide = styled(CarouselItem)`
  margin-top: ${props => !props.withExtraHeader && '3rem'};
  margin-bottom: ${props => props.withExtraHeader && '3rem'};
  height: ${props => (props.withExtraHeader ? '21rem' : '100%')};
`;

const Indicator = styled(CarouselIndicators)`
  top: ${props => !props.withExtraHeader && 0};
  justify-content: ${props => (props.withExtraHeader ? 'center' : 'space-between !important')};
  margin-left: 0 !important;
  margin-right: 0 !important;
  height: fit-content;
  align-items: center;
  z-index: 8 !important;

  li {
    background-color: ${colors.clear} !important;
    border: 2px solid ${colors.darkModerateBlue} !important;
    width: 13px !important;
    height: 13px !important;
    border-radius: 50%;
    ::before {
      display: flex !important;
    }
  }
  .active {
    background-color: ${colors.darkModerateBlue} !important;
    width: ${props => (props.withExtraHeader ? '13px !important' : '30px !important')};
    height: ${props => (props.withExtraHeader ? '13px !important' : '30px !important')};
  }
`;

const IndicatorsLine = styled.div`
  display: ${props => props.withExtraHeader && 'none'};
  position: absolute;
  top: ${props => !props.withExtraHeader && '15px'};
  left: 4px;
  z-index: 1;
  width: 96%;
  height: 1px;
  border-top: 2px solid ${colors.darkModerateBlue};
`;

const StyledCarouselControl = styled(CarouselControl)`
  display: ${props => !props.withExtraHeader && 'none !important'};
  bottom: 1.75rem !important;
  height: 10px;
  top: auto !important;
  .carousel-control-next-icon{
    background-image:  url('${props => props.rightArrow}')!important ;
  }
  .carousel-control-prev-icon {
    background-image:  url('${props => props.leftArrow}')!important ;
  }
`;

class TreatmentSliderContainer extends React.Component {
  state = {
    activeIndex: 0,
    isAnimating: false,
  };

  updateCarouselState = (state, value) => {
    this.setState(prevState => {
      if (prevState[state] !== value) {
        return { [state]: value };
      }
    });
  };

  next = () => {
    const { carouselSlides } = this.props;
    const { activeIndex } = this.state;
    if (this.state.isAnimating) return;
    const nextIndex = activeIndex === carouselSlides.length - 1 ? 0 : activeIndex + 1;
    this.updateCarouselState('activeIndex', nextIndex);
  };

  previous = () => {
    const { carouselSlides } = this.props;
    if (this.state.isAnimating) return;
    const prevIndex =
      this.state.activeIndex === 0 ? carouselSlides.length - 1 : this.state.activeIndex - 1;
    this.updateCarouselState('activeIndex', prevIndex);
  };

  goToIndex = newIndex => {
    if (this.state.isAnimating) return;
    this.updateCarouselState('activeIndex', newIndex);
  };

  triggerAnimation = value => {
    this.updateCarouselState('isAnimating', value);
  };

  render() {
    const { carouselSlides, withExtraHeader } = this.props;

    const slides = carouselSlides.map(element => (
      <CarouselSlide
        withExtraHeader={withExtraHeader}
        onExiting={() => this.triggerAnimation(true)}
        onExited={() => this.triggerAnimation(false)}
        key={element.content}
      >
        {withExtraHeader && (
          <ColumnHeaderWrapper>
            <StepNumber>{element.number}</StepNumber>
            <div>
              {element.icons.map(stepIcon => (
                <ContentIcon key={stepIcon} src={stepIcon} />
              ))}
            </div>
          </ColumnHeaderWrapper>
        )}
        <ContentHeader color={colors.darkModerateBlue} smallText noMargin>
          {element.title}
        </ContentHeader>
        <ContentSubheading>{element.content}</ContentSubheading>
      </CarouselSlide>
    ));

    return (
      <CarouselWrapper withExtraHeader={withExtraHeader}>
        <IndicatorsLine withExtraHeader={withExtraHeader} />
        <Carousel activeIndex={this.state.activeIndex} next={this.next} previous={this.previous}>
          <Indicator
            withExtraHeader={withExtraHeader}
            items={carouselSlides}
            activeIndex={this.state.activeIndex}
            onClickHandler={this.goToIndex}
          />
          {slides}
          <StyledCarouselControl
            withExtraHeader={withExtraHeader}
            leftArrow={leftArrowIcon}
            direction="prev"
            directionText="Previous"
            onClickHandler={this.previous}
          />
          <StyledCarouselControl
            withExtraHeader={withExtraHeader}
            direction="next"
            directionText="Next"
            onClickHandler={this.next}
            rightArrow={rightArrowIcon}
          />
        </Carousel>
      </CarouselWrapper>
    );
  }
}

export const TreatmentSlider = TreatmentSliderContainer;
