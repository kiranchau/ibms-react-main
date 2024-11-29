// Input.js
import React from 'react';

const Input = ({ label, id, type, name, onChange, onBlur, errorText }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-control ${errorText ? 'is-invalid' : ''}`}
      />
      {errorText && <div className="invalid-feedback">{errorText}</div>}
    </div>
  );
};

export default Input;
