/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

import "../SCSS/Login.scss";
import Logo from "../../images/Login/Logo.png";
import { forgetPassword } from "../../API/authCurd";
import Input from "../commonModules/UI/Input";
import ErrorPopup from '../commonModules/UI/ErrorPopup';
import { forgotPasswordSchema } from "../../Utils/validation";

// Form Initial Values
const initialValues = { email: "" }

const ForgotPassword = () => {
  // const [popMsg, setPopMsg] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [msgType, setMsgType] = useState("info")
  // const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  // useFormik hook initialization
  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting } = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: (values, { setSubmitting }) => { forgetPasswordRequest(values, setSubmitting) },
  })

  // Forget password request function
  async function forgetPasswordRequest(values, setSubmitting) {
    setIsSending(true)
    forgetPassword(values).then((res) => {
      setIsSending(false)
      setSubmitting(false)
      // setErrMessage(res.data.message)
      // if(!res.data.message){
        // navigate("/")
      // }
      // setPopMsg(true)
      // setIsError(false)
      setErrMessage(res.data.message)
      setMsgType("info")
      resetForm()
    }).catch((err) => {
      setIsSending(false)
      setSubmitting(false)
      // setErrMessage(err.response?.data.message || "Something went wrong!")
      setErrMessage(err.response?.data.message || "Something went wrong!")
      // setErrMessage(err.message)
      setMsgType("error")
      // setPopMsg(true)
      // setIsError(true)
    }).finally(()=>{
      setIsSending(false)
      setSubmitting(false)
    })
  }

  // Popup onclick button handle
  // const popupOnClickHandler = () => {
  //   setPopMsg(false)
  //   if (!isError) { navigate("/") }
  // }

  // Popup onclick button handle
  const gotToLogin = (e) => {
    e.preventDefault()
    setErrMessage("")
    setMsgType("info")
    navigate("/")
  }

  const clearMessage = () => {
    setErrMessage("")
    setMsgType("info")
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
                    <h1 className="signIn">FORGOT PASSWORD</h1>
                  </center>
                  {errMessage ? <div className="mb-3">
                    <Alert message={errMessage} type={msgType} showIcon />
                  </div> : null}
                  <form onSubmit={handleSubmit} >
                    <Input
                      label="Email"
                      id="email"
                      name="email"
                      {...getFieldProps("email")}
                      onKeyDown={clearMessage}
                      error={(touched.email && errors.email) && <p>{errors.email}</p>}
                    />
                    <button disabled={isSubmitting} type="submit" className="signBtn button">Verify Email {isSending && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</button>
                   <div className="text-center">
                   <a type="button" onClick={(e)=>gotToLogin(e)} className=" cancel-button">Cancel</a>
                   </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {(popMsg && errMessage) && <ErrorPopup title={errMessage} onClick={popupOnClickHandler} />} */}
    </div>
  );
};

export default ForgotPassword;
