import React from "react";
import useInput from "../hooks/use-input";
import Button from '../commonModules/UI/Button';
import Form from 'react-bootstrap/Form';
import {Link} from 'react-router-dom';

const isNotEmpty = (value) => value.trim() !== "";
const isEmail = (value) => value.includes("@");

const SimpleInput = (props) => {
  // const {
  //   value: firstNameValue,
  //   isValid: firstNameIsValid,
  //   hasError: firstNameHasError,
  //   valueChangeHandler: firstNameChangeHandler,
  //   inputBlurHandler: firstNameBlurHandler,
  //   reset: resetFirstName,
  // } = useInput(isNotEmpty);
  // const {
  //   value: lastNameValue,
  //   isValid: lastNameIsValid,
  //   hasError: lastNameHasError,
  //   valueChangeHandler: lastNameChangeHandler,
  //   inputBlurHandler: lastNameBlurHandler,
  //   reset: resetLastName,
  // } = useInput(isNotEmpty);
  const {
    value: passwordValue,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    valueChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
    reset: resetPassword,
  } = useInput(isNotEmpty);
  const {
    value: emailValue,
    isValid: emailIsValid,
    hasError: emailHasError,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    reset: resetEmail,
  } = useInput(isEmail);


  let formIsValid = false;

  if (passwordIsValid && emailIsValid) {
    formIsValid = true;
  }
  // if (firstNameIsValid && lastNameIsValid && emailIsValid) {
  //   formIsValid = true;
  // }

  const submitHandler = (event) => {
    event.preventDefault();

    if (!formIsValid) {
      return;
    }
    console.log("submitted");
    console.log(emailValue, passwordValue);

    // resetFirstName();
    // resetLastName();
    resetEmail();
    resetPassword();
  };

  // const firstNameClasses = firstNameHasError? "form-control invalid": "form-control";
  // const emailClasses = emailHasError ? "form-control invalid" : "form-control";
  // const passwordClasses = emailHasError ? "form-control invalid" : "form-control";

  return (
    <Form onSubmit={submitHandler}>
      <div className="control=group">
        {/* <div className={firstNameClasses}>
          <label htmlFor="firstName">FirstName</label>
          <input
            type="text"
            id="firstName"
            value={firstNameValue}
            onChange={firstNameChangeHandler}
            onBlur={firstNameBlurHandler}
          />
          {firstNameHasError && (
            <p className="error-text">Please enter a valid </p>
          )}
        </div>
        <div className={firstNameClasses}>
          <label htmlFor="lastname">LastName</label>
          <input
            type="text"
            id="firstname"
            value={lastNameValue}
            onChange={lastNameChangeHandler}
            onBlur={lastNameBlurHandler}
          />
          {lastNameHasError && (
            <p className="error-text">Please enter a valid </p>
          )}
        </div> */}
      
        <Form.Group className="mb-3">
        <Form.Label htmlFor="email"> User Name / Email </Form.Label>
          
        <Form.Control
            type="text"
            id="email"
            value={emailValue}
            onChange={emailChangeHandler}
            onBlur={emailBlurHandler}
          />
          {emailHasError && <p className="text-danger">Please enter a valid UserName / Password</p>}
          </Form.Group>
     
        
        <Form.Group className="mb-3">
        <Form.Label htmlFor="password">Password</Form.Label>
          
        <Form.Control
            type="password"
            id="password"
            value={passwordValue}
            onChange={passwordChangeHandler}
            onBlur={passwordBlurHandler}
          />
          {passwordHasError && <p className="text-danger">Please enter password </p>}
          </Form.Group>
     
      </div>
      <div className="form-action">
        <Link to=''><Button className='my-5'><b>SIGN IN</b></Button></Link>
      </div>
    </Form>
  );
};

export default SimpleInput;
