import { useState } from "react";

const UseInput = (validatedValue) => {
  const [enteredValue, setEnteredValued] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  const valueIsValid = validatedValue(enteredValue);
  const hasError = !valueIsValid && isTouched;

  const valueChangeHandler = (event) => {
    setEnteredValued(event.target.value);
  };

  const inputBlurHandler = (event) => {
    setIsTouched(true);
  };

  const reset = () => {
    setEnteredValued("");
    setIsTouched(false);
  };

  return {
    value: enteredValue,
    isValid: valueIsValid,
    hasError,
    valueChangeHandler,
    inputBlurHandler,
    reset,
  };
};

export default UseInput;
