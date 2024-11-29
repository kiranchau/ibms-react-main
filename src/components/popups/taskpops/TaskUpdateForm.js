/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useRef, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import { deleteAssignedUser, deleteTaskDocument, fetchJobs, getActivityNotesUsersDepartment, getSingleTask, postAssignedUserData, updateAssignedUserData, uploadTaskDocument } from '../../../API/authCurd';
import { DatePicker, Tooltip} from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { convertDateFormat, convertDateFormatTwo, getCurrentDate, parseDateTimeString } from '../../../Utils/dateFormat';
import { convertObject, downloadFile, generateNumberArray, isObjectNotEmpty, separateAndTransformIds } from '../../../Utils/helpers';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
import Dropdown from 'react-bootstrap/Dropdown';
import { IoMdAdd } from "react-icons/io";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import * as RiIcons from "react-icons/ri";
import { Table } from 'antd';
import TableBtn from "../../commonModules/UI/TableBtn";
import { WarningDialog, confirmDelete } from '../../commonModules/UI/Dialogue';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import * as FaIcons from 'react-icons/fa';  
import { IoChevronDownSharp } from "react-icons/io5";
import * as MdIcons from 'react-icons/md';
import { CustomerContext } from '../../contexts/CustomerContext';
import { JobContext } from '../../contexts/JobContext';
import UpdateCust from '../custpops/UpdateCust';
import UpdateForm from '../jobspopups/updateForm';
import { sortByDate, sortByString, sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { BiSolidEdit } from "react-icons/bi";
import { Checkbox } from 'antd';
import AssignUserCompletedCheckbox from './AssignUserCompletedCheckbox';

const customSort = (a, b) => {
    const nameA = `${a?.first_name ? a?.first_name : ""} ${a?.last_name ? a?.last_name : ""}`.trim().toLowerCase();
    const nameB = `${b?.first_name ? b?.first_name : ""} ${b?.last_name ? b?.last_name : ""}`.trim().toLowerCase();

    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
}

const customSortDep = (a, b) => {
    const nameA = a?.name ? a?.name : "";
    const nameB = b?.name ? b?.name : "";

    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    return 0;
}


const TaskUpadateForm = ({ updatedtaskData, setUpdatetaskdData, serviceTypes, customerList, formError, setFormError, getTaskList, selectedTask, isCallEntry, fileList, setFileList, paginationData, getTaskListPagination, filters, isOpen, setIsOpen, editFormError, setEditFormError, isAssignUserEditMode, setIsAssignUserEdit, editUserData, setEditUserData, selectedAssignUser, setSelectedAssignUser }) => {
    const [jobs, setJobs] = useState([]);
    const [checkboxStatesAssign, setCheckboxStatesAssign] = useState([]);
    const [checkboxDeptAssign, setCheckboxDeptAssign] = useState([]);
    const [searchBar, setSearchBar] = useState('');
    const [users, setUsers] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [assignedUsers, setAssignedUsers] = useState([])
    const [columns, setColumns] = useState([])
    const [selectedCustomerId, setSelectedCustomerId] = useState(null)
    const [openWarning, setOpenWarning] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState(null)
    const [openJobWarning, setOpenJobWarning] = useState(false)
    const [assignUserDueDate, setAssignUserDueDate] = useState(getCurrentDate())
    const mandatoryFields = ['name', 'customer', 'project', 'service_type'];
    const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
        selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
        setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
        setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
        setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
        updateCustomerPopupOpen } = useContext(CustomerContext)
    const {
        jobOpenPopup, jobSectionCodes, JobPaymentTerms, JobCustomerList, selectedJobForSection, setSelectedJobForSection,
        JobResponsibleUser, JobFormError, setJobFormError, updateJobCancelClickHandler, updateJobPopupOpen, jobSuccessMessage, setJobSuccessMessage
    } = useContext(JobContext)
    const [editUserList, setEditUserList] = useState([])
    const [editDepList, setEditDepList] = useState([])

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    const usertype = localStorage.getItem('usertype')

    const onChangeHandler = (e) => {
        let err = formError
        if (err.hasOwnProperty(e.target.name)) {
            delete err[e.target.name]
        }
        setFormError(err)
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

    const handleDesiredDateChange = (date) => {
        setUpdatetaskdData({ ...updatedtaskData, desired_due_date: convertDateFormatTwo(date) })
    }
    const handleProjectDeadlineChange = (date) => {
        setUpdatetaskdData({ ...updatedtaskData, completion_date: convertDateFormatTwo(date) })
    }
    
    const handleAssignUserDesiredDateChange = (date) => {
        setIsOpen(true)
        setAssignUserDueDate(convertDateFormatTwo(date))
    }

    const saveButtonHandler = (record) => {
        const userId = editUserData.user_id ? parseInt(editUserData.user_id) : ""; // Convert user_id to an integer

        let payload = {
            desired_due_date: editUserData.desired_due_date ? convertDateFormat(editUserData.desired_due_date) : "",
            task_id: record.task_id
        }

        if (userId < 0) {
            payload.user_id = null
            payload.dep_id = [Math.abs(userId)]
        } else {
            payload.user_id = Math.abs(userId)
            payload.dep_id = []
        }
        updateAssignedUserData(payload, record.task_assigned_user_id).then(()=>{
            setEditFormError({})
            getTaskForAssignedUsers(record?.task_id)
            setIsAssignUserEdit(false)
            setSelectedAssignUser(null)
            setEditUserData({})
        }).catch((err) => {
            let errFromBackend =  err.response?.data?.errors?.user_id
            if (errFromBackend) {
                setEditFormError((prev) => ({ ...prev, user_id: errFromBackend ? errFromBackend : "" }))
            }
        })
    }

    const editButtonHandler = (record) => {
        setEditFormError({ user_id: "" })
        getActivityNotesUsersDepartment(1).then((res) => {
            if (res.data?.users) {
                let userList = res.data?.users?.filter((item) => { if (item.email) { return item } })
                let deptList = res.data?.users?.filter((item) => { if (!item.email) { return item } })
                let newDepList = deptList?.map((item) => ({ ...item, id: -item.id, name: `All ${item.name}` }))
                const sortedArray = userList?.sort(customSort);
                let sortedDep = newDepList?.sort(customSortDep)
                setEditUserList(sortedArray ? sortedArray : [])
                setEditDepList(sortedDep ? sortedDep : [])
            }
        }).catch(() => { 
            setEditUserList([])
            setEditDepList([])
         })
        setIsAssignUserEdit(true)
        setSelectedAssignUser(record)
        setEditUserData({ user_id: record?.user_id, desired_due_date: record?.desired_due_date ? convertDateFormatTwo(record.desired_due_date) : getCurrentDate(), })
    }

    const editCancelBtnHandler = () => {
        setEditFormError({ user_id: "" })
        setIsAssignUserEdit(false)
        setSelectedAssignUser(null)
        setEditUserData({})
        setEditDepList([])
        setEditUserList([])
    }

    const editOnChangeHandler = (e) => {
        let err = editFormError
        if (err.hasOwnProperty(e.target.name)) {
            delete err[e.target.name]
        }
        setEditFormError(err)
        setEditUserData({ ...editUserData, [e.target.name]: e.target.value })
    }

    const editDueDateOnChangeHandler = (value, datestring) => {
        setEditUserData({ ...editUserData, desired_due_date: datestring })
    }

    useEffect(() => {
        let columnDef = [
            {
                title: 'Name',
                dataIndex: ['assigned_users'],
                width: 200,
                sorter: sortByString(["assigned_users", "first_name"]),
                // render: (_, record) => {
                //     return `${record?.assigned_users?.first_name ? record?.assigned_users?.first_name : ""} ${record?.assigned_users?.last_name ? record?.assigned_users?.last_name : ""}`
                // }
                render: (text, record) => {
                    return (isAssignUserEditMode && record?.task_assigned_user_id == selectedAssignUser?.task_assigned_user_id) ? <div className='input-wrap'>
                        <Form.Select
                            name='user_id'
                            value={editUserData?.user_id ?? ""}
                            onChange={editOnChangeHandler}
                        >
                            {editDepList?.map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                            {editUserList?.map((item) => {
                                const fullName = `${item?.abv ? item?.abv + " - " : ""}${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim();
                                return <option key={item.id} value={item.id}>{fullName}</option>
                            })}
                        </Form.Select>
                        {editFormError?.user_id ? <span className='ms-2 text-danger'>{editFormError?.user_id}</span> : null}
                    </div> : `${record?.assigned_users?.first_name ? record?.assigned_users?.first_name : ""} ${record?.assigned_users?.last_name ? record?.assigned_users?.last_name : ""}`
                }
            },
            {
                title: 'Due Date',
                dataIndex: ['desired_due_date'],
                sorter: sortByDate(["desired_due_date"]),
                width:150,
                render: (text, record) => {
                    return (isAssignUserEditMode && record?.task_assigned_user_id == selectedAssignUser?.task_assigned_user_id) ? <div className='input-wrap'>
                      <DatePicker
                        // disabledDate={disabledDate}
                        format="MM/DD/YYYY"
                        placeholder='Due Date'
                        name='desired_due_date'
                        onChange={editDueDateOnChangeHandler}
                        value={editUserData?.desired_due_date ? dayjs(editUserData?.desired_due_date, "MM/DD/YYYY") : ""}
                      />
                    </div> : record?.desired_due_date ? parseDateTimeString(record?.desired_due_date, 6) : null
                  }
            },
            {
                title: 'Completed ',
                dataIndex: ['complete_date'],
                sorter: sortByDate(["complete_date"]),
                width:150,
                render: (text, record) => {
                    return record?.complete_date ? parseDateTimeString(record?.complete_date, 6) : null
                  }
            },
            {
                title: 'Mark as Completed ',
                dataIndex: "",
                width: 180,
                render: (text, record) => {
                    return <>
                        <Tooltip placement="top" title={"Mark as Completed"}>
                            <AssignUserCompletedCheckbox record={record} getTaskForAssignedUsers={getTaskForAssignedUsers} disabled={(usertype == 3)} />
                        </Tooltip>
                    </>
                }
            },
            {
                title: 'Actions',
                dataIndex: '',
                width: 130,
                render: (_, record) =>{
                    return (usertype == 1 || usertype == 2 ) ? <div className='d-flex gap-2 user-action-btn'>
                        {(isAssignUserEditMode && record?.task_assigned_user_id == selectedAssignUser?.task_assigned_user_id) ?
                            <>
                                <MyTooltip title="Save User">
                                    <TableBtn className="delete-action-btn" onclick={() => saveButtonHandler(record)}>
                                        <MdIcons.MdOutlineSave />
                                    </TableBtn>
                                </MyTooltip>
                                <MyTooltip title="Cancel">
                                    <TableBtn className="delete-action-btn" onclick={() => editCancelBtnHandler(record)}>
                                        <MdIcons.MdOutlineClose />
                                    </TableBtn>
                                </MyTooltip>
                            </> : <>
                                <MyTooltip title="Edit User">
                                    <TableBtn className="delete-action-btn" onclick={() => editButtonHandler(record)}>
                                        <BiSolidEdit />
                                    </TableBtn>
                                </MyTooltip>
                                <MyTooltip title="Delete User">
                                    <TableBtn className="delete-action-btn" onclick={() => deleteButtonHandler(record)}>
                                        <RiIcons.RiDeleteBin6Fill />
                                    </TableBtn>
                                </MyTooltip>
                            </>
                        }
                    </div> : null
                }
            },

        ]
        setColumns(columnDef)
    }, [assignedUsers, isAssignUserEditMode, selectedAssignUser, editUserData, editDepList, editUserList, updatedtaskData, editFormError])

    // Assignmendt button click handler
    const handleAssignment = async (record) => {
        const { userIds, deptIds } = separateAndTransformIds(checkboxStatesAssign)

        const payload = {
            task_id: selectedTask?.id,
            user_ids: userIds ? userIds : [],
            dept_ids: deptIds ? deptIds : [],
            desired_due_date: assignUserDueDate ? convertDateFormat(assignUserDueDate) : ""
        };

        postAssignedUserData(payload).then(() => {
            getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false)
            // getTaskList(false)
            getTaskForAssignedUsers(selectedTask?.id)
        }).catch((err) => {
            console.error('postAssignedUserData-Error:', err);
        }).finally(() => {
            setIsOpen(false)
            setAssignUserDueDate(getCurrentDate())
            setSearchBar("")
        })
    };

    const handleSearch = (searchValue) => {
        setSearchBar(searchValue);
    };

    // rowSelection object indicates the need for row selection
    function getUserAndDepartments() {
        getActivityNotesUsersDepartment(1).then((res) => {
            if (res.data?.users) { setUsers(res.data?.users) }
        }).catch(() => { setUsers([]) })
    }

    // Toggle click handler
    const onToggleClickHandler = (data) => {
        setSearchBar("")
        setIsOpen(!isOpen)
    }

    useEffect(()=>{
        if (isOpen) {
            setCheckboxDeptAssign([])
            getUserAndDepartments()
        } else {
            setUsers([])
            setCheckboxDeptAssign([])
            setSearchBar("")
        }
    }, [isOpen])

    const closeAssignDropdown = ()=>{
        setIsOpen(false)
        setAssignUserDueDate(getCurrentDate())
    }

    function onAssignChangeHandler(e, item) {
        let assign = checkboxStatesAssign
        if (checkboxStatesAssign.includes(item.id)) {
            assign = assign.filter((u) => { return u != item.id })
        } else {
            assign.push(item.id)
        }
        setCheckboxStatesAssign([...assign])
    }

    useEffect(() => {
        if (searchBar) {
            let userList = users.filter((item) => { if (item.email) { return item } })
            let deptList = users.filter((item) => { if (!item.email) { return item } })
            let userCheckList = userList.map((item) => ({
                id: item.id,
                name: `${item?.abv ? item?.abv + " - " : ""}${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
            }))
            let deptCheckList = deptList.map((item) => ({ id: -item.id, name: `All ${item.name}` }))

            const filterUserData = userCheckList.filter(item => { return item?.name?.toLowerCase()?.includes(searchBar.toLowerCase()); });
            const filterDeptData = deptCheckList.filter(item => { return item?.name?.toLowerCase()?.includes(searchBar.toLowerCase()); });

            const sortedUserList = sortObjectsByAttribute(filterUserData);
            const sortedDeptList = sortObjectsByAttribute(filterDeptData);
            setFilteredData([...sortedDeptList, ...sortedUserList])
        } else {
            let userList = users.filter((item) => { if (item.email) { return item } })
            let deptList = users.filter((item) => { if (!item.email) { return item } })

            let userCheckList = userList.map((item) => ({
                id: item.id,
                name: `${item?.abv ? item?.abv + " - " : ""}${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
            }))
            let deptCheckList = deptList.map((item) => ({ id: -item.id, name: `All ${item.name}` }))

            const sortedUserList = sortObjectsByAttribute(userCheckList);
            const sortedDeptList = sortObjectsByAttribute(deptCheckList);
            setFilteredData([...sortedDeptList, ...sortedUserList])
        }
    }, [users, searchBar])
    

    // get assigned users
    function getTaskForAssignedUsers(id) {
        getSingleTask(id).then((res) => {
            if (res.data?.Task?.assigned_user_details) { setAssignedUsers(res.data?.Task?.assigned_user_details) }
        }).catch(() => { setAssignedUsers([]) })
    }

    useEffect(() => {
        if (selectedTask?.assigned_user_details) {
            setAssignedUsers(selectedTask?.assigned_user_details)
        } else {
            setAssignedUsers([])
        }
    }, [selectedTask])

    useEffect(() => {
        if (assignedUsers.length > 0) {
            // let ids = assignedUsers.map((item) => `${item.user_id}`)
            let ids = assignedUsers.map((item) => item.user_id)
            setCheckboxStatesAssign(ids)
        } else {
            setCheckboxStatesAssign([])
        }
    }, [assignedUsers])

    function deleteAssignUser(id, taskId) {
        deleteAssignedUser(id).then(() => {
            // getTaskList(false)
            getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false)
            getTaskForAssignedUsers(taskId)
        })
    }

    const deleteButtonHandler = (record) => {
        let isConfirm = confirmDelete("user")
        if (isConfirm) {
            deleteAssignUser(record.task_assigned_user_id, record.task_id)
        }
    }

    useEffect(() => {
        if (selectedTask) {
            const doc = selectedTask?.document_details?.map((doc) => {
                let parts = doc.document_url.split("/")
                let name = parts[parts.length - 1]
                return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
            })
            setFileList(doc)
        }
    }, [selectedTask])

    // Document upload handler
    const documentUploadCustomRequest = (data) => {
        const formData = new FormData()
        formData.append('document_url', data.file)
        formData.append('id', selectedTask.id)
        const { onSuccess, onError, onProgress } = data

        const config = {
            onUploadProgress: (e) => {
                onProgress({ percent: (e.loaded / e.total) * 100 })
            }
        }
        uploadTaskDocument(formData, config).then((res) => {
            onSuccess(res.data)
        }).catch(err => {
            onError({ message: err.response?.data.message || "Failed to upload document" })
        })
    }

    // Docuemnt remove function
    function removeDocument(id) {
        deleteTaskDocument(id).then(() => {
            setFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteTaskDocument-err", err)
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
                    let name = e.file.response?.file_name
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
        if(selectedCustomerId){
            updateCustomerPopupOpen(selectedCustomerId)
        }
    }

    const onNoButtonClick = () => {
        setOpenWarning(false)
        setSelectedCustomerId(null)
    }

    const onJobIconClick = (id) => {
        setOpenJobWarning(true)
        setSelectedJobId(id)
    }

    const onJobOkButtonClick = () => {
        setOpenJobWarning(false)
        if(selectedJobId){
            updateJobPopupOpen(selectedJobId)
        }
    }

    const onJobNoButtonClick = () => {
        setOpenJobWarning(false)
        setSelectedJobId(null)
    }
    
    const disabledDate = (current) => {
        if (current && updatedtaskData?.desired_due_date) {
            // Add one day to the updated task due date
            const nextDate = dayjs(updatedtaskData?.desired_due_date, "MM/DD/YYYY").add(1, 'day');
    
            // Compare the current date with the next date
            return dayjs(current, "MM/DD/YYYY").isAfter(nextDate);
        }
        return false;
    };

    return (
        <>
        <div>
            <div className='d-flex flex-wrap w-100'>
                    <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className={`addCust pe-4 ${isFieldMandatory('customer') ? 'mandatory-field' : ''}`}>
                <div className='custom-select-box-wrap'>
                <FloatingLabel className='custom-select' label={`Customer${isFieldMandatory('customer') ? ' *' : ''}`}>
                        <Form.Select aria-label="Client"  name='customer' value={updatedtaskData?.customer ?? ""} disabled={isCallEntry} onChange={onChangeHandler}>
                            <option key={0} value="">Select Customer</option>
                            {customerList?.length > 0 && sortObjectsByAttribute(customerList).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                      
                    </FloatingLabel>
                    <div className='icon'>
                        {/* <IoChevronDownSharp className='arrow-icon' /> */}
                        <FaIcons.FaBriefcase className='icon-style' title='Edit Customer' onClick={() => onCustomerIconClick(updatedtaskData?.customer)} />
                        </div>
                </div>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className={`addCust pe-4 ${isFieldMandatory('project') ? 'mandatory-field' : ''}`}>
                  <div className='custom-select-box-wrap' >
                    <FloatingLabel className='custom-select' label={`Job${isFieldMandatory('project') ? ' *' : ''}`}>
                        <Form.Select aria-label="Job" name='project' value={updatedtaskData?.project ?? ""} disabled={isCallEntry} onChange={onChangeHandler}>
                            <option key={0} value="">Select Job</option>
                            {jobs?.length > 0 && sortObjectsByAttribute(jobs).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                      
                    </FloatingLabel>
                    <div className='icon'>
                        <MdIcons.MdFactory className='icon-style' title='View Job' style={{width:'19px',height:'19px'}} onClick={() => onJobIconClick(updatedtaskData?.project)}/>
                        </div>
                    </div>
                    {formError?.project ? <span className='ms-2 text-danger'>{formError?.project}</span> : null}
                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className={`addCust  ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Task Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' disabled={isCallEntry} value={updatedtaskData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name ? <span className='ms-2 text-danger'>{formError?.name}</span> : null}
                </div>
                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className='w-50 pe-4 addCust'>
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

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className={`addCust  w-50 ${isFieldMandatory('service_type') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Service Type${isFieldMandatory('service_type') ? ' *' : ''}`}>
                        <Form.Select aria-label="SERVICE TYPE *" name='service_type' value={updatedtaskData?.service_type ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Select Service Type</option>
                            {serviceTypes?.length > 0 && sortObjectsByAttribute(serviceTypes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.service_type ? <span className='ms-2 text-danger'>{formError?.service_type}</span> : null}
                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className='w-50 addCust pe-4'>
                    <div className='myInputBox'>
                        <label style={{ display: "block" }}>Desired Due Date</label>
                        <DatePicker
                            value={updatedtaskData?.desired_due_date ? dayjs(updatedtaskData?.desired_due_date, "MM/DD/YYYY") : ""}
                            onChange={handleDesiredDateChange}
                            name='desired_due_date'
                            format="MM/DD/YYYY"
                            className='myDatePicker'
                            placeholder="MM/DD/YYYY"
                        />
                    </div>
                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className='w-50 addCust'>
                    <div className='myInputBox'>
                        <label style={{ display: "block" }}>Date Completed</label>
                        <DatePicker
                            value={updatedtaskData?.completion_date ? dayjs(updatedtaskData?.completion_date, "MM/DD/YYYY") : ""}
                            placeholder="MM/DD/YYYY"
                            format="MM/DD/YYYY"
                            name='completion_date'
                            onChange={handleProjectDeadlineChange}
                            className='myDatePicker'

                        />
                    </div>
                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className='w-50 addCust d-flex mb-0 flex-wrap flex-md-nowrap'>
                    <div className='w-100 w-md-50 addCust pe-4'>
                        <FloatingLabel label="Priority *">
                            <Form.Select aria-label="Priority" name='priority'
                                value={updatedtaskData?.priority ?? ""}
                                onChange={onChangeHandler}
                            >
                                <option value="">Select Priority</option>
                                <option value="2">High</option>
                                <option value="1">Normal</option>
                            </Form.Select>
                        </FloatingLabel>
                        {formError?.priority ? <span className='ms-2 text-danger'>{formError?.priority}</span> : null}
                    </div>

                </div>

                <div style={{ pointerEvents: usertype == 3 ? "none" : "all" }} className='w-50 addCust'>
                    <div className='d-flex gap-4'>
                        <div className='w-50 custom-h-t'>
                            <FloatingLabel label="Estimated Duration">
                                <Form.Select
                                    aria-label="estimated_duration_hrs" 
                                    name='estimated_duration_hrs'
                                    value={updatedtaskData?.estimated_duration_hrs ?? ""}
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
                                    aria-label="estimated_duration_mins" 
                                    name='estimated_duration_mins'
                                    value={updatedtaskData?.estimated_duration_mins ?? ""}
                                    onChange={onChangeHandler}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                        <div className='w-50 custom-h-t'>
                            <FloatingLabel label="Actual Duration">
                                <Form.Select
                                    aria-label="actual_duration_hrs"
                                    name='actual_duration_hrs'
                                    value={updatedtaskData?.actual_duration_hrs ?? ""}
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
                                    name='actual_duration_mins'
                                    value={updatedtaskData?.actual_duration_mins ?? ""}
                                    onChange={onChangeHandler}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>

                    </div>

                </div>
                {/* <div className='w-full w-100'>
                    <CustomerDocUpload
                        multiple={true}
                        customRequest={documentUploadCustomRequest}
                        fileList={fileList}
                        onChange={docOnChangehandler}
                        handleDownload={handleDownload}
                        handleRemove={handleRemove}
                    />
                </div> */}

                <div className="assign-task-btn">
                    <Dropdown show>
                    {/* <Dropdown show={isOpen && users.length != 0} onToggle={onToggleClickHandler}> */}
                        {(usertype == 1 || usertype == 2) && <Dropdown.Toggle variant="primary" id="dropdown-basic" onClick={onToggleClickHandler}>
                            <IoMdAdd /> Add Assigned User
                        </Dropdown.Toggle>}
                        {isOpen && <Dropdown.Menu>
                     <div className='inner-menu-content'>
                    
                          <div className='user-list'>
                          <input
                                className="search-box"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                value={searchBar}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Form className="px-2">
                                <div className='user-list-wrap'>
                                    {filteredData.map(item => {
                                        const fullName = `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim();

                                        return (
                                            <Form.Check
                                                key={item.id} // Check if task_assigned_user_id is the correct ID
                                                type="checkbox"
                                                data-userid={item.id}
                                                label={item.name}
                                                onChange={(e) => onAssignChangeHandler(e, item)}
                                                checked={checkboxStatesAssign.includes(item.id)}
                                            />
                                        )
                                    })}
                                </div>
                                
                            </Form>
                          </div>
                          <div className='w-50 addCust '>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Desired Due Date</label>
                                            <DatePicker
                                                // disabledDate={disabledDate}
                                                value={assignUserDueDate ? dayjs(assignUserDueDate, "MM/DD/YYYY") : ""}
                                                onChange={handleAssignUserDesiredDateChange}
                                                name='desired_due_date'
                                                format="MM/DD/YYYY"
                                                className='myDatePicker'
                                                placeholder="Desired Due Date"
                                            />
                            </div>
                </div>
                     </div>
                     <div className="btn-wrap">
                     <a type="button" className="cancel-btn" onClick={closeAssignDropdown}>Cancel</a>

                                    <button type="button" className="assign-btn" onClick={handleAssignment}>Save</button>
                                </div>
                        </Dropdown.Menu>}
                    </Dropdown>
                </div>
                <div className='assign-user-container'>
                    <div className='user-name-wrap'>
                        <Table
                            columns={columns}
                            dataSource={assignedUsers}
                            scroll={{ y: `calc(100vh - 260px)` }}
                            sticky={{
                              offsetHeader: 0,
                            }}
                            pagination={{
                                showSizeChanger: false
                            }}
                        />
                    </div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
            {openWarning && <WarningDialog okClick={onOkButtonClick} noClick={onNoButtonClick} title={"Warning: Unsaved Changes"} description={"There are unsaved changes present on this form. Would you like to continue?"} />}
            {openJobWarning && <WarningDialog okClick={onJobOkButtonClick} noClick={onJobNoButtonClick} title={"Warning: Unsaved Changes"} description={"There are unsaved changes present on this form. Would you like to continue?"} />}
            {openCustomerPopup && <div className={`mainpopups`}>
                <UpdateCust
                    paymentTerms={customerPaymentTerms}
                    clientStatus={customerStatus}
                    countries={customerCountries}
                    states={customerStates}
                    cities={customerCities}
                    getCustomersList={getTaskListPagination}
                    selectedCustomer={selectedCustomer}
                    onClick={updateCustomerCancelClickHandler}
                    ibUsers={customerIbUsers}
                    formError={customerFormError}
                    setFormError={setCustomerFormError}
                    paginationData={paginationData}
                    getCustomersListPagination={getTaskListPagination}
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

export default TaskUpadateForm;
