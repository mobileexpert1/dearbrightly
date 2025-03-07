import React, { useState, useEffect } from 'react';

import {
  PlanStatusWrapper,
  PlanStatus,
  PlanStatusIndicatorWrapper,
  PlanStatusIndicator,
} from 'src/features/dashboard/shared/styles';
import { colors } from 'src/variables';
import {
  isSubscriptionActive,
} from 'src/features/dashboard/helpers/userStatuses';

export const StatusIndicator = (props) => {

  const [status, setStatus] = useState("")
  const [color, setColor] = useState(null)
  const [containerColor, setContainerColor] = useState(null)

  useEffect(() => {
    const { subscription } = props
    const subscriptionActive = isSubscriptionActive(subscription);

    if (subscription && subscriptionActive) {
      setStatus("Active")
      setColor(colors.frenchPass)
      setContainerColor(colors.frenchPassOpacity)
    } else if (subscription && !subscriptionActive) {
      setStatus("Cancel")
      setColor(colors.mulberry)
      setContainerColor(colors.mulberryOpacity)
    } else {
      setStatus("Inactive")
      setColor(colors.mulberry)
      setContainerColor(colors.mulberryOpacity)
    }
  }, [props])

  if (!status) return <span />

  return (
    <PlanStatusWrapper>
      <PlanStatus>{status === "Cancel" ? "" : status}</PlanStatus>
      <PlanStatusIndicatorWrapper color={containerColor}>
        <PlanStatusIndicator color={color} />
      </PlanStatusIndicatorWrapper>
    </PlanStatusWrapper>
  )
};
