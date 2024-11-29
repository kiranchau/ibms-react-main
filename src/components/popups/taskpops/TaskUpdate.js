/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import React, { useEffect, useRef, useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { updatetask } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import TaskUpadateForm from './TaskUpdateForm';
import { convertDateFormat, convertDateFormatTwo } from '../../../Utils/dateFormat';
import { convertObject, isObjectNotEmpty, joinHoursMinutes } from '../../../Utils/helpers';
import { taskSchema, validateFormData } from '../../../Utils/validation';
import { IoIosCloseCircle } from "react-icons/io";
import { Alert } from 'antd';

const TaskUpdate = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [isUpdating, setIsUpdating] = useState(false)
    const [fileList, setFileList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [editFormError, setEditFormError] = useState({})
    const [isAssignUserEditMode, setIsAssignUserEdit] = useState(false)
    const [selectedAssignUser, setSelectedAssignUser] = useState(null)
    const [editUserData, setEditUserData] = useState({})
    const usertype = localStorage.getItem('usertype')
    const alertRef = useRef(null)

    useEffect(() => {
        if (props?.taskUpdateDetail) {
            const { customer, status, name, description, deadline, desired_due_date, priority, project, service_type, estimated_duration, actual_duration, completion_date, duration_string } = props?.taskUpdateDetail
            let data = {
                name: name ?? (name === "" ? "" : name),
                status: status ?? (status === "" ? "" : status),
                customer: customer ?? (customer === "" ? "" : customer),
                project: project ?? (project === "" ? "" : project),
                description: description ?? (description === "" ? "" : description),
                deadline: deadline ?? (deadline === "" ? "" : deadline),
                desired_due_date: desired_due_date ?? (desired_due_date === "" ? "" : desired_due_date),
                // completion_date: completion_date ?? (completion_date === "" ? "" : completion_date),
                completion_date: completion_date ? convertDateFormatTwo(completion_date) : "",
                priority: priority ?? (priority === "" ? "" : priority),
                service_type: service_type?.id ?? "",
                // estimated_duration: estimated_duration ?? (estimated_duration === "" ? "" : estimated_duration),
                // actual_duration: actual_duration ?? (actual_duration === "" ? "" : actual_duration),
                // estimated_duration_hrs: durationString?.[0] ? durationString?.[0] : "",
                // estimated_duration_mins: durationString?.[1] ? durationString?.[1] : "",
            }

            if (duration_string) {
                const durationString = duration_string?.split(",")
                data.actual_duration_hrs = durationString?.[2] ? durationString?.[2] : ""
                data.actual_duration_mins = durationString?.[3] ? durationString?.[3] : ""
                data.estimated_duration_hrs = durationString?.[0] ? durationString?.[0] : ""
                data.estimated_duration_mins = durationString?.[1] ? durationString?.[1] : ""
            } else {
                const actualDuration = actual_duration?.split(":")
                const estimatedDuration = estimated_duration?.split(":")
                data.actual_duration_hrs = actualDuration?.[0] ? Number(actualDuration?.[0]) : ""
                data.actual_duration_mins = actualDuration?.[1] ? Number(actualDuration?.[1]) : ""
                data.estimated_duration_hrs = estimatedDuration?.[0] ? estimatedDuration?.[0] : ""
                data.estimated_duration_mins = estimatedDuration?.[1] ? estimatedDuration?.[1] : ""
            }

            props.setUpdatetaskdData(data)
        }
    }, [props?.taskUpdateDetail])

    function handleSubmit(event) {
        event.preventDefault();
        setIsUpdating(true)
        let data = {
            ...props?.updatedtaskData,
            desired_due_date: convertDateFormat(props?.updatedtaskData.desired_due_date),
            completion_date: convertDateFormat(props.updatedtaskData.completion_date),
            estimated_duration: joinHoursMinutes(props?.updatedtaskData.estimated_duration_hrs, props?.updatedtaskData.estimated_duration_mins, ":"),
            actual_duration: joinHoursMinutes(props?.updatedtaskData.actual_duration_hrs, props?.updatedtaskData.actual_duration_mins, ":"),
            duration_string: `${props?.updatedtaskData.estimated_duration_hrs ? props?.updatedtaskData.estimated_duration_hrs : ""},${props?.updatedtaskData.estimated_duration_mins ? props?.updatedtaskData.estimated_duration_mins : ""},${props?.updatedtaskData.actual_duration_hrs ? props?.updatedtaskData.actual_duration_hrs : ""},${props?.updatedtaskData.actual_duration_mins ? props?.updatedtaskData.actual_duration_mins : ""}`,
            // duration_string: `,,${props?.updatedtaskData.actual_duration_hrs ? props?.updatedtaskData.actual_duration_hrs : ""},${props?.updatedtaskData.actual_duration_mins ? props?.updatedtaskData.actual_duration_mins : ""}`,
        }

        validateFormData(taskSchema, data).then(() => {
            updatetask(data, props.taskUpdateDetail.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props?.setSuccessMessage(SuccessfullyMessage)
                    if(alertRef?.current){
                        alertRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                    setTimeout(()=>{
                        props.setSuccessMessage("")
                    }, 10000)
                    // props.getTaskList()
                    props.getTaskListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    setIsUpdating(false)
                    // setIsError(false)
                    // setErrMessage(SuccessfullyMessage)
                    // setPopMsg(true)
                    setIsOpen(false)
                    setIsAssignUserEdit(false)
                    // setSelectedAssignUser(null)
                    // setEditUserData({})
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response.data.message;
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                    setIsUpdating(false)
                    setIsOpen(false)
                    setIsAssignUserEdit(false)
                })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    const cancelButtonHandler = () => {
        setIsAssignUserEdit(false)
        setSelectedAssignUser(null)
        setEditUserData({})
        setIsOpen(false)
        setFileList([])
        setEditFormError({})
        props.settaskUpdateDetail([])
        props.onClick()
        props.setSuccessMessage("")
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
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
        <form onSubmit={handleSubmit} noValidate>
            <div className='popups d-flex justify-content-center align-items-center'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Update Task</div>
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
                        <TaskUpadateForm
                            serviceTypes={props.serviceTypes}
                            customerList={props.customerList}
                            updatedtaskData={props.updatedtaskData}
                            setUpdatetaskdData={props.setUpdatetaskdData}
                            formError={props.formError}
                            setFormError={props.setFormError}
                            selectedTask={props?.taskUpdateDetail}
                            getTaskList={props.getTaskList}
                            isCallEntry={props.isCallEntry}
                            fileList={fileList}
                            setFileList={setFileList}
                            paginationData={props.paginationData}
                            getTaskListPagination={props.getTaskListPagination}
                            filters={props.filters}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            editFormError={editFormError}
                            setEditFormError={setEditFormError}
                            isAssignUserEditMode={isAssignUserEditMode}
                            setIsAssignUserEdit={setIsAssignUserEdit}
                            selectedAssignUser={selectedAssignUser}
                            setSelectedAssignUser={setSelectedAssignUser}
                            editUserData={editUserData}
                            setEditUserData={setEditUserData}
                        />

                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                            {(usertype == 1 || usertype == 2) && <Button type="submit" disable={isUpdating}>Update</Button>}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default TaskUpdate;
