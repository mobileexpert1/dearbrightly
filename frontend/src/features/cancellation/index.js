import React, { useState } from 'react';
import Cancel from 'src/features/cancellation/Cancel';
import Options from 'src/features/cancellation/Options'
import CustomModal from 'src/components/Modal'
import Pause from './Pause';

const Cancellation = (props) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showOverlay, setShowOverlay] = useState(false)

  const onOptionSelected = (option) => {
    setSelectedOption(option)
  }

  const displayOverlay = (display) => {
    setShowOverlay(display)
  }

  const onBackPressed = () => {
    setSelectedOption(null)
  }

  return (
    <CustomModal onClose={props.onClose} showOverlay={showOverlay} overlayText="We're processing your request. Please don't navigate away or close this window until your request is complete.">
      {selectedOption === null && (
        <Options
          onClose={props.onClose}
          onOptionSelected={onOptionSelected}
        />
      )}
      {selectedOption === 1 && (
        <Cancel
          displayOverlay={displayOverlay}
          onClose={props.onClose}
          onBackPressed={onBackPressed}
          {...props}
        />
      )}
      {selectedOption === 2 && (
        <Pause
          displayOverlay={displayOverlay}
          onClose={props.onClose}
          {...props}
        />
      )}
    </CustomModal>
  )

};


export default Cancellation;
