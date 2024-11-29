/* eslint-disable eqeqeq */
import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import UserForm from '../../popups/userpops/UserForm';
import { AddUsers } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { userSchema, validateFormData } from '../../../Utils/validation';
import { convertObject, isObjectNotEmpty } from '../../../Utils/helpers';
import { paginationInitialPage } from '../../../Utils/pagination';

const AddUser = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [errMessage, setErrMessage] = useState();
    const [isError, setIsError] = useState(false)
    const [toggle, setToggle] = useState(1);

    function handleSubmit(event) {
        event.preventDefault();
        const selectedUserType = toggle == 1 ? "3" : "2";

        // Add the selected user_type directly to the form data
        const formDataWithUserType = {
            ...props.formData,
            user_type: selectedUserType,
            permissions: selectedUserType == "2" ? props.permissionArr : []
        };
        validateFormData(userSchema, formDataWithUserType).then(async () => {
            AddUsers(formDataWithUserType).then((res) => {
                props.getUsersList()
                props.setPaginationData({
                    ...props.paginationData,
                    current_page: paginationInitialPage
                })
                // props.getUsersListPagination(props.paginationData.per_page, 1)
                let SuccessfullyMessage = res.data.message;
                setIsError(false)
                setErrMessage(SuccessfullyMessage)
                setPopMsg(true)
            }).catch((err) => {
                const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                if (isObjectNotEmpty(errFromBackend)) {
                    props.setAddFormError((prev) => ({ ...prev, ...errFromBackend }))
                } else {
                    let errorMessage = err.response?.data.message || "Something went wrong!"
                    setIsError(true)
                    setErrMessage(errorMessage)
                    setPopMsg(true)
                }
            })
        }).catch((err) => {
            props.setAddFormError(err)
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='popups d-flex justify-content-center align-items-center w-100'>
                <div className='addpopups' style={{ width: "50%" }}>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Add User</div>
                        <div className='myIcon' type='button' onClick={props.onClick}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <UserForm toggle={toggle}
                            setToggle={setToggle} clientStatus={props.clientStatus} setFormData={props.setFormData} formData={props.formData} fetchData={props.fetchData}
                            setFetchData={props.setFetchData} customerList={props.customerList} jobCodes={props.jobCodes} departments={props.departments} addFormError={props.addFormError} setAddFormError={props.setAddFormError} permissions={props.permissions} permissionArr={props.permissionArr} setPermissionsArr={props.setPermissionsArr} />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={props.onClick}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddUser;
