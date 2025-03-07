import React from 'react';
import classnames from 'classnames';

const Checkbox = (props) => {
  return (
    <div className="button-cover">
      <div
        style={{
          float: "right"
        }}
        className={classnames('button', {
          'check': props.checked,
          'uncheck': !props.checked,
        })}
        id="button-check">
        <input type="checkbox" checked={!props.checked} onChange={props.onChange ? props.onChange : () => { }} className="checkbox" />
        <div className="knobs">
          <span></span>
        </div>
        <div class="layer"></div>
      </div>
    </div>
  );
}

export default Checkbox;
