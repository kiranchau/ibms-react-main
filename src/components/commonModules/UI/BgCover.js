import React from 'react';
import '../../SCSS/card.scss';

const BgCover = (props) => {
  return (
    <div className={`${'bgCover'} ${props.className}`}>
      {props.children}
    </div>
  )
}

export default BgCover;
