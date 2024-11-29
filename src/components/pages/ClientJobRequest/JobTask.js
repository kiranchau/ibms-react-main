import React, { useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { addTask } from '../../../API/authCurd';
import { convertDateFormat } from '../../../Utils/dateFormat';
import { convertObject, isObjectNotEmpty, joinHoursMinutes } from '../../../Utils/helpers';
import { taskSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import TaskForm from '../../popups/taskpops/taskForm';

const JobTask = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [errMessage, setErrMessage] = useState();
    const [isError, setIsError] = useState(false)

    function handleSubmit(event) {
        event.preventDefault();
        const fd = new FormData(event.target);
        const data = Object.fromEntries(fd.entries())

        data.desired_due_date = convertDateFormat(data.desired_due_date)
        data.completion_date = convertDateFormat(data.completion_date)
        data.estimated_duration = joinHoursMinutes(data.estimated_duration_hrs, data.estimated_duration_mins, ":")
        data.actual_duration = joinHoursMinutes(data.actual_duration_hrs, data.actual_duration_mins, ":")
        data.duration_string = `${data.estimated_duration_hrs},${data.estimated_duration_mins},${data.actual_duration_hrs},${data.actual_duration_mins}`

        validateFormData(taskSchema, data).then(() => {
            addTask(data).then((res) => {
                let SuccessfullyMessage = res.data.message;
                setIsError(false)
                setErrMessage(SuccessfullyMessage)
                setPopMsg(true)
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
            <div className='popups d-flex justify-content-center align-items-center'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Add Task</div>

                        <div className='myIcon' type='button' onClick={props.onClick}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <TaskForm
                            serviceTypes={props.serviceTypes}
                            paymentTerms={props.paymentTerms}
                            customerList={props.customerList}
                            formError={props.formError}
                            setFormError={props.setFormError}
                            formValue={props.formValue}
                            setFormValue={props.setFormValue}
                            jobs={props.jobs}
                            setJobs={props.setJobs}
                        />
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

export default JobTask;
