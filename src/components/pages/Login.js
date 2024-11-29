/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-unused-vars */
// Login.js

import React, { useState } from 'react';
import '../SCSS/Login.scss';
import Logo from '../../images/Login/Logo.png';
import { Link } from 'react-router-dom';
import { firebaseToken, login, updateUserLastActiveTime } from '../../API/authCurd';
import useInputs from '../hooks/useInputs';
import { isEmail, isNotEmpty, hasMinLength, isEqualsToOtherValue } from '../commonModules/util/Validation';
import { useNavigate } from 'react-router-dom';
// import { getPushToken } from '../../firebase';
import { browserName, browserVersion } from 'react-device-detect';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Input from '../commonModules/UI/Input';


const Login = () => {
  const navigate = useNavigate();
  const [passwordFieldType, setPasswordFieldType] = useState("password")
  const [errMessages, setErrMessages] = useState({
    email: '',
    password: '',
    general: '',
  });

  const {
    value: emailValue,
    handleInputChange: handleEmailChange,
    handleInputBlur: handleEmailBlur,
    hasError: emailHasError,
  } = useInputs('', (value) => isEmail(value) && isNotEmpty(value) || isEqualsToOtherValue(value));

  const {
    value: passwordValue,
    handleInputChange: handlePasswordChange,
    handleInputBlur: handlePasswordBlur,
    hasError: passwordHasError,
  } = useInputs('', (value) => hasMinLength(value, 2));

  const loginmethod = (e) => {
    e.preventDefault();

    login(emailValue, passwordValue)
      .then(async (res) => {
        if (res.data) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('usertype', res.data?.user_type);
          updateUserLastActiveTime()
          setErrMessages({});
        }
        if (res.data?.user_type == 3) {
          navigate('/tasks');
        } else {
          navigate('/dashboard');
        }
        // getNotificationDetails();
      })
      .catch((err) => {
        setErrMessages({
          ...errMessages,
          email: err.response?.data?.errors?.email || '',
          password: err.response?.data?.errors ? err.response?.data?.errors.password : err.response?.data?.message || '',
        });
      });
  };


  const getNotificationDetails = async () => {
    // getPushToken()
    //   .then((val) => {
    //     localStorage.setItem('tokenId', val);
    //     const fireTokenParam = {
    //       DeviceID: `${browserVersion}`,
    //       device_token: val,
    //       DeviceType: `${browserName}`,
    //     };
    //     if(val){
    //       firebaseToken(fireTokenParam);
    //     }
    //   })
    //   .catch((err) => { });
  };

  const onEyeIconClickHandler = () => {
    setPasswordFieldType((prev) => prev == "password" ? "text" : "password")
  }

  return (
    <div className="loginBg d-flex justify-content-center align-items-center">
      <div className="login-contain">
        <div className="row">
          <div className="col-lg-7">
          </div>
          <div className="p-5 Fbtm col-lg-5">
            <div className="h-100 FbtmScroll">
              <center>
                <img src={Logo} width="90%" alt="Logo" />
              </center>
              <div className="htmiddle">
                <div className="w-100">
                  <center>
                    <h1 className="signIn">SIGN IN</h1>
                  </center>
                  <form onSubmit={loginmethod} noValidate>
                    <div className="mb-3">
                      <Input
                        label="Email"
                        type="email"
                        className={`form-control ${errMessages.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={emailValue}
                        onChange={(e) => {
                          handleEmailChange(e);
                          setErrMessages({ ...errMessages, email: '' });
                        }}
                        onBlur={handleEmailBlur}
                        error={(errMessages.email) && <p>{errMessages.email}</p>}
                      />
                      {/* {errMessages.email && <div className="invalid-feedback">{errMessages.email}</div>} */}
                    </div>
                    <div className="mb-3 border-danger border-2 password-wrap">

                      <Input
                        type={passwordFieldType}
                        label="Password"
                        className={`form-control ${errMessages.password ? 'is-invalid' : ''}`}
                        id="password"
                        value={passwordValue}
                        onChange={(e) => {
                          handlePasswordChange(e);
                          setErrMessages({ ...errMessages, password: '' });
                        }}
                        onBlur={handlePasswordBlur}
                        error={(errMessages.password) && <p>{errMessages.password}</p>}
                      />
                      <span className='eye-icon' onClick={onEyeIconClickHandler}>{passwordFieldType == "password" ? <BsEye /> : <BsEyeSlash />}</span>
                      {/* {errMessages.password && <div className="invalid-feedback">{errMessages.password}</div>} */}
                    </div>
                    <Link className="forgot-text" to="/forgotpassword">
                      Forgot Password?
                    </Link>

                    <button type="submit" className="signBtn button">
                      Sign In
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
