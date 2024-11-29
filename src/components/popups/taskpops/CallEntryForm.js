/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import { fetchJobs } from '../../../API/authCurd';
import { DatePicker } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { calculateTimeDuration, convertDateFormatTwo } from '../../../Utils/dateFormat';
import { IoChevronDownSharp } from "react-icons/io5";
import * as MdIcons from 'react-icons/md';
import TimeRangePicker from '../../commonModules/UI/TimeRangePicker';
import { JobContext } from '../../contexts/JobContext';

import dayjs from "dayjs"
import 'dayjs/locale/en';
import UpdateForm from '../jobspopups/updateForm';
import { sortByConcatenatedString } from '../../../Utils/sortFunctions';

const CallEntryForm = ({ updatedtaskData, setUpdatetaskdData, customerList, formError, setFormError, isCallEntry, paginationData, getTaskListPagination, filters, ibUsers, callEntryErrors, setCallEntryErrors }) => {
    const [jobs, setJobs] = useState([]);
    const mandatoryFields = ['name', 'customer', 'project', 'service_type'];
    const {
        jobOpenPopup, jobSectionCodes, JobPaymentTerms, JobCustomerList, selectedJobForSection, setSelectedJobForSection,
        JobResponsibleUser, JobFormError, setJobFormError, updateJobCancelClickHandler, updateJobPopupOpen, jobSuccessMessage, setJobSuccessMessage
    } = useContext(JobContext)

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    const onChangeHandler = (e) => {
        let err = formError
        if (err.hasOwnProperty(e.target.name)) {
            delete err[e.target.name]
        }
        setFormError(err)
        let callerr = callEntryErrors
        if (callerr.hasOwnProperty(e.target.name)) {
            delete callerr[e.target.name]
        }
        setCallEntryErrors(callerr)
        setUpdatetaskdData({ ...updatedtaskData, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        if (updatedtaskData?.customer) {
            getJobsData(updatedtaskData?.customer)
        }
    }, [updatedtaskData?.customer])

    const getJobsData = (id) => {
        fetchJobs(id).then((res) => {
            if (res.data?.jobs) { setJobs(res.data?.jobs) }
        }).catch(() => { setJobs([]) })
    }

    const handleStartDateChange = (date) => {
        let callerr = callEntryErrors
        if (callerr.hasOwnProperty("start_date")) {
            delete callerr["start_date"]
        }
        if (callerr.hasOwnProperty("date_time_validation")) {
            delete callerr["date_time_validation"]
        }
        setCallEntryErrors(callerr)
        setUpdatetaskdData({ ...updatedtaskData, start_date: convertDateFormatTwo(date), call_log_duration: calculateTimeDuration(convertDateFormatTwo(date), updatedtaskData.start_time, updatedtaskData?.stop_date, updatedtaskData.end_time) })
    }

    const handleStopDateChange = (date) => {
        let callerr = callEntryErrors
        if (callerr.hasOwnProperty("stop_date")) {
            delete callerr["stop_date"]
        }
        if (callerr.hasOwnProperty("date_time_validation")) {
            delete callerr["date_time_validation"]
        }
        setCallEntryErrors(callerr)
        setUpdatetaskdData({ ...updatedtaskData, stop_date: convertDateFormatTwo(date), call_log_duration: calculateTimeDuration(updatedtaskData?.start_date, updatedtaskData.start_time, convertDateFormatTwo(date), updatedtaskData.end_time) })
    }

    const onJobIconClick = (id) => {
        if (id) {
            updateJobPopupOpen(id)
        }
    }

    return (
        <>
        <div>
            <div className='d-flex flex-wrap w-100'>
                <div className={`addCust pe-4 ${isFieldMandatory('customer') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel className='custom-select' label={`Customer${isFieldMandatory('customer') ? ' *' : ''}`}>
                        <Form.Select aria-label="Client" name='customer' value={updatedtaskData?.customer ?? ""} disabled={isCallEntry} onChange={onChangeHandler}>
                            <option key={0} value="">Select Customer</option>
                            {customerList?.length > 0 && customerList.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>

                <div className={`addCust pe-4 ${isFieldMandatory('project') ? 'mandatory-field' : ''}`}>
                <div className='custom-select-box-wrap bg-select-color'>
                    <FloatingLabel className='custom-select' label={`Job${isFieldMandatory('project') ? ' *' : ''}`}>
                        <Form.Select aria-label="Job" name='project' value={updatedtaskData?.project ?? ""} disabled={isCallEntry} onChange={onChangeHandler}>
                            <option key={0} value="">Select Job</option>
                            {jobs?.length > 0 && jobs.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                     
                    </FloatingLabel>
                    <div className='icon'>
                            <MdIcons.MdFactory className='icon-style' title='View Job' style={{ width: '19px', height: '19px' }} onClick={() => onJobIconClick(updatedtaskData?.project)} />
                        </div>
                    </div>
                </div>

                <div className={`addCust  ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Task Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' disabled={isCallEntry} value={updatedtaskData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                </div>
                <div className='w-50 pe-4 addCust'>
                    <FloatingLabel label="Task Details" className='textarea-label'>
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '30px' }}
                            className='mt-0'
                            name='description'
                            value={updatedtaskData?.description ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                </div>

                    <div className={`addCust  w-50`}>
                        <FloatingLabel label={`IB-RECRUIT Agent`}>
                            <Form.Select
                                aria-label="IB-RECRUIT Agent"
                                name='assignee'
                                value={updatedtaskData?.assignee ?? ""}
                                onChange={onChangeHandler}>
                                <option key={0} value="">Select Agent</option>
                                {ibUsers?.length > 0 && sortByConcatenatedString(ibUsers, ['first_name', 'last_name']).map((item) => {
                                    return <option key={item.id} value={item.id}>{item.first_name ? item.first_name : ""} {item.last_name ? item.last_name : ""}</option>
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </div>
                <div className='w-50'>
                <div className='w-100 addCust pe-4 d-flex gap-3'>
                    <div className='w-100'>
                    <div className='myInputBox w-100 '>
                        <label style={{ display: "block" }}>Start Date *</label>
                        <DatePicker
                            value={updatedtaskData?.start_date ? dayjs(updatedtaskData?.start_date, "MM/DD/YYYY") : ""}
                            onChange={handleStartDateChange}
                            name='start_date'
                            format="MM/DD/YYYY"
                            className='myDatePicker'
                            placeholder="Start Date"
                        />
                    </div>
                    {callEntryErrors?.start_date ? <span className='ms-2 text-danger'>{callEntryErrors?.start_date}</span> : null}
                    </div>
                    <div className='w-100'>
                    <div className='myInputBox w-100'>
                        <label style={{ display: "block" }}>Stop Date *</label>
                        <DatePicker
                            value={updatedtaskData?.stop_date ? dayjs(updatedtaskData?.stop_date, "MM/DD/YYYY") : ""}
                            onChange={handleStopDateChange}
                            name='End_date'
                            format="MM/DD/YYYY"
                            className='myDatePicker'
                            placeholder="Stop Date"
                        />
                    </div>
                    {callEntryErrors?.stop_date ? <span className='ms-2 text-danger'>{callEntryErrors?.stop_date}</span> : null}
                    </div>
                </div>
                {callEntryErrors?.date_time_validation ? <span className='ms-1 text-danger'>{callEntryErrors?.date_time_validation}</span> : null}
                </div>

                <div className='w-50 addCust'>
                        <TimeRangePicker
                            updatedtaskData={updatedtaskData}
                            setUpdatetaskdData={setUpdatetaskdData}
                            callEntryErrors={callEntryErrors}
                            setCallEntryErrors={setCallEntryErrors}
                        />
                </div>
            </div>
        </div>
            {jobOpenPopup && <div className={`mainpopups`}>
                <UpdateForm
                    jobCodes={jobSectionCodes}
                    paymentTerms={JobPaymentTerms}
                    customerList={JobCustomerList}
                    getJobList={getTaskListPagination}
                    selectedJob={selectedJobForSection}
                    onClick={updateJobCancelClickHandler}
                    responsibleUser={JobResponsibleUser}
                    formError={JobFormError}
                    setFormError={setJobFormError}
                    getJobListPagination={getTaskListPagination}
                    paginationData={paginationData}
                    setSelectedJob={setSelectedJobForSection}
                    filters={filters}
                    successMessage={jobSuccessMessage}
                    setSuccessMessage={setJobSuccessMessage}
                />
                <div className="blurBg"></div>
            </div>}
        </>
    );
}

export default CallEntryForm;
