import React from 'react';

import { TreatmentPlanHeader } from 'src/features/dashboard/components/TreatmentPlanHeader';
import { TreatmentCollapseContent } from 'src/features/dashboard/components/TreatmentCollapseContent';
import { TreatmentFormula } from 'src/features/dashboard/components/TreatmentFormula';
import { TreatmentHowToUse } from 'src/features/dashboard/components/TreatmentHowToUse';
import { TreatmentWhatToExpect } from 'src/features/dashboard/components/TreatmentWhatToExpect';
import { TreatmentRoutine } from 'src/features/dashboard/components/TreatmentRoutine';
import { TreatmentWhatToAvoid } from 'src/features/dashboard/components/TreatmentWhatToAvoid';
import {
  BoxContainer,
  BoxHeaderWrapper,
  BoxHeader,
  BoxContentWrapper,
} from 'src/features/dashboard/shared/styles';
import UserFaqCard from 'src/features/dashboard/components/UserFaqCard';

class TreatmentPlan extends React.Component {
  state = {
    activeSection: '',
    isPopoverOpen: false,
  };

  toggleCollapse = value => {
    this.setState(prevState => {
      if (prevState.activeSection !== value) {
        return { activeSection: value };
      }
      return { activeSection: '' };
    });
  };

  onHover = () => {
    this.setState({
      isPopoverOpen: true,
    });
  };

  onHoverLeave = () => {
    this.setState({
      isPopoverOpen: false,
    });
  };

  handleIconClick = () => {
    this.setState(prevState => ({
      isPopoverOpen: !prevState.isPopoverOpen,
    }));
  };

  render() {
    const { user, rxSubscription } = this.props;
    const userFirstName = user && user.firstName;
    const treatmentComponents = [
      {
        id: 1,
        name: 'Formula',
        component: (
          <TreatmentFormula
            rxSubscription={rxSubscription}
            onHover={this.onHover}
            onHoverLeave={this.onHoverLeave}
            handleIconClick={this.handleIconClick}
            isPopoverOpen={this.state.isPopoverOpen}
          />
        ),
      },
      { id: 2, name: 'How to use', component: <TreatmentHowToUse /> },
      { id: 3, name: 'What to expect', component: <TreatmentWhatToExpect /> },
      { id: 4, name: 'Derm-approved routine', component: <TreatmentRoutine /> },
      { id: 5, name: 'What to avoid', component: <TreatmentWhatToAvoid /> },
    ];

    return (
      <React.Fragment>
        <TreatmentPlanHeader userFirstName={userFirstName} user={user} />
        <TreatmentCollapseContent
          components={treatmentComponents}
          toggleSection={this.toggleCollapse}
          activeSection={this.state.activeSection}
        />
        <BoxContainer style={{ marginTop: '2rem' }}>
          <BoxHeaderWrapper>
            <BoxHeader>Popular FAQ</BoxHeader>
          </BoxHeaderWrapper>
          <BoxContentWrapper>
            <UserFaqCard />
          </BoxContentWrapper>
        </BoxContainer>
      </React.Fragment>
    );
  }
}

export const TreatmentPlanContainer = TreatmentPlan;
