import React from 'react';
import '../../SCSS/inputField.scss'

const SelectField = (props) => {
  return (
    <div className={`${'inputs selects'} ${props.className}`} >
    {props.children}
</div>
  );
}

export default SelectField;
