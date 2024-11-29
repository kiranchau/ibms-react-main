/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { addNewClientJobRequest } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { convertDateFormat, getCurrentDate } from '../../../Utils/dateFormat';
import { convertObject, isObjectNotEmpty } from '../../../Utils/helpers';
import { clientJobSchema, validateFormData } from '../../../Utils/validation';
import AddClientJobReqForm from './AddClientJobReqForm';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';

let initialValues = { name: "", customer: "", description: "", desired_due_date: "", status: "11" }

const AddClientJobReqFormWrap = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [formError, setFormError] = useState({})
    const [formValues, setFormValues] = useState({ ...initialValues, desired_due_date: getCurrentDate() })
    let userCustomerId = localStorage.getItem("customerId")
    let userType = localStorage.getItem("usertype")
    const { selectedCompany } = useContext(GlobalSearch)

    useEffect(() => {
        setFormValues((prev) => ({ ...prev, customer: selectedCompany ? selectedCompany : '' }))
    }, [selectedCompany])

    function handleSubmit(event) {
        event.preventDefault();

        let data = {
            ...formValues,
            status: "11",
            desired_due_date: convertDateFormat(formValues.desired_due_date),
        }

        validateFormData(clientJobSchema, data).then(() => {
            addNewClientJobRequest(data)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props.getJobListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    setFormValues({ ...initialValues, desired_due_date: getCurrentDate() })
                    setIsError(false)
                    setErrMessage(SuccessfullyMessage)
                    setPopMsg(true)
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        setFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!"
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            setFormError(err)
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    const cancelButtonHandler = () => {
        setFormError({})
        setFormValues({ ...initialValues, desired_due_date: getCurrentDate() })
        props.onClick()
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className='popups d-flex justify-content-center align-items-center job-form-popup'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>New Job Request</div>
                        <div className='myIcon' type='button' onClick={cancelButtonHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <AddClientJobReqForm
                            customerList={props.customerList}
                            formError={formError}
                            setFormError={setFormError}
                            formValues={formValues}
                            setFormValues={setFormValues}
                            getJobListPagination={props.getJobListPagination}
                            paginationData={props.paginationData}
                            filters={props.filters}
                        />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddClientJobReqFormWrap;
