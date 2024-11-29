import React from 'react';
import '../../../App.scss';

const TableBtn = (props) => {
  return (   <div 
  className={`${'TBtn'} ${props.className}`}
   onClick={props.onclick}
   type={props.type || 'button'}
   >
    {props.children}
   </div>
  )
}

export default TableBtn;
