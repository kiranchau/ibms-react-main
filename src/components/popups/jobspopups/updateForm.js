/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useRef, useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { updateJob } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import UpadateJobForm from './updateJobForm';
import { convertDateFormat, parseDateTimeString } from '../../../Utils/dateFormat';
import { convertObject, deletePropertiesIfExists, extractIntegerPart, getNumberBoolean, isObjectNotEmpty, joinHoursMinutes } from '../../../Utils/helpers';
import { jobSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import { Alert } from 'antd';

const UpdateForm = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [isUpdating, setIsUpdating] = useState(false)
    const [updatedJobData, setUpdateJobdData] = useState(null)
    let userType = localStorage.getItem('usertype')
    const alertRef = useRef(null)

    useEffect(() => {
        if (props?.selectedJob) {
            const { customer, status, type, name, description, deadline, desired_due_date, priority, recurrence_frequency,
                billing_type, projected_hours, assigned_user_id, recurring_job, recurrence_on, completed, job_amount, number_of_hours, hours_remaining,
                projected_hours_string, hours_used, billing_frequency, max_hours, desired_start_date } = props?.selectedJob
            let data = {
                name: name ?? (name === "" ? "" : name),
                type: type ?? (type === "" ? "" : type),
                status: (status == 0 || status == 1) ? 9 : status,
                customer: customer ?? (customer === "" ? "" : customer),
                description: description ?? (description === "" ? "" : description),
                deadline: deadline ? deadline : parseDateTimeString(new Date(), 6),
                desired_due_date: desired_due_date ?? (desired_due_date === "" ? "" : desired_due_date),
                desired_start_date: desired_start_date ?? (desired_start_date === "" ? "" : desired_start_date),
                priority: priority ?? (priority === "" ? "" : priority),
                recurrence_frequency: recurrence_frequency ?? (recurrence_frequency === "" ? "" : recurrence_frequency),
                recurring_job: recurring_job ?? (recurring_job === "" ? "" : recurring_job),
                recurrence_on: recurrence_on ?? (recurrence_on === "" ? "" : recurrence_on),
                billing_type: billing_type ?? (billing_type === "" ? "" : billing_type),
                projected_hours: projected_hours ?? (projected_hours === "" ? "" : projected_hours),
                assigned_user_id: assigned_user_id ?? (assigned_user_id === "" ? "" : assigned_user_id),
                completed: completed ?? (completed === "" ? "" : completed),
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
                data.projected_hours_hrs = durationString?.[0] ? durationString?.[0] : ""
                data.projected_hours_mins = durationString?.[1] ? durationString?.[1] : ""
            } else {
                const projectedHrs = projected_hours?.split(":")
                data.projected_hours_hrs = projectedHrs?.[0] ? Number(projectedHrs?.[0]) : ""
                data.projected_hours_mins = projectedHrs?.[1] ? Number(projectedHrs?.[1]) : ""
            }
            setUpdateJobdData(data)
        }
    }, [props?.selectedJob])

    function handleSubmit(event) {
        event.preventDefault();
        setIsUpdating(true)

        let data = {
            ...updatedJobData,
            deadline: convertDateFormat(updatedJobData.deadline),
            desired_due_date: convertDateFormat(updatedJobData.desired_due_date),
            desired_start_date: convertDateFormat(updatedJobData.desired_start_date),
            priority: updatedJobData?.priority,
            completed: getNumberBoolean(updatedJobData?.completed),
            recurring_job: getNumberBoolean(updatedJobData?.recurring_job),
            recurrence_on: updatedJobData?.recurring_job ? (updatedJobData?.recurrence_on || "") : "",
            recurrence_frequency: updatedJobData?.recurring_job ? (updatedJobData?.recurrence_frequency || "") : "",
            projected_hours: joinHoursMinutes(extractIntegerPart(updatedJobData?.projected_hours_hrs), extractIntegerPart(updatedJobData?.projected_hours_mins), ":"),
            projected_hours_string: `${extractIntegerPart(updatedJobData?.projected_hours_hrs)},${extractIntegerPart(updatedJobData?.projected_hours_mins)}`,
        }

        if (data.projected_hours == "0:0" && data.projected_hours_string == ",") {
            data.projected_hours = ""
        }
        
        let unlimitedHours = getNumberBoolean(updatedJobData?.unlimited_hours)
        
        if (unlimitedHours == 1) {
            data.number_of_hours = -1
            data.hours_remaining = -1
        } else {
            data.number_of_hours = updatedJobData.number_of_hours
            data.hours_remaining = updatedJobData.hours_remaining
        }

        delete data["unlimited_hours"]

        if (data.billing_type == "1" || data.billing_type == "3" || data.billing_type == "4") {
            deletePropertiesIfExists(data, ["projected_hours_hrs", "projected_hours_mins"])
        }
        if (data.type != 6) {
            deletePropertiesIfExists(data, ["desired_start_date"])
        }

        validateFormData(jobSchema, data).then(() => {
            updateJob(data, props.selectedJob.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props?.setSuccessMessage(SuccessfullyMessage)
                    if(alertRef?.current){
                        alertRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                    setTimeout(()=>{
                        props.setSuccessMessage("")
                    }, 10000)
                    // props.getJobList()
                    props.getJobListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    // setUpdateJobdData(null)
                    setIsUpdating(false)
                    // setIsError(false)
                    // setErrMessage(SuccessfullyMessage)
                    // setPopMsg(true)
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!"
                        setIsUpdating(false)
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    function handleConvertJob(event) {
        event.preventDefault();
        setIsUpdating(true)
        let data = {
            ...updatedJobData,
            deadline: convertDateFormat(updatedJobData.deadline),
            desired_due_date: convertDateFormat(updatedJobData.desired_due_date),
            priority: updatedJobData?.priority,
            completed: getNumberBoolean(updatedJobData?.completed),
            projected_hours: joinHoursMinutes(updatedJobData?.projected_hours_hrs, updatedJobData?.projected_hours_mins, "."),
            projected_hours_string: `${updatedJobData?.projected_hours_hrs},${updatedJobData?.projected_hours_mins}`,
            is_draft: 0
        }

        if (data.projected_hours == "0:0" && data.projected_hours_string == ",") {
            data.projected_hours = ""
        }

        let unlimitedHours = getNumberBoolean(updatedJobData?.unlimited_hours)
        
        if (unlimitedHours == 1) {
            data.number_of_hours = -1
            data.hours_remaining = -1
        } else {
            data.number_of_hours = updatedJobData.number_of_hours
            data.hours_remaining = updatedJobData.hours_remaining
        }

        delete data["unlimited_hours"]
        
        if (data.billing_type == "1" || data.billing_type == "3" || data.billing_type == "4") {
            deletePropertiesIfExists(data, ["projected_hours_hrs", "projected_hours_mins"])
        }

        validateFormData(jobSchema, data).then(() => {
            updateJob(data, props.selectedJob.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    // props.getJobList()
                    props.getJobListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    setIsUpdating(false)
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
                        setIsUpdating(false)
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    const cancelButtonHandler = () => {
        setUpdateJobdData(null)
        props.setSelectedJob([])
        props.setFormError({})
        props.onClick()
        props.setSuccessMessage("")
    }

    const onAlertCloseHandler = () => {
        props?.setSuccessMessage("")
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        // <form onSubmit={handleSubmit} noValidate>
        <form noValidate>
            <div className='popups d-flex justify-content-center align-items-center job-form-popup'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Update Job</div>
                        <div className='myIcon' type='button' onClick={cancelButtonHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <div ref={alertRef}>
                            {props.successMessage && <div className='d-flex justify-content-center align-items-center mb-3'>
                                <Alert
                                    message={props.successMessage}
                                    type="success"
                                    showIcon closable
                                    onClose={onAlertCloseHandler}
                                />
                            </div>}
                        </div>
                        <UpadateJobForm
                            jobCodes={props.jobCodes}
                            paymentTerms={props.paymentTerms}
                            customerList={props.customerList}
                            updatedJobData={updatedJobData}
                            setUpdateJobdData={setUpdateJobdData}
                            responsibleUser={props.responsibleUser}
                            formError={props.formError}
                            setFormError={props.setFormError}
                            selectedJob={props.selectedJob}
                            getJobList={props.getJobList}
                            getJobListPagination={props.getJobListPagination}
                            paginationData={props.paginationData}
                            filters={props.filters}
                            isClientRequest={props.isClientRequest}
                        />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                            {!(props.isClientRequest && userType == 3) && <div>
                                <Button type="button" onClick={handleSubmit} disable={isUpdating}>Update</Button>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default UpdateForm;
