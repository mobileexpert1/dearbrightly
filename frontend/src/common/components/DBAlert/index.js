import React from 'react';
import Alert from 'reactstrap/lib/Alert';

const DBAlert = ({ body, targetWord, actionRoute, alertColor, onToggle = () => { } }) => {

  const parseText = () => {
    const split = body.split(' ')
    const temp = split.map((txt, i) => {
      if (txt.includes(targetWord) && actionRoute) {
        return <span key={i}><a target="_self" href={actionRoute}>{txt}</a>{' '}</span>
      }
      return <span key={i}>{txt}{' '}</span>
    })
    return temp
  }



  return (
    <Alert color={alertColor} isOpen={true} toggle={onToggle}>
      {parseText(body)}
    </Alert>
  );
};

export default DBAlert;
