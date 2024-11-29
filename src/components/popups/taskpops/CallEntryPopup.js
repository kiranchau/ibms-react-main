/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import React, { useEffect, useRef, useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { updatetaskCallEntry } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { calculateTimeDifference, convertAndSplitDateTime, convertDateFormatTwo, convertToLocalUTC, parseDateTimeString } from '../../../Utils/dateFormat';
import { convertObject, deletePropertiesIfExists, isObjectNotEmpty } from '../../../Utils/helpers';
import { IoIosCloseCircle } from "react-icons/io";
import CallEntryForm from './CallEntryForm';
import { callTimeEntrySchema, validateFormData } from '../../../Utils/validation';
import { Alert } from 'antd';

const CallEntryPopup = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [isUpdating, setIsUpdating] = useState(false)
    const [fileList, setFileList] = useState([]);
    const [callEntryErrors, setCallEntryErrors] = useState({})
    const alertRef = useRef(null)

    useEffect(() => {
        setCallEntryErrors({})
        if (props?.taskUpdateDetail) {
            const { customer, name, description, call_log_duration, start_date, stop_date, project, end_time, start_time, assigned_user_details } = props?.taskUpdateDetail
            const localStartdateTime = convertAndSplitDateTime(start_date, start_time)
            const localStopDateTime = convertAndSplitDateTime(stop_date, end_time)
            let data = {
                name: name ?? (name === "" ? "" : name),
                customer: customer ?? (customer === "" ? "" : customer),
                project: project ?? (project === "" ? "" : project),
                description: description ?? (description === "" ? "" : description),
                start_date: localStartdateTime?.localDate ? convertDateFormatTwo(localStartdateTime?.localDate) : "",
                stop_date: localStopDateTime?.localDate ? convertDateFormatTwo(localStopDateTime?.localDate) : "",
                start_time: localStartdateTime?.localTime ? parseDateTimeString(localStartdateTime?.localTime, 13) : "",
                end_time: localStopDateTime?.localTime ? parseDateTimeString(localStopDateTime?.localTime, 13) : "",
                call_log_duration: (localStartdateTime && localStopDateTime) ? calculateTimeDifference(localStartdateTime?.localDate ? localStartdateTime?.localDate : "0000-00-00", 
                localStartdateTime?.localTime ? localStartdateTime?.localTime : '00:00:00', localStopDateTime?.localDate ? localStopDateTime?.localDate : "0000-00-00", localStopDateTime?.localTime ? localStopDateTime?.localTime : "00:00:00") : null,
                assignee: assigned_user_details ? assigned_user_details?.[0]?.user_id ? assigned_user_details?.[0]?.user_id : "" : "",
            }
            props.setUpdatetaskdData(data)
        }
    }, [props?.taskUpdateDetail])

    function handleSubmit(event) {
        event.preventDefault();
        setIsUpdating(true)
        let data = {
            ...props?.updatedtaskData,
            start_date: props?.updatedtaskData.start_date,
            stop_date: props?.updatedtaskData.stop_date,
            start_time: props?.updatedtaskData.start_time,
            end_time: props?.updatedtaskData.end_time,
        }
        validateFormData(callTimeEntrySchema, data).then(() => {
            let startDateTime = convertToLocalUTC(data.start_date, data.start_time)
            let endDateTime = convertToLocalUTC(data.stop_date, data.end_time)
            let payload = {
                ...data,
                start_date: `${startDateTime.date} 00:00:00`,
                stop_date: `${endDateTime.date} 00:00:00`,
                start_time: `${startDateTime.time}`,
                end_time: `${endDateTime.time}`,
            }
            deletePropertiesIfExists(payload, ["call_log_duration"])
            updatetaskCallEntry(payload, props.taskUpdateDetail.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props?.setSuccessMessage(SuccessfullyMessage)
                    if(alertRef?.current){
                        alertRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                    if(props.isFromHistory){
                        props.getTaskList(props?.taskUpdateDetail.project)
                    }else{
                        props.getTaskListPagination(props?.paginationData?.per_page, props?.paginationData?.current_page, props?.filters, false)
                    }
                    setCallEntryErrors({})
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
                        let errorMessage = err.response?.data.message ||  "Something went wrong!" ;
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                    setIsUpdating(false)
                })
        }).catch((err) => {
            setCallEntryErrors(err)
        })
    }

    const cancelButtonHandler = () => {
        setCallEntryErrors({})
        setFileList([])
        props.settaskUpdateDetail([])
        props.onClick()
        props.setSuccessMessage("")
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            setCallEntryErrors({})
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
                        <CallEntryForm
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
                            ibUsers={props.ibUsers}
                            callEntryErrors={callEntryErrors}
                            setCallEntryErrors={setCallEntryErrors}
                        />

                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                            <Button type="submit" disable={isUpdating}>Update</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default CallEntryPopup;
