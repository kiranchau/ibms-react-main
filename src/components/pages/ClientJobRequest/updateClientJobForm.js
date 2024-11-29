/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import '../../SCSS/popups.scss';
import { convertDateFormatTwo } from '../../../Utils/dateFormat';
import { clientJobRequestStatus, jobDocExtentions } from '../../../Utils/staticdata';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
import { deleteJobDocument, uploadJobDocument } from '../../../API/authCurd';
import { downloadFile } from '../../../Utils/helpers';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';

const UpadateClinetJobForm = ({ updatedJobData, setUpdateJobdData, customerList, formError, setFormError, selectedJob, paginationData, getJobListPagination, filters }) => {
    const [fileList, setFileList] = useState([]);
    const mandatoryFields = ['name', 'customer'];
    let userCustomerId = localStorage.getItem("customerId")
    let userType = localStorage.getItem("usertype")
    const { companies } = useContext(GlobalSearch)

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    const onChangeHandler = (e) => {
        let errors = formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        setFormError(errors)

        setUpdateJobdData({ ...updatedJobData, [e.target.name]: e.target.value })
    }

    // Handler function to update due date
    const handleDueDateChange = (date) => {
        setUpdateJobdData({ ...updatedJobData, desired_due_date: convertDateFormatTwo(date) })
    };

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
            getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
            setFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteJobDocument-err", err)
        })
    }

    // Document remove Handler
    const handleRemove = (e) => {
        let isConfirm = confirmDelete("Document")
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

    return (
        <>
            <div className='d-flex flex-wrap w-100'>
                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label="Job Status">
                        <Form.Select
                            aria-label="status"
                            name='status'
                            value={updatedJobData?.status ?? "11"}
                            onChange={onChangeHandler}
                            disabled={userType == "3"}
                        >
                            {clientJobRequestStatus?.length > 0 && clientJobRequestStatus.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>

                <div className={`addCust w-50 ${isFieldMandatory('customer') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Company ${isFieldMandatory('customer') ? ' *' : ''}`} className='custom-select'>
                        <Form.Select
                            aria-label="Client"
                            name='customer'
                            value={updatedJobData?.customer ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value="">Select Company</option>
                            {(userType == "3" && companies?.length > 0) ? sortObjectsByAttribute(companies).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            }) : sortObjectsByAttribute(customerList).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>

                <div className={`addCust w-50  pe-4 ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Job Name ${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' value={updatedJobData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name ? <span className='ms-2 text-danger'>{formError?.name}</span> : null}
                </div>

                <div className='w-50 addCust '>
                    <FloatingLabel label="Job Description" className='textarea-label'>
                        <Form.Control
                            as="textarea" value={updatedJobData?.description ?? ""} onChange={onChangeHandler}
                            placeholder="Leave a comment here"
                            style={{ minHeight: '45px', marginTop: "0px" }}
                            name='description' />
                    </FloatingLabel>
                </div>

                <div className='w-50 addCust'>
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
            <CustomerDocUpload
                multiple={true}
                customRequest={documentUploadCustomRequest}
                fileList={fileList}
                onChange={docOnChangehandler}
                handleDownload={handleDownload}
                handleRemove={handleRemove}
            />
        </>
    );
}

export default UpadateClinetJobForm;