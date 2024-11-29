import React from 'react';
import "../../SCSS/popups.scss";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

const Input = ({label, id, error, ...props}) => {
    return (
        <>
            <FloatingLabel htmlFor={id} label={label}>
                <Form.Control id={id} {...props} />
            </FloatingLabel>
            <p className="text-danger">{error}</p>
        </>
        
    );
}

export default Input;
