/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { convertClientJobRequest, fetchJobCodes, updateClientJobRequest } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { convertDateFormat } from '../../../Utils/dateFormat';
import { convertObject, deletePropertiesIfExists, extractIntegerPart, getNumberBoolean, isObjectNotEmpty, joinHoursMinutes } from '../../../Utils/helpers';
import { clientJobSchema, conversionSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import UpadateClinetJobForm from './updateClientJobForm';
import ConvertToJobForm from './ConvertToJobForm';

const UpdateClientForm = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [updatedJobData, setUpdateJobdData] = useState(null)
    const [openConvertToJobPopup, setOpenConvertToJobPopup] = useState(false)
    const [jobCodes, setJobCodes] = useState([]);

    const [conversionForm, setConversionForm] = useState({})
    const [conversionFormErr, setConversionFormErr] = useState({})
    let userCustomerId = localStorage.getItem("customerId")
    let userType = localStorage.getItem('usertype')

    useEffect(() => {
        if (props?.selectedJob) {
            const { customer, name, description, desired_due_date, status, billing_type, projected_hours, job_amount, number_of_hours, hours_remaining, hours_used, billing_frequency, max_hours, projected_hours_string, type, request_status } = props?.selectedJob
            let data = {
                name: name ?? (name === "" ? "" : name),
                customer: customer ?? (customer === "" ? "" : customer),
                description: description ?? (description === "" ? "" : description),
                desired_due_date: desired_due_date ?? (desired_due_date === "" ? "" : desired_due_date),
                status: request_status ?? (request_status === "" ? "" : request_status),
            }
            let secondPopup = {
                billing_type: billing_type ?? (billing_type === "" ? "" : billing_type),
                type: type ?? (type === "" ? "" : type),
                projected_hours: projected_hours ?? (projected_hours === "" ? "" : projected_hours),
                job_amount: job_amount ?? (job_amount === "" ? "" : job_amount),
                unlimited_hours: number_of_hours != -1 ? 0 : 1,
                number_of_hours: number_of_hours == -1 ? "Unlimited" : number_of_hours,
                hours_remaining: hours_remaining == -1 ? "Unlimited" : hours_remaining,
                hours_used: hours_used == 0 ? "0:0" : hours_used,
                billing_frequency: billing_frequency ?? (billing_frequency === "" ? "" : billing_frequency),
                max_hours: max_hours ?? (max_hours === "" ? "" : max_hours),
            }
            if (projected_hours_string) {
                const durationString = projected_hours_string?.split(",")
                secondPopup.projected_hours_hrs = durationString?.[0] ? durationString?.[0] : ""
                secondPopup.projected_hours_mins = durationString?.[1] ? durationString?.[1] : ""
            } else {
                const projectedHrs = projected_hours?.split(":")
                secondPopup.projected_hours_hrs = projectedHrs?.[0] ? Number(projectedHrs?.[0]) : ""
                secondPopup.projected_hours_mins = projectedHrs?.[1] ? Number(projectedHrs?.[1]) : ""
            }
            setConversionForm(secondPopup)
            setUpdateJobdData(data)
        }
    }, [props?.selectedJob])

    function handleSubmit(event) {
        event.preventDefault();

        let data = {
            ...updatedJobData,
            desired_due_date: updatedJobData?.desired_due_date ? convertDateFormat(updatedJobData.desired_due_date) : "",
        }

        validateFormData(clientJobSchema, data).then(() => {
            updateClientJobRequest(data, props.selectedJob.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props.getJobListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    setUpdateJobdData(null)
                    setIsError(false)
                    setErrMessage(SuccessfullyMessage)
                    setPopMsg(true)
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!"
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    const getJobCodes = () => {
        fetchJobCodes()
            .then((res) => {
                if (res.data?.job_codes) { setJobCodes(res.data?.job_codes) }
            }).catch(() => { setJobCodes([]) })
    }

    function handleConvertJob(event) {
        event.preventDefault();
        setOpenConvertToJobPopup(true)
        getJobCodes()
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            conversionCancelButtonHandler()
            props.onClick()
        }
    }

    const cancelButtonHandler = () => {
        setUpdateJobdData(null)
        setConversionForm({})
        props.setSelectedJob([])
        props.setFormError({})
        props.onClick()
    }

    const conversionCancelButtonHandler = () => {
        setOpenConvertToJobPopup(false)
        setConversionFormErr({})
    }

    const submitConvertToJobSave = (e) => {
        e.preventDefault()
        let data = {
            ...updatedJobData,
            ...conversionForm,
            desired_due_date: updatedJobData?.desired_due_date ? convertDateFormat(updatedJobData.desired_due_date) : "",
            projected_hours: joinHoursMinutes(extractIntegerPart(conversionForm?.projected_hours_hrs), extractIntegerPart(conversionForm?.projected_hours_mins), ":"),
            projected_hours_string: `${extractIntegerPart(conversionForm?.projected_hours_hrs)},${extractIntegerPart(conversionForm?.projected_hours_mins)}`,
            is_draft: 0
        }

        if(userType == 3){
            data.customer = userCustomerId
        }

        if (data.projected_hours == "0:0" && data.projected_hours_string == ",") {
            data.projected_hours = ""
        }

        let unlimitedHours = getNumberBoolean(conversionForm?.unlimited_hours)

        if (unlimitedHours == 1) {
            data.number_of_hours = -1
            data.hours_remaining = -1
        } else {
            data.number_of_hours = conversionForm.number_of_hours
            data.hours_remaining = conversionForm.hours_remaining
        }

        delete data["unlimited_hours"]

        if (data.billing_type == "1" || data.billing_type == "3" || data.billing_type == "4") {
            deletePropertiesIfExists(data, ["projected_hours_hrs", "projected_hours_mins"])
        }

        validateFormData(conversionSchema, data).then(() => {
            convertClientJobRequest(data, props.selectedJob.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props.getJobListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    setUpdateJobdData(null)
                    setConversionForm({})
                    setIsError(false)
                    props.onClick()
                    props.setFormError({})
                    if (props?.openJobUpdateAfterConvert) {
                        props?.openJobUpdateAfterConvert(props.selectedJob.id)
                    }
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        setConversionFormErr((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!"
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            setConversionFormErr(err)
        })
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit} noValidate>
                <div className='popups d-flex justify-content-center align-items-center job-form-popup'>
                    <div className='addpopups'>
                        <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                            <div>Update Job</div>
                            <div className='myIcon' type='button' onClick={cancelButtonHandler}>
                                <IoIosCloseCircle style={{ width: '28px' }} />
                            </div>
                        </div>
                        <div className='popBody p-3'>
                            <UpadateClinetJobForm
                                customerList={props.customerList}
                                updatedJobData={updatedJobData}
                                setUpdateJobdData={setUpdateJobdData}
                                formError={props.formError}
                                setFormError={props.setFormError}
                                selectedJob={props.selectedJob}
                                getJobListPagination={props.getJobListPagination}
                                paginationData={props.paginationData}
                                filters={props.filters}
                            />
                        </div>
                        <div className='mt-auto popfoot w-100 p-2'>
                            <div className='d-flex align-items-center justify-content-center'>
                                {(userType == 1 || userType == 2) && <Button className="mx-4 cclBtn" type="button" onClick={handleConvertJob}>Convert to Job</Button>}
                                <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                                <Button type="submit" >Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {openConvertToJobPopup && <div className={`mainpopups`}>
                <form onSubmit={submitConvertToJobSave} noValidate>
                    <div className='popups d-flex justify-content-center align-items-center job-form-popup'>
                        <div className='addpopups'>
                            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                                <div>Job Conversion Information</div>
                                <div className='myIcon' type='button' onClick={conversionCancelButtonHandler}>
                                    <IoIosCloseCircle style={{ width: '28px' }} />
                                </div>
                            </div>
                            <div className='popBody p-3'>
                                <ConvertToJobForm
                                    customerList={props.customerList}
                                    jobCodes={jobCodes}
                                    formError={conversionFormErr}
                                    setFormError={setConversionFormErr}
                                    formValues={conversionForm}
                                    setFormValues={setConversionForm}
                                />
                            </div>
                            <div className='mt-auto popfoot w-100 p-2'>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <Button className="mx-4 cclBtn" onClick={conversionCancelButtonHandler}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="blurBg"></div>
            </div>}
        </>
    );
}

export default UpdateClientForm;
