/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import '../../SCSS/popups.scss';
import { convertDateFormatTwo } from '../../../Utils/dateFormat';
import { billingTypes, billingTypesTwo, jobStatuses, billingFrequency, recurrenceFrequency, jobDocExtentions } from '../../../Utils/staticdata';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
import { deleteJobDocument, uploadJobDocument } from '../../../API/authCurd';
import { convertToHHMM, downloadFile, generateNumberArray, hoursRemaining, numCheck } from '../../../Utils/helpers';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { WarningDialog, confirmDelete } from '../../commonModules/UI/Dialogue';
import * as FaIcons from 'react-icons/fa';
import { IoChevronDownSharp } from "react-icons/io5";
import { CustomerContext } from '../../contexts/CustomerContext';
import UpdateCust from '../custpops/UpdateCust';
import { sortByConcatenatedString, sortObjectsByAttribute } from '../../../Utils/sortFunctions';

const UpadateJobForm = ({ updatedJobData, setUpdateJobdData, jobCodes, customerList, responsibleUser, formError, setFormError, selectedJob, getJobList, paginationData, getJobListPagination, filters, isClientRequest }) => {
    const [fileList, setFileList] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null)
    const [openWarning, setOpenWarning] = useState(false)
    const mandatoryFields = ['name', 'customer', 'type', 'billing_type', 'assigned_user_id'];
    const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
        selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
        setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
        setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
        setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
        updateCustomerPopupOpen } = useContext(CustomerContext)

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);
    let userType = localStorage.getItem('usertype')

    const onChangeHandler = (e) => {
        let errors = formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        if(e.target.name == "projected_hours_hrs" || e.target.name == "projected_hours_mins"){
            delete errors["projected_hours"];
        }
        setFormError(errors)
        if (e.target.name == "number_of_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), updatedJobData.hours_used)
            setUpdateJobdData({ ...updatedJobData, number_of_hours: e.target.value, hours_remaining: hrsRemaining })
        } else if (e.target.name == "max_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), updatedJobData.hours_used)
            setUpdateJobdData({ ...updatedJobData, max_hours: e.target.value, hours_remaining: hrsRemaining })
        } else {
            setUpdateJobdData({ ...updatedJobData, [e.target.name]: e.target.value })
        }
    }

    const checkBoxChangeHandler = (e, item) => {
        let errors = formError;
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name];
        }
        setFormError(errors);
        setUpdateJobdData({ ...updatedJobData, unlimited_hours: !updatedJobData.unlimited_hours })
    }

    // Handler function to update due date
    const handleDueDateChange = (date) => {
        setUpdateJobdData({ ...updatedJobData, desired_due_date: convertDateFormatTwo(date) })
    };
    // Handler function to update due date
    const handleDeadlineDateChange = (date) => {
        setUpdateJobdData({ ...updatedJobData, deadline: convertDateFormatTwo(date) })
    };
    // Handler function to update due date
    const handleDesiredStartDateChange = (date) => {
        setUpdateJobdData({ ...updatedJobData, desired_start_date: convertDateFormatTwo(date) })
    };

    const handleRecurringJobChange = (e) => {
        setUpdateJobdData({ ...updatedJobData, recurring_job: e.target.value == "true" ? false : true })
    }

    useEffect(() => {
        if (selectedJob) {
            const doc = selectedJob?.document_details?.map((doc) => {
                let parts = doc.document_url.split("/")
                let name = parts[parts.length - 1]
                return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
            })
            setFileList(doc)
        }
    }, [selectedJob])

    // Document upload handler
    const documentUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        if (!jobDocExtentions.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('documents1', data.file)
            formData.append('id', selectedJob.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadJobDocument(formData, config).then((res) => {
                onSuccess(res.data)
                // getJobList()
                getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
            }).catch(err => {
                onError({ message: err.response?.data.message || "Failed to upload document" })
            })
        } else {
            // let exts = jobDocExtentions.join(", ")
            onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
        }
    }

    // Docuemnt remove function
    function removeDocument(id) {
        deleteJobDocument(id).then(() => {
            // getJobList(false)
            getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
            setFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteJobDocument-err", err)
        })
    }

    // Document remove Handler
    const handleRemove = (e) => {
        let isConfirm = confirmDelete("document")
        if (isConfirm) {
            if (e.status == "error") {
                setFileList((prev) => { return prev.filter((item) => item.uid != e.uid) })
            } else {
                removeDocument(e.uid)
            }
        }
    }

    // Document download Handler
    const handleDownload = (e) => {
        downloadFile(e.url, e.name)
    }

    // Document onchange Handler
    const docOnChangehandler = (e) => {
        if (e.file.status == "done") {
            let items = [...fileList]
            let newArr = items.map((item) => {
                if (item.uid == e.file.uid) {
                    let parts = e.file.response?.url?.split("/")
                    let name = parts[parts.length - 1]
                    return { uid: e.file.response.document_id, name: name ? name : "Document", status: 'done', url: e.file.response.url }
                }
                return item
            })
            setFileList(newArr)
        } else {
            setFileList(e.fileList)
        }
    }

    const onCustomerIconClick = (id) => {
        setOpenWarning(true)
        setSelectedCustomerId(id)
    }

    const onOkButtonClick = () => {
        setOpenWarning(false)
        if (selectedCustomerId) {
            updateCustomerPopupOpen(selectedCustomerId)
        }
    }

    const onNoButtonClick = () => {
        setOpenWarning(false)
        setSelectedCustomerId(null)
    }

    return (
        <>
            <div className='d-flex flex-wrap w-100'>
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className={`addCust w-50  pe-4 ${isFieldMandatory('customer') ? 'mandatory-field' : ''}`}>
                    <div className='custom-select-box-wrap'>
                    <FloatingLabel label={`Customer${isFieldMandatory('customer') ? ' *' : ''}`} className='custom-select'>
                        <Form.Select aria-label="Client" name='customer' value={updatedJobData?.customer ?? ""} onChange={onChangeHandler}
                            disabled={isClientRequest && userType == 3}
                        >
                            <option key={0} value="">Select Customer</option>
                            {customerList?.length > 0 && sortObjectsByAttribute(customerList).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                        
                    </FloatingLabel>
                    <div className='icon'>
                            {(userType != 3) && <FaIcons.FaBriefcase className='icon-style' title='View Customer' onClick={() => onCustomerIconClick(updatedJobData?.customer)} />}
                        </div>
                    </div>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>

                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className={`addCust w-50  ${isFieldMandatory('type') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Job Code${isFieldMandatory('type') ? ' *' : ''}`}>
                        <Form.Select aria-label="Job Code" name='type' value={updatedJobData?.type ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Assign Code</option>
                            {jobCodes?.length > 0 && sortObjectsByAttribute(jobCodes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.type ? <span className='ms-2 text-danger'>{formError?.type}</span> : null}
                </div>

                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className={`addCust w-50  pe-4 ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Job Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' value={updatedJobData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name ? <span className='ms-2 text-danger'>{formError?.name}</span> : null}
                </div>

                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='w-50 addCust '>
                    <FloatingLabel label="Job Description (will appear on customer invoice)" className='textarea-label'>
                        <Form.Control
                            as="textarea" value={updatedJobData?.description ?? ""} onChange={onChangeHandler}
                            placeholder="Leave a comment here"
                            style={{ minHeight: '45px', marginTop: "0px" }}
                            name='description' />
                    </FloatingLabel>
                </div>

                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className={`addCust pe-4 ${isFieldMandatory('assigned_user_id') ? 'mandatory-field w-50' : ''}`}>
                    <FloatingLabel label={`Responsible User ${isFieldMandatory('assigned_user_id') ? ' *' : ''}`}>
                        <Form.Select aria-label="Responsible User" name='assigned_user_id' value={updatedJobData?.assigned_user_id ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Select responsible user</option>
                            {responsibleUser?.length > 0 && sortByConcatenatedString(responsibleUser, ['abv', 'first_name', 'last_name']).map((item) => {
                                return <option key={item.id} value={item.id}>{item?.abv ? item?.abv + " - " : ""}{item.first_name ? item.first_name : ""} {item.last_name ? item.last_name : ""}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.assigned_user_id ? <span className='ms-2 text-danger'>{formError?.assigned_user_id}</span> : null}
                </div>
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='w-50 addCust'>
                    <div className='d-flex'>
                        <div className='w-50 pe-4'>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Project Deadline</label>
                                <DatePicker
                                    value={updatedJobData?.deadline ? dayjs(updatedJobData?.deadline, "MM/DD/YYYY") : ""}
                                    onChange={handleDeadlineDateChange}
                                    name='deadline'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>
                        {(updatedJobData?.type == 6) && <div className='w-50 pe-4'>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Desired Start Date</label>
                                <DatePicker
                                    value={updatedJobData?.desired_start_date ? dayjs(updatedJobData?.desired_start_date, "MM/DD/YYYY") : ""}
                                    onChange={handleDesiredStartDateChange}
                                    name='desired_start_date'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>}
                        <div className='w-50'>
                            <div className='myInputBox'>
                                <label styl={{ display: "block" }}>Desired Due Date</label>
                                <DatePicker
                                    value={updatedJobData?.desired_due_date ? dayjs(updatedJobData?.desired_due_date, "MM/DD/YYYY") : ""}
                                    onChange={handleDueDateChange}
                                    name='desired_due_date'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='w-50 addCust pe-4'>
                    <FloatingLabel label="Priority *">
                        <Form.Select aria-label="Priority" name='priority'
                            value={updatedJobData?.priority ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option value="">Select Priority</option>
                            <option value="2">High</option>
                            <option value="1">Normal</option>
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.priority ? <span className='ms-2 text-danger'>{formError?.priority}</span> : null}
                </div>
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='w-50 addCust'>
                    <FloatingLabel label="Status *">
                        <Form.Select aria-label="status" name='status' value={updatedJobData?.status ?? ""} onChange={onChangeHandler}>
                            <option value="">Select Status</option>
                            {jobStatuses?.length > 0 && sortObjectsByAttribute(jobStatuses).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.status ? <span className='ms-2 text-danger'>{formError?.status}</span> : null}
                </div>
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='recurring-job w-100'>
                    <Form.Check // prettier-ignore
                        type='checkbox'
                        label='Recurring Job'
                        name='recurring_job'
                        checked={updatedJobData?.recurring_job}
                        value={updatedJobData?.recurring_job}
                        onChange={handleRecurringJobChange}
                    />
                    <div>
                        {updatedJobData?.recurring_job ?
                            <div className='d-flex flex-wrap'>
                            <div className='w-50 addCust pe-4'>
                                <FloatingLabel label="Recurrence is on">
                                    <Form.Select
                                        aria-label="Recurrence   is on"
                                        name='recurrence_on'
                                        value={updatedJobData?.recurrence_on ?? ""}
                                        onChange={onChangeHandler}
                                    >
                                        <option value="">Select day of the month</option>
                                        {generateNumberArray(1, 31, 1).map((item, index) => {
                                            return <option value={item} key={index}>{item}</option>
                                        })}
                                    </Form.Select>
                                </FloatingLabel>
                                </div>
                                <div className='w-50 addCust'>
                                <FloatingLabel label="Recurrence Frequency" className=''> 
                                    <Form.Select
                                        aria-label="Recurrence Frequency"
                                        name='recurrence_frequency'
                                        value={updatedJobData?.recurrence_frequency ?? ""}
                                        onChange={onChangeHandler}
                                    >
                                        <option key={0} value="">Select the frequency</option>
                                        {recurrenceFrequency?.length > 0 && recurrenceFrequency.map((item) => {
                                            return <option key={item.id} value={item.id}>{item.name}</option>
                                        })}
                                    </Form.Select>
                                </FloatingLabel>
                            </div>
                            </div>
                            : null}
                    </div>
                </div>
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className={`addCust w-50  pe-4 ${isFieldMandatory('billing_type') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Billing Type ${isFieldMandatory('billing_type') ? ' *' : ''}`}>
                        <Form.Select aria-label="Responsible User" name='billing_type' value={updatedJobData?.billing_type ?? ""} onChange={onChangeHandler}>
                            <option value="">Select billing type</option>
                            {updatedJobData?.type == 6 ? sortObjectsByAttribute(billingTypesTwo).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            }) : sortObjectsByAttribute(billingTypes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.billing_type ? <span className='ms-2 text-danger'>{formError?.billing_type}</span> : null}
                </div>
                {/* show if 'House Billing / No Charge' or 'Lump Sum / Non Hourly Billing' is selected */}
                <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }} className='d-flex w-100 hours-time-wrap flex-wrap flex-sm-nowrap mb-3'>
                    {((updatedJobData?.billing_type == 3 || updatedJobData?.billing_type == 4) && (updatedJobData?.type != 6)) && <div className='pe-4 w-50'>
                        <div className='custom-h-t'>
                            <FloatingLabel label="Projected Hours *">
                                <Form.Select
                                    aria-label="actual_duration_hrs"
                                    name='projected_hours_hrs'
                                    value={updatedJobData?.projected_hours_hrs ?? ""}
                                    onChange={onChangeHandler}
                                >
                                    <option value="" key={0}>Hours</option>
                                    {generateNumberArray(0, 48, 1).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel >
                                <Form.Select
                                    aria-label="actual_duration_mins"
                                    name='projected_hours_mins'
                                    value={updatedJobData?.projected_hours_mins ?? ""}
                                    onChange={onChangeHandler}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                        {formError?.projected_hours ? <span className='ms-2 text-danger'>{formError?.projected_hours}</span> : null}
                    </div>}
                    {/* show if 'Lump Sum / Non Hourly Billing' is selected */}
                    {updatedJobData?.billing_type == 3 && <div className='w-50'>
                        <FloatingLabel label="Dollar Amount *">
                            <Form.Control
                                type='number'
                                aria-label="dollar ammount"
                                name='job_amount' min={0}
                                value={updatedJobData?.job_amount ?? ""}
                                onChange={onChangeHandler}
                                step={0.01}
                                onKeyDown={(e) => numCheck(e)} />
                        </FloatingLabel>
                        {formError?.job_amount ? <span className='ms-2 text-danger'>{formError?.job_amount}</span> : null}
                    </div>}

                    {(updatedJobData?.billing_type == 5) && <div className='w-50 pe-4 addCust'>
                        <FloatingLabel label="Number Of Hours">
                            <Form.Control
                                type={updatedJobData.unlimited_hours ? "text" : 'number'}
                                aria-label="number_of_hours"
                                name='number_of_hours'
                                min={0}
                                step={0.01}
                                value={updatedJobData.unlimited_hours ? "Unlimited" : updatedJobData?.number_of_hours ?? "0"}
                                onChange={onChangeHandler}
                                readOnly={updatedJobData.unlimited_hours ? true : false}
                            />
                        </FloatingLabel>
                        <Form.Check
                            type="checkbox"
                            name='unlimited_hours'
                            label={`Unlimited Hours`}
                            checked={updatedJobData.unlimited_hours == 1 ? true : false}
                            value={updatedJobData.unlimited_hours == 1 ? true : false}
                            onChange={checkBoxChangeHandler}
                        />
                    </div>}

                    {(updatedJobData?.billing_type == 6) && <>
                        <div className='w-50 pe-4 addCust'>
                            <FloatingLabel label="Billing Frequency">
                                <Form.Select
                                    aria-label="billing_frequency"
                                    name='billing_frequency'
                                    value={updatedJobData?.billing_frequency ?? ""}
                                    onChange={onChangeHandler}
                                >
                                    <option value="">Select frequency type</option>
                                    {billingFrequency?.length > 0 && billingFrequency.map((item) => {
                                        return <option key={item.id} value={item.id}>{item.name}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>

                        <div className='w-50 pe-4 addCust'>
                            <FloatingLabel label="Max Hours">
                                <Form.Control
                                    type='number'
                                    aria-label="max_hours"
                                    name='max_hours'
                                    min={0}
                                    step={0.01}
                                    value={updatedJobData?.max_hours ?? ""}
                                    onChange={onChangeHandler}
                                />
                            </FloatingLabel>
                        </div>
                    </>}

                    {(updatedJobData?.billing_type == 5 || updatedJobData?.billing_type == 6) && <>
                        <div className='w-50 pe-4 addCust'>
                            <FloatingLabel label="Hours Used">
                                <Form.Control
                                    type='text'
                                    aria-label="hours_used"
                                    name='hours_used'
                                    value={updatedJobData?.hours_used ?? "0:0"}
                                    onChange={onChangeHandler}
                                    readOnly={true}
                                />
                            </FloatingLabel>
                        </div>

                        <div className='w-50 addCust'>
                            <FloatingLabel label="Hours Remaining">
                                <Form.Control
                                    type='text'
                                    aria-label="hours_remaining"
                                    name='hours_remaining'
                                    value={updatedJobData.unlimited_hours ? "Unlimited" : updatedJobData?.hours_remaining ?? "0"}
                                    onChange={onChangeHandler}
                                    readOnly={true}
                                />
                            </FloatingLabel>
                        </div>
                    </>}

                </div>
            </div>
            <div style={{ pointerEvents:  isClientRequest && userType == 3 ? "none" : "all" }}>
            <CustomerDocUpload
                multiple={true}
                customRequest={documentUploadCustomRequest}
                fileList={fileList}
                onChange={docOnChangehandler}
                handleDownload={handleDownload}
                handleRemove={handleRemove}
                />
            </div>

            {openWarning && <WarningDialog okClick={onOkButtonClick} noClick={onNoButtonClick} title={"Warning: Unsaved Changes"} description={"There are unsaved changes present on this form. Would you like to continue?"} />}
            {openCustomerPopup && <div className={`mainpopups`}>
                <UpdateCust
                    paymentTerms={customerPaymentTerms}
                    clientStatus={customerStatus}
                    countries={customerCountries}
                    states={customerStates}
                    cities={customerCities}
                    getCustomersList={getJobListPagination}
                    selectedCustomer={selectedCustomer}
                    onClick={updateCustomerCancelClickHandler}
                    ibUsers={customerIbUsers}
                    formError={customerFormError}
                    setFormError={setCustomerFormError}
                    paginationData={paginationData}
                    getCustomersListPagination={getJobListPagination}
                    setUserDetail={setCustomerUserDetail}
                    creditFormError={customerCreditFormError}
                    setCreditFormError={setCustomerCreditFormError}
                    creditEditFormError={customerCreditEditFormError}
                    setCreditEditFormError={setCustomerCreditEditFormError}
                    creditAddFormValue={customerCreditAddFormValue}
                    setCreditAddFormValue={setCustomerCreditAddFormValue}
                    creditEditFormValue={customerCreditEditFormValue}
                    setCreditEditFormValue={setCustomerCreditEditFormValue}
                    creditIsEditMode={customerCreditIsEditMode}
                    setCreditIsEditMode={setCustomerCreditIsEditMode}
                    updatedData={customerUpdatedData}
                    setUpdatedData={setCustomerUpdatedData}
                    isFromCustomer={false}
                    filters={filters}
                />
                <div className="blurBg"></div>
            </div>}
        </>
    );
}

export default UpadateJobForm;