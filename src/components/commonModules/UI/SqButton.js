import React from 'react';
import '../../SCSS/sqbutton.scss';

const SqButton = (props) => {
  return <div 
  className={`${'sqbutton'} ${props.className}`} 
  type={props.type || 'button'}
  onClick={props.onClick}>
    {props.children}
  </div>
}

export default SqButton;
