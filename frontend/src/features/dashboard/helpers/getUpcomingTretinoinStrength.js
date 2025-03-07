export const getUpcomingTretinoinStrength = subscription => {
  return subscription && subscription.currentTreatment && subscription.upcomingTreatment
    ? subscription.currentTreatment.tretinoinStrength !==
      subscription.upcomingTreatment.tretinoinStrength
      ? `${subscription.upcomingTreatment.tretinoinStrength}%`
      : null
    : null;
};
