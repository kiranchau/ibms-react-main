import React from 'react';
import '../../SCSS/inputField.scss'

const InputField = (props) => {
    return (
        <div className={`${'inputs'} ${props.className}`} >
            <input 
            type={props.type} 
            placeholder={props.placeholder}required />
            <label>{props.children}</label>
        </div>
    );
}

export default InputField;
