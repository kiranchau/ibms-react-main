/* eslint-disable eqeqeq */
import React, { useEffect, useState } from "react";
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";

import "../SCSS/Login.scss";
import Logo from "../../images/Login/Logo.png";
import { resetPassword, setPassword } from "../../API/authCurd";
import Input from "../commonModules/UI/Input";
import ErrorPopup from '../commonModules/UI/ErrorPopup'
import { resetPasswordSchema } from "../../Utils/validation";
import { BsEye, BsEyeSlash } from "react-icons/bs";

// Form Initial Values
const initialValues = { password: "", confirmPassword: "" }

const ResetPassword = () => {
  const [popMsg, setPopMsg] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [passwordFieldType, setPasswordFieldType] = useState("password")
  const [confirmPasswordFieldType, setConfirmPasswordFieldType] = useState("password")
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search)
  const token = queryParams.get("token")
  const email = queryParams.get("email")
  const url = queryParams.get("url")
  const signature = queryParams.get("signature")
  // useFormik hook initialization
  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting } = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: (values, { setSubmitting }) => { resetPasswordRequest(values, token, setSubmitting) },
  })

  // Reset password
  function resetUserPassword(data, token, setSubmitting) {
    setIsSending(true)
    resetPassword(data, token).then((res) => {
      setIsSending(false)
      setSubmitting(false)
      setErrMessage(res.data.message)
      if (!res.data.message) {
        navigate("/")
      }
      setPopMsg(true)
      setIsError(false)
      resetForm()
    }).catch((err) => {
      setIsSending(false)
      setSubmitting(false)
      setErrMessage(err.response?.data.message || "Something went wrong!")
      setPopMsg(true)
      setIsError(true)
    })
  }

  // Set password
  function setUserPassword(data, setSubmitting) {
    setIsSending(true)
    setPassword(data).then((res) => {
      setIsSending(false)
      setSubmitting(false)
      setErrMessage(res.data.message)
      if (!res.data.message) {
        navigate("/")
      }
      setPopMsg(true)
      setIsError(false)
      resetForm()
    }).catch((err) => {
      setIsSending(false)
      setSubmitting(false)
      setErrMessage(err.response?.data.message || "Something went wrong!")
      setPopMsg(true)
      setIsError(true)
    })
  }

  // request function
  async function resetPasswordRequest(values, token, setSubmitting) {
    if (url) {
      let data = {
        url: `${url}&signature=${signature}`,
        password: values.password,
        password_confirmation: values.confirmPassword
      }
      setUserPassword(data, setSubmitting)
    } else {
      let data = {
        email: email,
        password: values.password,
        password_confirmation: values.confirmPassword
      }
      resetUserPassword(data, token, setSubmitting)
    }
  }

  // Popup onclick button handle
  const popupOnClickHandler = () => {
    setPopMsg(false)
    if (!isError) { navigate("/") }
  }

  useEffect(() => {
    localStorage.clear()
  }, [])

  const onEyeIconClickHandler = () => {
    setPasswordFieldType((prev) => prev == "password" ? "text" : "password")
  }

  const onConfirmEyeIconClickHandler = () => {
    setConfirmPasswordFieldType((prev) => prev == "password" ? "text" : "password")
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
                    <h1 className="signIn">{signature ? "SET PASSWORD" : "RESET PASSWORD"}</h1>
                  </center>
                  <form onSubmit={handleSubmit}>
                    <div className="password-wrap">
                    <Input
                      label="Password"
                      id="password"
                      type={passwordFieldType}
                      name="password"
                      {...getFieldProps("password")}
                      error={(touched.password && errors.password) && <p>{errors.password}</p>}
                    />
                    <span className='eye-icon' onClick={onEyeIconClickHandler}>{passwordFieldType == "password" ? <BsEye /> : <BsEyeSlash />}</span>
                    </div>
                    <div className="password-wrap">
                    <Input
                      label="Confirm Password"
                      id="confirmPassword"
                      type={confirmPasswordFieldType}
                      name="confirmPassword"
                      {...getFieldProps("confirmPassword")}
                      error={(touched.confirmPassword && errors.confirmPassword) && <p>{errors.confirmPassword}</p>}
                    />
                    <span className='eye-icon' onClick={onConfirmEyeIconClickHandler}>{confirmPasswordFieldType == "password" ? <BsEye /> : <BsEyeSlash />}</span>
                    </div>                    
                    <button type="submit" disabled={isSubmitting} className="signBtn button">{signature ? "Set" : "Reset"} Password {isSending && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(popMsg && errMessage) && <ErrorPopup title={errMessage} onClick={popupOnClickHandler} />}
    </div>
  );
};

export default ResetPassword;
