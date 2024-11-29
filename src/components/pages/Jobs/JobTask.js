import React, { useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { addTask } from '../../../API/authCurd';
import { convertDateFormat, getCurrentDate } from '../../../Utils/dateFormat';
import { convertObject, isObjectNotEmpty, joinHoursMinutes, separateAndTransformIds } from '../../../Utils/helpers';
import { taskSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import TaskForm from '../../popups/taskpops/taskForm';

const JobTask = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [errMessage, setErrMessage] = useState();
    const [isError, setIsError] = useState(false)
    const [desiredDueDate, setDesiredDueDate] = useState(getCurrentDate());
    const [deadlineDate, setDeadlineDate] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [assignedDueDate, setAssignedDueDate] = useState(getCurrentDate());
    const [isOpen, setIsOpen] = useState(false)

    function handleSubmit(event) {
        event.preventDefault();
        const fd = new FormData(event.target);
        const data = Object.fromEntries(fd.entries())

        data.desired_due_date = convertDateFormat(data.desired_due_date)
        data.completion_date = convertDateFormat(data.completion_date)
        data.estimated_duration = joinHoursMinutes(data.estimated_duration_hrs, data.estimated_duration_mins, ":")
        data.actual_duration = joinHoursMinutes(data.actual_duration_hrs, data.actual_duration_mins, ":")
        data.duration_string = `${data.estimated_duration_hrs ? data.estimated_duration_hrs : ""},${data.estimated_duration_mins ? data.estimated_duration_mins : ""},${data.actual_duration_hrs ? data.actual_duration_hrs : ""},${data.actual_duration_mins ? data.actual_duration_mins : ""}`
        if (props.isFromJob) {
            data.customer = props.formValue?.customer
        }
        if (props.isFromJob) {
            data.project = props.formValue?.project
        }

        if (assignedUsers?.length > 0) {
            const { userIds, deptIds } = separateAndTransformIds(assignedUsers)
            data.dept_ids = deptIds ? deptIds : []
            data.assigned_due_date = assignedDueDate ? convertDateFormat(assignedDueDate) : ""
            data.user_ids = userIds ? userIds : []
        } else {
            data.dept_ids = []
            data.assigned_due_date = ""
            data.user_ids = []
        }

        validateFormData(taskSchema, data).then(() => {
            addTask(data).then((res) => {
                let SuccessfullyMessage = res.data.message;
                if (props?.openModel) {
                    props?.openModel(res.data?.id, SuccessfullyMessage)
                }
                setIsError(false)
                setDesiredDueDate(getCurrentDate())
                setDeadlineDate(null)
                setIsOpen(false)
                setAssignedUsers([])
                setAssignedDueDate(getCurrentDate())
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
        setDesiredDueDate(getCurrentDate())
        setDeadlineDate(null)
        props.onClick()
        setIsOpen(false)
        setAssignedUsers([])
        setAssignedDueDate(getCurrentDate())
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

                        <div className='myIcon' type='button' onClick={cancelButtnHandler}>
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
                            desiredDueDate={desiredDueDate}
                            setDesiredDueDate={setDesiredDueDate}
                            deadlineDate={deadlineDate}
                            setDeadlineDate={setDeadlineDate}
                            isFromJob={props.isFromJob}
                            assignedUsers={assignedUsers}
                            setAssignedUsers={setAssignedUsers}
                            assignedDueDate={assignedDueDate}
                            setAssignedDueDate={setAssignedDueDate}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
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

export default JobTask;
