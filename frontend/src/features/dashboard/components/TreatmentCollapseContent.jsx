import React from 'react';
import { Collapse } from 'reactstrap';
import styled from 'react-emotion';
import scrollToComponent from 'react-scroll-to-component';

import plusIcon from 'src/assets/images/bluePlusIcon.svg';
import minusIcon from 'src/assets/images/minusCircle.svg';

import { fontSize, colors, breakpoints, fontFamily } from 'src/variables';

const StyledCollapse = styled(Collapse)`
  transition: height 1s ease-in-out !important;
`;

const TreatmentComponentWrapper = styled.div`
  border-top: 1px solid ${colors.black};
  :last-child {
    border-bottom: 1px solid ${colors.black};
  }
`;

const TreatmentComponent = styled.div`
  display: flex;
  justify-content: space-between;
  height: 6rem;

  ${breakpoints.xs} {
    height: 4rem;
  }
`;

const ComponentTitle = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: ${fontSize.biggest};
  height: fit-content;
  margin: auto 0;

  ${breakpoints.xs} {
    font-size: ${fontSize.big};
  }
`;

const StyledIcon = styled.svg`
  cursor: pointer;
  background-image:  url('${props => props.iconSrc}') ;
  width: ${props => (props.isActive ? '2rem' : '1.8rem')};
  height: ${props => (props.isActive ? '2rem' : '1.8rem')};
  background-repeat: no-repeat;
  overflow: initial;
  margin: auto 0;
`;

export const TreatmentCollapseContent = ({ components, toggleSection, activeSection }) => {
  const refs = components.reduce((acc, value) => ({ ...acc, [value.id]: React.createRef() }), {});

  const handleScrollToElement = id => {
    scrollToComponent(refs[id].current, {
      offset: -60,
      align: 'top',
    });
  };

  return (
    <div>
      {components.map(treatmentComponent => (
        <TreatmentComponentWrapper key={treatmentComponent.id} ref={refs[treatmentComponent.id]}>
          <TreatmentComponent onClick={() => toggleSection(treatmentComponent.id)}>
            <ComponentTitle>{treatmentComponent.name}</ComponentTitle>
            <StyledIcon
              isActive={activeSection === treatmentComponent.id}
              iconSrc={activeSection === treatmentComponent.id ? minusIcon : plusIcon}
            />
          </TreatmentComponent>
          <StyledCollapse
            isOpen={activeSection === treatmentComponent.id}
            timeout={{ enter: 1000, exit: 1000 }}
            onEntered={() => handleScrollToElement(treatmentComponent.id)}
          >
            {treatmentComponent.component}
          </StyledCollapse>
        </TreatmentComponentWrapper>
      ))}
    </div>
  );
};
