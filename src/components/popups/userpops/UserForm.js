/* eslint-disable eqeqeq */
import React from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { FaUser } from "react-icons/fa";

import "../../SCSS/popups.scss";
import White from "../../../images/black.png"
import { userStatus } from "../../../Utils/staticdata";
import { sortObjectsByAttribute } from "../../../Utils/sortFunctions";

const UserForm = (props) => {
  function updateToggle(id) {
    props.setFormData({})
    props.setAddFormError({})
    props.setToggle(id);
    props.setPermissionsArr([])
  }

  // Input onchange handler function
  const onChangeHandler = (e) => {
    let errors = props.addFormError
    if (errors.hasOwnProperty(e.target.name)) {
      delete errors[e.target.name]
    }
    props.setAddFormError(errors)
    props.setFormData({ ...props.formData, [e.target.name]: e.target.value });
  };

  // Checkbox onchange handler
  const checkBoxChangeHandler = (e, item) => {
    let perm = []
    perm = [...props.permissionArr]
    if (perm.includes(item.permission_id)) {
      perm = perm.filter((p) => { return p != item.permission_id })
    } else {
      perm.push(item.permission_id)
    }
    props.setPermissionsArr(perm)
  }

  return (
    <div className="d-flex flex-wrap w-100 justify-content-center">
      <div className="row w-100">
        <div className="user-form-wrap">
          <div className="form-wrap tabs-wrap">
            <div className={props.toggle === 1 ? "active tab" : "tab"}>
              <div
                className="input-wrap form-check"
                onClick={() => updateToggle(1)}
              >
                <FaUser />
                <label class="form-check-label" for="flexRadioDefault1">
                  Customer
                </label>
              </div>
            </div>
            <div className={props.toggle === 2 ? "active tab" : "tab  "}>
              <div
                className="input-wrap form-check"
                onClick={() => updateToggle(2)}
              >
                <img src={White} alt="" width={'20px'} />
                <label class="form-check-label" for="flexRadioDefault2">
                  IB User
                </label>
              </div>
            </div>
          </div>
          <div className={props.toggle === 1 ? "" : "hide-content"}>
            <div className="input-row">
              <div className="addCust">
                <FloatingLabel label="First Name *">
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    value={props.formData?.first_name ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.first_name && <span className='ms-2 text-danger'>{props.addFormError?.first_name}</span>}
              </div>
              <div className="addCust">
                <FloatingLabel label="Last Name *">
                  <Form.Control
                    type="text"
                    placeholder="Name"
                    name="last_name"
                    value={props.formData?.last_name ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.last_name && <span className='ms-2 text-danger'>{props.addFormError?.last_name}</span>}
              </div>
            </div>
            <div className="input-row">
              <div className=' addCust'>
                <FloatingLabel label="Company">
                  <Form.Select aria-label="Company" name='customer_id' value={props.formData?.customer_id ?? ""}
                    onChange={onChangeHandler}>
                    <option key={0}>Company</option>
                    {props?.customerList?.length > 0 && sortObjectsByAttribute(props?.customerList).map((item) => {
                      return <option key={item.id} value={item.id}>{item.name}</option>
                    })}
                  </Form.Select>
                </FloatingLabel>
              </div>
              <div className="addCust ">
                <FloatingLabel label="Phone Number">
                  <Form.Control
                    type="text"
                    placeholder="Phone Number"
                    name="phone_no"
                    value={props.formData?.phone_no ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.phone_no && <span className='ms-2 text-danger'>{props.addFormError?.phone_no}</span>}
              </div>
            </div>
            <div className="input-row">
              <div className='addCust'>
                <FloatingLabel label="Status *">
                  <Form.Select aria-label="Floating label select example" name='status'
                    value={props.formData?.status ?? ""}
                    onChange={onChangeHandler}
                  >
                    <option key={0} value="">Select Status</option>
                    {userStatus.map((item) => {
                      return <option key={item.id} value={item.id}>{item.name}</option>
                    })}
                  </Form.Select>
                </FloatingLabel>
                {props.addFormError?.status && <span className='ms-2 text-danger'>{props.addFormError?.status}</span>}
              </div>
              <div className="addCust ">
                <FloatingLabel label="Email *">
                  <Form.Control
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={props.formData?.email ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.email && <span className='ms-2 text-danger'>{props.addFormError?.email}</span>}
              </div>
            </div>
          </div>
          <div className={props.toggle === 2 ? "" : "hide-content"}>
            <div className="input-row">
              <div className="addCust">
                <FloatingLabel label="First Name *">
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    value={props.formData?.first_name ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.first_name && <span className='ms-2 text-danger'>{props.addFormError?.first_name}</span>}
              </div>
              <div className="addCust">
                <FloatingLabel label="Last Name *">
                  <Form.Control
                    type="text"
                    placeholder="Name"
                    name="last_name"
                    value={props.formData?.last_name ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.last_name && <span className='ms-2 text-danger'>{props.addFormError?.last_name}</span>}
              </div>
            </div>
            <div className="input-row">
              <div className='addCust'>
                <FloatingLabel label="Department">
                  <Form.Select aria-label="Department" name='department_id' value={props.formData?.department_id ?? ""}
                    onChange={onChangeHandler}>
                    <option key={0}>Department</option>
                    {props?.departments?.length > 0 && sortObjectsByAttribute(props?.departments).map((item) => {
                      return <option key={item.id} value={item.id}>{item.name}</option>
                    })}
                  </Form.Select>
                </FloatingLabel>
              </div>
              <div className="addCust ">
                <FloatingLabel label="Phone Number">
                  <Form.Control
                    type="text"
                    placeholder="Phone Number"
                    name="phone_no"
                    value={props.formData?.phone_no ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.phone_no && <span className='ms-2 text-danger'>{props.addFormError?.phone_no}</span>}
              </div>
            </div>
            <div className="input-row">
              <div className='addCust'>
                <FloatingLabel label="Status *">
                  <Form.Select aria-label="Floating label select example" name='status'
                    value={props.formData?.status ?? ""}
                    onChange={onChangeHandler}
                  >
                    <option key={0} value="">Select Status</option>
                    {userStatus.map((item) => {
                      return <option key={item.id} value={item.id}>{item.name}</option>
                    })}
                  </Form.Select>
                </FloatingLabel>
                {props.addFormError?.status && <span className='ms-2 text-danger'>{props.addFormError?.status}</span>}
              </div>
              <div className="addCust ">
                <FloatingLabel label="Email *">
                  <Form.Control
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={props.formData?.email ?? ""}
                    onChange={onChangeHandler}
                  />
                </FloatingLabel>
                {props.addFormError?.email && <span className='ms-2 text-danger'>{props.addFormError?.email}</span>}
              </div>
            </div>
            <div className="input-row">
              <div className="addCust check-box-container">
                {props?.permissions.map((item) => (
                  <Form.Check // prettier-ignore
                    key={item.permission_id}
                    type="checkbox"
                    label={`${item?.permission_name ? item?.permission_name : ""}`}
                    data-permissionid={item.permission_id}
                    onChange={(e) => checkBoxChangeHandler(e, item)}
                    checked={props.permissionArr.includes(item.permission_id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;