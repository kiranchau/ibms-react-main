/* eslint-disable eqeqeq */
import React, { useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import JobForm from './jobForm';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { convertDateFormat, getCurrentDate } from '../../../Utils/dateFormat';
import { convertObject, deletePropertiesIfExists, getNumberBoolean, isObjectNotEmpty, joinHoursMinutes } from '../../../Utils/helpers';
import { addJob } from '../../../API/authCurd';
import { jobSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import { paginationInitialPage } from '../../../Utils/pagination';

const AddJobs = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [errMessage, setErrMessage] = useState();
    const [isError, setIsError] = useState(false)
    const [dueDate, setDueDate] = useState(getCurrentDate());
    const [deadlineDate, setDeadlineDate] = useState(getCurrentDate());
    const [desiredStartDate, setDesiredStartDate] = useState(getCurrentDate());
    const [recurringJob, setRecurringJob] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        const fd = new FormData(event.target);
        const data = Object.fromEntries(fd.entries())
        let formValues = {
            ...data,
            deadline: convertDateFormat(data.deadline),
            desired_due_date: convertDateFormat(data.desired_due_date),
            desired_start_date: convertDateFormat(data.desired_start_date),
            completed: getNumberBoolean(data?.completed),
            recurring_job: getNumberBoolean(data?.recurring_job),
            recurrence_on: recurringJob ? (data?.recurrence_on || "") : "",
            recurrence_frequency: recurringJob ? (data?.recurrence_frequency || "") : "",
            projected_hours: joinHoursMinutes(data.projected_hours_hrs, data.projected_hours_mins, ":"),
            projected_hours_string: `${data.projected_hours_hrs ? data.projected_hours_hrs : ""},${data.projected_hours_mins ? data.projected_hours_mins : ""}`,
            job_amount: data.job_amount ? data.job_amount : null
        }

        if (formValues.projected_hours == "0:0" && formValues.projected_hours_string == ",") {
            formValues.projected_hours = ""
        }

        let unlimitedHours = getNumberBoolean(data?.unlimited_hours)

        if (unlimitedHours == 1) {
            formValues.number_of_hours = -1
            formValues.hours_remaining = -1
        } else {
            formValues.number_of_hours = data.number_of_hours
            formValues.hours_remaining = data.hours_remaining
        }

        if (formValues.billing_type == "1" || formValues.billing_type == "3" || formValues.billing_type == "4") {
            deletePropertiesIfExists(formValues, ["projected_hours_hrs", "projected_hours_mins"])
        }

        if (formValues.type != 6) {
            deletePropertiesIfExists(formValues, ["desired_start_date"])
        }

        validateFormData(jobSchema, formValues).then(() => {
            addJob(formValues).then((res) => {
                let SuccessfullyMessage = res.data.message || "Job added successfully";
                if (props?.openModel) {
                    props?.openModel(res.data?.id, SuccessfullyMessage)
                }
                setDeadlineDate(getCurrentDate())
                setDueDate(getCurrentDate())
                setDesiredStartDate(getCurrentDate())
                props.getJobListPagination(props.paginationData.per_page, paginationInitialPage, props.filters, false)
                setIsError(false)
                props.onClick()
            }).catch((err) => {
                const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                if (isObjectNotEmpty(errFromBackend)) {
                    props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                } else {
                    let errorMessage = err.response?.data.message || "Something went wrong!";
                    setIsError(true)
                    setErrMessage(errorMessage)
                    setPopMsg(true)
                }
            })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    const cancelButtnHandler = () => {
        setRecurringJob(false)
        setDeadlineDate(getCurrentDate())
        setDueDate(getCurrentDate())
        setDesiredStartDate(getCurrentDate())
        props.onClick()
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
        <form onSubmit={handleSubmit} noValidate>
            <div className='popups d-flex justify-content-center align-items-center job-form-popup'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Add Job</div>
                        <div className='myIcon' type='button' onClick={cancelButtnHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <JobForm
                            jobCodes={props.jobCodes}
                            paymentTerms={props.paymentTerms}
                            customerList={props.customerList}
                            responsibleUser={props.responsibleUser}
                            formError={props.formError}
                            setFormError={props.setFormError}
                            formValues={props.formValues}
                            setFormValues={props.setFormValues}
                            dueDate={dueDate}
                            setDueDate={setDueDate}
                            deadlineDate={deadlineDate}
                            setDeadlineDate={setDeadlineDate}
                            recurringJob={recurringJob}
                            setRecurringJob={setRecurringJob}
                            desiredStartDate={desiredStartDate}
                            setDesiredStartDate={setDesiredStartDate}
                        />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtnHandler}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddJobs;
