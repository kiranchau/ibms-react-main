import React from 'react'
import '../../SCSS/button.scss';

const Button = (props) => {
  return <button 
  className={`${'button'} ${props.className}`} 
  type={props.type || 'button'}
    disabled={props?.disabled ? props?.disabled : false}
  onClick={props.onClick}>{props.children}
  
  </button>
}

export default Button;