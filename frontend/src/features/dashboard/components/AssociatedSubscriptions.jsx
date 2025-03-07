import React from 'react';
import {
    HeaderWrapper,
    HeaderContent,
    BreakLine,
} from 'src/features/dashboard/shared/myAccountStyles';

export const AssociatedSubscriptions = props => {
  const { associatedSubscriptions } = props;

  const associatedSubscription = (subscription) => {
    const description = `${subscription.productName} - ${subscription.frequency} Months`;
    return (
      <p>{description}</p>
    )
  }

  return (
    <React.Fragment>
      {associatedSubscriptions && associatedSubscriptions.length > 0 && (
        <React.Fragment>
          <HeaderWrapper>
            <HeaderContent>Associated subscriptions</HeaderContent>
            <BreakLine />
          </HeaderWrapper>
            {associatedSubscriptions.map((subscription) => (
          <React.Fragment>
            {associatedSubscription(subscription)}
          </React.Fragment>
        ))}
        </React.Fragment>
    )}
    </React.Fragment>
  );
};
