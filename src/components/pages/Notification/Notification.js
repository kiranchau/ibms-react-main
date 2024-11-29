/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import '../../SCSS/notification.scss';
import { Table, Tooltip } from 'antd';
import React, { useContext, useEffect, useState } from 'react'
import Form from "react-bootstrap/Form";
import * as IoIcons from 'react-icons/io';
import { DatePicker } from 'antd';
import { deleteJobDocument, deleteTaskActivityDocument, fetchActivityNotesByJobId, fetchActivityNotesByTaskId, getSingleJob, getSingleTask, getUserNotifications, getUserNotificationsPagination, uploadJobActivityDocument, uploadTaskActivityDocument } from '../../../API/authCurd';
import { calculatePageCount, calculatePageRange, downloadFile, getFilterFromLocal, saveFilterToLocal } from '../../../Utils/helpers';
import { sortByDate, sortByString } from '../../../Utils/sortFunctions';
import { jobActivityDocExtentions, jobStatuses, notificationStatus, taskActivityDocExtentions } from '../../../Utils/staticdata';
import { getCurrentDate, getDateByOffset, getPreviousDate, parseDateTimeString } from '../../../Utils/dateFormat';
import { paginationInitialPage, paginationSizeChanger } from '../../../Utils/pagination';
import ActivityPopups from '../../popups/taskpops/ActivityPopups';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
import { LoadingOutlined } from '@ant-design/icons';
import MarkAsImportant from './MarkAsImportant';
import MarkAsAddressed from './MarkAsAddressed';
import { CustomerFilter, JobFilter, JobStatusNotificationFilter, SenderFilter, TaskFilter, TaskStatusNotificationFilter } from '../../FilterDropdown';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import UpdateCust from '../../popups/custpops/UpdateCust';
import { CustomerContext } from '../../contexts/CustomerContext';
import { FaSquareArrowUpRight } from "react-icons/fa6";
import { JobContext } from '../../contexts/JobContext';
import { TaskContext } from '../../contexts/TaskContext';
import UpdateForm from '../../popups/jobspopups/updateForm';
import TaskUpdate from '../../popups/taskpops/TaskUpdate';
import { useNavigate } from "react-router-dom";
import TaskStatusDropDown from './TaskStatusDropDown';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import CallEntryPopup from '../../popups/taskpops/CallEntryPopup';
import { CallTimeEntryContext } from '../../contexts/CallTimeEntryContext';


const { RangePicker } = DatePicker;
const paginationPerPage = 50

const SingleNotification = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userNotifications, setUserNotifications] = useState([]);
    const [formattedUserNotifications, setFormattedUserNotifications] = useState([]);
    const [columns, setColumns] = useState([]);
    const [rangePickerValue, setRangePickerValue] = useState([getDateByOffset(-1), getDateByOffset()])
    const [paginationData, setPaginationData] = useState({
        current_page: 1,
        prev_page_url: "",
        next_page_url: "",
        per_page: "",
        total: "",
        pages: 0
    })
    const [activepopUps, setActivePopUps] = useState(false);
    const [jobactivepopUps, setJobActivePopUps] = useState(false);
    const [activityNotes, setActivityNotes] = useState([]);
    const [jobactivityNotes, setJobActivityNotes] = useState([]);
    const { globalSearch, resetSearch } = useContext(GlobalSearch)
    const [fileList, setFileList] = useState([]);
    const [jobfileList, setJobFileList] = useState([]);
    const [taskForActivity, setTaskForActivity] = useState(null)
    const [filters, setFilters] = useState({
        customer_id:  [],
        job_id:  [],
        task_id:  [],
        job_status:  [],
        task_status:  [],
        sender_id:  [],
        global_search: "",
        start_date: getPreviousDate(1),
        end_date: getCurrentDate(),
        notification_status: "1"
      })
    const [isJob, setIsJob] = useState(false)
    const [jobForActivity, setJobForActivity] = useState(null);
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
    const {
        openTaskPopup, TaskServiceTypes, TaskPaymentTerms, taskCustomerList, taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError,
        setTaskFormError, taskUpdatedtaskData, setTaskUpdatetaskdData, taskIsCallEntry, onTaskCancelBtnHandler, updateTaskPopupOpen, taskSuccessMessage, setTaskSuccessMessage
    } = useContext(TaskContext)
    const navigate = useNavigate()
    const {
        openCallEntryPopup, callEntryServiceTypes, callEntryPaymentTerms, callEntryCustomerList, callEntryUpdateDetail, setCallEntryUpdateDetail, callEntryFormError, setCallEntryFormError, updatedCallEntryData, setUpdateCallEntryData,
        onCallEntryCancelBtnHandler, updateCallEntryPopupOpen, isCallEntryEdit, callEntryIbUsers, callSuccessMessage, setCallSuccessMessage
    } = useContext(CallTimeEntryContext)

    // Get User notifications pagination
    function getUserNOtificationsListPagination(perPage, pageNum, searchParams, isLoader = true) {
        let search = JSON.stringify(searchParams)
        if (isLoader) {
            setIsLoading(true)
        }
        return getUserNotificationsPagination(perPage, pageNum, search).then((res) => {
            setIsLoading(false)
            setUserNotifications(res.data?.user_notifications?.data)
            let pageCount = calculatePageCount(res.data?.user_notifications.total, res.data?.user_notifications.per_page)
            setPaginationData({
                current_page: res.data?.user_notifications.current_page,
                prev_page_url: res.data?.user_notifications.prev_page_url,
                next_page_url: res.data?.user_notifications.next_page_url,
                per_page: res.data?.user_notifications.per_page,
                total: res.data?.user_notifications.total,
                pagesCount: pageCount
            })
        }).catch(err => {
            setIsLoading(false)
            setUserNotifications([])
        })
    }

    // Get User notifications pagination
    function getUserNOtificationsList(isLoader = true) {
        if(isLoader){
            setIsLoading(true)
        }
        return getUserNotifications().then((res) => {
            setIsLoading(false)
            setUserNotifications(res.data?.user_notifications)
        }).catch(err => {
            setIsLoading(false)
            setUserNotifications([])
        })
    }

    // Date range picker onChange handler
    function onRangePickerChangeHandler(value, datestring) {
        if (datestring?.[0] == "" && datestring?.[1] == "") {
            let fils = { ...filters, start_date: "", end_date: "" }
            let { global_search, ...saveFilter } = fils
            saveFilterToLocal('notifications', saveFilter)
            getUserNOtificationsListPagination(paginationPerPage, paginationData.current_page, fils)
        }
        setRangePickerValue(value)
        let fils = { ...filters, start_date: datestring[0], end_date: datestring[1] }
        let { global_search, ...saveFilter } = fils
        saveFilterToLocal('notifications', saveFilter)
        setFilters((prev) => ({ ...prev, start_date: datestring[0], end_date: datestring[1] }))
    }

    // Date range picker onChange handler
    function datePickerOnBlurHandler(value, datestring) {
        resetSearch()
        let fils = { ...filters }
        let { global_search, ...saveFilter } = fils
        saveFilterToLocal('notifications', saveFilter)
        getUserNOtificationsListPagination(paginationPerPage, paginationData.current_page, filters)
    }

    // Status filter onChange handler
    function onStatusFilterChangeHandler(e) {
        setFilters((prev) => ({ ...prev, notification_status: e.target.value }))
        let search = { ...filters, notification_status: e.target.value }
        let { global_search, ...saveFilter } = search
        saveFilterToLocal('notifications', saveFilter)
        getUserNOtificationsListPagination(paginationData.per_page, paginationData.current_page, search, true)
    }

    // Filter
    useEffect(() => {
        let formattedData = userNotifications
        setFormattedUserNotifications(formattedData)
    }, [userNotifications])

    // On pagination change handler
    const handleOnPageChange = (pageNumber) => {
        getUserNOtificationsListPagination(paginationData.per_page, pageNumber, filters, true)
    }

    // custom filter check handler
    const customFilterHandler = () => {
        let fils = { ...filters, global_search: "" }
        let { global_search, ...saveFilter } = fils
        saveFilterToLocal('notifications', saveFilter)
        resetSearch()
        if (globalSearch == "") {
            getUserNOtificationsListPagination(paginationData.per_page, paginationData.current_page, fils, true)
        }
    }

    // custom filter reset handler
    const customFilterResetHandler = (key) => {
        let search = { ...filters, [key]: [] }
        let { global_search, ...saveFilter } = search
        saveFilterToLocal('notifications', saveFilter)
        getUserNOtificationsListPagination(paginationData.per_page, paginationData.current_page, search, true)
    }

    // On cell handler
    const onCellHandler = () => {
        return { onClick: (event) => { event.stopPropagation() } }
    }

    // On cell handler
    const onCustomerNameClickcHandler = (e, record) => {
        e.stopPropagation()
        updateCustomerPopupOpen(record?.customer_id)
    }

    // On job click handler
    const onJobNameClickHandler = (e, record) => {
        e.stopPropagation()
        updateJobPopupOpen(record?.job_id)
    }

    // On Task click handler
    const onTaskNameClickHandler = (e, record) => {
        e.stopPropagation()
        if (record?.task_name == "Call Time Entry") {
            updateCallEntryPopupOpen({ name: record?.task_name, id: record?.task_id })
        } else {
            updateTaskPopupOpen(record?.task_name, record?.task_id)
        }
    }

    // Column Definition
    useEffect(() => {
        const columnDef = [
            {
                title: 'Customer',
                dataIndex: ["customer_name"],
                key: "clientname",
                sorter: sortByString(["customer_name"]),
                filteredValue: filters.customer_id,
                filterDropdown: (props) => { return <CustomerFilter {...props} subsection={'notification'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                width: 150,
                render: (text, record) => {
                    return text ? <div>
                        <Tooltip placement="top" title={"Go To Customer"}>
                            <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onCustomerNameClickcHandler(e, record)} />
                            <span onClick={(e) => onCustomerNameClickcHandler(e, record)} className='ms-1'>{text}</span>
                        </Tooltip>
                    </div> : "";
                },
            },
            {
                title: 'Job',
                dataIndex: ['job_name'],
                key: "jobname",
                width: 160,
                sorter: sortByString(["job_name"]),
                filteredValue: filters.job_id,
                filterDropdown: (props) => { return <JobFilter {...props} subsection={'notification'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                render: (text, record) => {
                    return (
                        text ? <div>
                            <Tooltip placement="top" title={"Go To Job"}>
                                <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onJobNameClickHandler(e, record)} />
                                <span onClick={(e) => onJobNameClickHandler(e, record)} className='ms-1'>{text}</span>
                            </Tooltip>
                        </div> : ""
                    );
                }
            },
            {
                title: 'Task',
                dataIndex: ['task_name'],
                key: "taskname",
                sorter: sortByString(["task_name"]),
                filteredValue: filters.task_id,
                filterDropdown: (props) => { return <TaskFilter {...props}subsection={'notification'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                width: 150,
                render: (text, record) => {
                    return (
                        text ? <div>
                            <Tooltip placement="top" title={"Go To Task"}>
                                <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onTaskNameClickHandler(e, record)} />
                                <span onClick={(e) => onTaskNameClickHandler(e, record)} className='ms-1'>{text}</span>
                            </Tooltip>
                        </div> : ""
                    );
                }
            },
            {
                title: 'Sender',
                dataIndex: ['sender_first_name'],
                key: "sendername",
                filteredValue: filters.sender_id,
                filterDropdown: (props) => { return <SenderFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                sorter: sortByString(["sender_first_name"]),
                width: 150,
                render:(text, record)=>{
                    const fullName = `${record?.sender_first_name ? record?.sender_first_name : ""} ${record?.sender_last_name ? record?.sender_last_name : ""}`.trim();
                    return <div>{fullName}</div>;
                }
            },
            {
                title: 'Content',
                dataIndex: 'content',
                key: 'content',
                sorter: sortByString(["content"]),
                width: 200,
                render:(text, record)=>{
                    return <div dangerouslySetInnerHTML={{ __html: record.content }}></div>
                }
            },
            {
                title: 'Job Status',
                dataIndex: ['job_status'],
                key: "jobstatus",
                filteredValue: filters.job_status,
                filterDropdown: (props) => { return <JobStatusNotificationFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                sorter: sortByString(["job_status"]),
                render: (text, record) => {
                    if (record.job_status) {
                        const data = jobStatuses.find(js => js.id == record.job_status)
                        if (record.job_status == 0 || record.job_status == 1) {
                            return "Needs Invoicing"
                        } else {
                            return data?.name ? data?.name : ""
                        }
                    } else {
                        return ""
                    }
                },
                width: 150,
            },
            {
                title: 'Task Status',
                dataIndex: ['task_status'],
                key: "taskstatus",
                filteredValue: filters.task_status,
                filterDropdown: (props) => { return <TaskStatusNotificationFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
                sorter: sortByString(["task_status"]),
                onCell: onCellHandler,
                render: (text, record) => {
                    return record.task_id ? <TaskStatusDropDown
                        record={record}
                        paginationData={paginationData}
                        paginationMethod={getUserNOtificationsListPagination}
                        filters={filters}
                    /> : null
                },
                width: 140,
            },
            {
                title: 'Date Sent',
                dataIndex: 'created_at',
                key: 'datesent',
                sorter: sortByDate(["created_at"]),
                render: (text, record) => { return parseDateTimeString(record.created_at, 7) },
                width: 160,
            },
            {
                title: '',
                dataIndex: '',
                width: 80,
                onCell: onCellHandler,
                render: (text, record) => (
                    <div className="d-flex">
                        <MarkAsImportant record={record} getUserNOtificationsList={getUserNOtificationsList} getUserNOtificationsListPagination={getUserNOtificationsListPagination} paginationData={paginationData} filters={filters} />
                        <MarkAsAddressed record={record} getUserNOtificationsList={getUserNOtificationsList} getUserNOtificationsListPagination={getUserNOtificationsListPagination} paginationData={paginationData} filters={filters} />
                    </div>
                ),
            },
        ];
        setColumns(columnDef)
    }, [formattedUserNotifications, filters])

    useEffect(() => {
        if (globalSearch) {
            let searchParams = {
                customer_id: [], job_id: [], task_id: [], job_status: [],
                task_status: [], start_date: "", end_date: "", global_search: globalSearch?.trim(),
                notification_status: "1"
            }
            setRangePickerValue([])
            setFilters(searchParams);
            let { global_search, ...saveFilter } = searchParams
            saveFilterToLocal('notifications', saveFilter)
            getUserNOtificationsListPagination(paginationPerPage, paginationInitialPage, searchParams)
        } else {
            let savedFilters = getFilterFromLocal('notifications')
            let searchParams = {
                ...filters,
                customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [],
                job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
                task_id: savedFilters?.task_id ? savedFilters?.task_id : [],
                job_status: savedFilters?.job_status ? savedFilters?.job_status : [],
                task_status: savedFilters?.task_status ? savedFilters?.task_status : [],
                sender_id: savedFilters?.sender_id ? savedFilters?.sender_id : [],
                global_search: "",
                start_date: savedFilters?.start_date ? savedFilters?.start_date : getPreviousDate(1),
                end_date: savedFilters?.end_date ? savedFilters?.end_date : getCurrentDate(),
            }
            if (savedFilters) {
                searchParams.notification_status = savedFilters?.hasOwnProperty("notification_status") ? savedFilters?.notification_status : "1"
            }
            let { global_search, ...saveFilter } = searchParams
            saveFilterToLocal('notifications', saveFilter)
            setRangePickerValue([savedFilters?.start_date ? dayjs(savedFilters?.start_date) : getDateByOffset(-1), savedFilters?.end_date ? dayjs(savedFilters?.end_date) : getDateByOffset()])
            setFilters(searchParams)
            getUserNOtificationsListPagination(paginationPerPage, paginationInitialPage, searchParams)
        }
    }, [globalSearch])

    // table onChange handler function 
    const onTableChangeHandler = (pagination, filters, sorter, extra) => {
        const { currentDataSource } = extra
        setPaginationData({
            ...paginationData,
            current_page: pagination.current,
            total: currentDataSource.length
        })
    }

    // Get Activity notes by id
    function getActivityNotesByTaskId(id) {
        fetchActivityNotesByTaskId(id).then((res) => {
            setActivityNotes(res.data)
        }).catch(() => { setActivityNotes([]) })
    }

    // Get single task data by ID
    function getSingleTaskData(id) {
        return getSingleTask(id).then((res) => {
            if (res.data?.Task) { 
                setTaskForActivity(res.data?.Task)
            }
            return res.data?.Task
        }).catch(() => {
            setTaskForActivity(null)
        })
    }

    // Activity popup close button
    const onActivityPopupCloseHandler = () => {
        setTaskForActivity(null)
        setActivityNotes([])
        setActivePopUps(false)
        setFileList([])
    }

    const closeJobActivityPopup = () => {
        setJobFileList([])
        setJobForActivity(null)
        setJobActivePopUps(false)
        setJobActivityNotes([])
    }

    // Get single job record 
    function getSingleJobData(id) {
        return getSingleJob(id).then((res) => {
            return res?.data
        }).catch(err => {
            return
        })
    }

    // Get activity notes of job
    const getActivityNotesByJobId = (id) => {
        fetchActivityNotesByJobId(id).then((res) => {
            if (res.data?.job_notes) {
                setJobActivityNotes(res.data?.job_notes)
            }
        }).catch(() => { setJobActivityNotes([]) })
    }

    // On Row click handler
    const onRowClick = (e, record) => {
        if (record.task_id && record.job_id) {
            setIsJob(false)
            getActivityNotesByTaskId(record.task_id)
            getSingleTaskData(record.task_id).then(() => {
                setActivePopUps(true)
            }).catch((err) => {
                console.log("getSingleTaskData: ", err)
            })
        } else if (record.job_id) {
            setIsJob(true)
            getSingleJobData(record.job_id).then((res) => {
                if (res?.job) {
                    setJobForActivity(res.job)
                }
            }).catch(() => {
                setJobForActivity(null)
            })
            getActivityNotesByJobId(record.job_id)
            setJobActivePopUps(true)
        } else if (record?.post_id) {
            navigate("/forums")
        }
    }

    useEffect(() => {
        if (taskForActivity) {
          const doc = taskForActivity?.activity_document_details?.map((doc) => {
            let parts = doc.document_url.split("/")
            let name = parts[parts.length - 1]
            return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
          })
          setFileList(doc)
        }
      }, [taskForActivity])
    
      // Document upload handler
    const documentUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        if (!taskActivityDocExtentions.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('documents1', data.file)
            formData.append('id', taskForActivity.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadTaskActivityDocument(formData, config).then((res) => {
                onSuccess(res.data)
            }).catch(err => {
                onError({ message: err.response?.data.message || "Failed to upload document" })
            })
        } else {
            onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
        }
    }
    
      // Docuemnt remove function
      function removeDocument(id) {
        deleteTaskActivityDocument(id).then(() => {
          setFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
          console.log("deleteTaskActivityDocument-err", err)
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

    // Job document 
    useEffect(() => {
        if (jobForActivity) {
            const doc = jobForActivity?.activity_document_details?.map((doc) => {
                let parts = doc.document_url.split("/")
                // let name = parts[parts.length - 1]
                let name = doc?.document_name
                return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
            })
            setJobFileList(doc)
        }
    }, [jobForActivity])

    // Document upload handler
    const JobdocumentUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        if (!jobActivityDocExtentions.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('documents1', data.file)
            formData.append('id', jobForActivity.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadJobActivityDocument(formData, config).then((res) => {
                onSuccess(res.data)
            }).catch(err => {
                onError({ message: err.response?.data.message || "Failed to upload document" })
            })
        } else {
            onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
        }
    }

    // Docuemnt remove function
    function removeJobDocument(id) {
        deleteJobDocument(id).then(() => {
            setJobFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteJobDocument-err", err)
        })
    }

    // Document remove Handler
    const handleJobRemove = (e) => {
        let isConfirm = confirmDelete("document")
        if (isConfirm) {
            if (e.status == "error") {
                setJobFileList((prev) => { return prev.filter((item) => item.uid != e.uid) })
            } else {
                removeJobDocument(e.uid)
            }
        }
    }

    // Document download Handler
    const handleJobDownload = (e) => {
        downloadFile(e.url, e.name)
    }

    // Document onchange Handler
    const jobdocOnChangehandler = (e) => {
        if (e.file.status == "done") {
            let items = [...jobfileList]
            let newArr = items.map((item) => {
                if (item.uid == e.file.uid) {
                    let parts = e.file.response?.url?.split("/")
                    let name = parts[parts.length - 1]
                    return { uid: e.file.response.document_id, name: name ? name : "Document", status: 'done', url: e.file.response.url }
                }
                return item
            })
            setJobFileList(newArr)
        } else {
            setJobFileList(e.fileList)
        }
    }

    return (
        <>
        <div className="PageContent custpage notificationpage-wrap">
            <div className='mx-3 mt-2 settingPage notification-page-wrap'>
                <div className="header px-3 py-1 d-flex justify-content-between">
                    <div><span className='pe-2'>
                        <IoIcons.IoIosNotifications style={{ fontSize: '24px' }} />
                    </span>
                        Notifications </div>
                    <div className="d-flex header-right">
                        <div className="noti-select-box">
                            <Form.Select
                                aria-label="Default select example"
                                value={filters.notification_status}
                                onChange={onStatusFilterChangeHandler}
                            >
                                <option key={0} value={""}>All Statuses</option>
                                {notificationStatus.map((item) => {
                                    return <option value={item.id} key={item.id}>{item.name}</option>
                                })}
                            </Form.Select>
                        </div>
                        <div>
                            <RangePicker format={'MM/DD/YYYY'} value={rangePickerValue} onCalendarChange={onRangePickerChangeHandler} onBlur={datePickerOnBlurHandler} />
                        </div>

                    </div>
                </div>
                <Table
                    columns={columns}
                    dataSource={formattedUserNotifications}
                    sticky={{ offsetHeader: 0 }}
                    scroll={{ y: `calc(100vh - 240px)` }}
                    onChange={onTableChangeHandler}
                    onRow={(record, rowIndex) => ({
                        onClick: (e) => { onRowClick(e, record) }
                    })}
                    loading={{
                        indicator: <LoadingOutlined style={{ fontSize: 50, color: '#2c0036' }} spin />,
                        spinning: isLoading,
                    }}
                    pagination={{
                        position: ['bottomRight'],
                        pageSize: paginationData.per_page,
                        current: paginationData.current_page,
                        showSizeChanger: paginationSizeChanger,
                        total: paginationData.total,
                        onChange: handleOnPageChange 
                      }}
                    footer={() => {
                        return paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
                            <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
                        </div> : null
                    }}
                />
            </div>
        </div>
            <div className={`${activepopUps ? "mainpopups" : "nomainpopups"}`}>
                <ActivityPopups
                    onClick={onActivityPopupCloseHandler}
                    activityNotes={activityNotes}
                    setActivityNotes={setActivityNotes} 
                    selectedTask={taskForActivity}
                    getActivityNotesByTaskId={getActivityNotesByTaskId}
                    documentUploadCustomRequest={documentUploadCustomRequest}
                    fileList={fileList}
                    docOnChangehandler={docOnChangehandler}
                    handleDownload={handleDownload}
                    handleRemove={handleRemove}
                    getUserNOtificationsList={getUserNOtificationsList}
                    isJob={isJob}
                />
                <div className="blurBg"></div>
            </div>
            <div className={`${jobactivepopUps ? "mainpopups" : "nomainpopups"}`}>
                <ActivityPopups
                    onClick={closeJobActivityPopup}
                    activityNotes={jobactivityNotes}
                    setActivityNotes={setJobActivityNotes}
                    selectedJob={jobForActivity}
                    getActivityNotesByTaskId={getActivityNotesByJobId}
                    multiple={true}
                    documentUploadCustomRequest={JobdocumentUploadCustomRequest}
                    fileList={jobfileList}
                    docOnChangehandler={jobdocOnChangehandler}
                    handleDownload={handleJobDownload}
                    handleRemove={handleJobRemove}
                    isJob={isJob}
                />
                <div className="blurBg"></div>
            </div>
            {openCustomerPopup && <div className={`mainpopups`}>
                <UpdateCust
                    paymentTerms={customerPaymentTerms}
                    clientStatus={customerStatus}
                    countries={customerCountries}
                    states={customerStates}
                    cities={customerCities}
                    getCustomersList={getUserNOtificationsListPagination}
                    selectedCustomer={selectedCustomer}
                    onClick={updateCustomerCancelClickHandler}
                    ibUsers={customerIbUsers}
                    formError={customerFormError}
                    setFormError={setCustomerFormError}
                    paginationData={paginationData}
                    getCustomersListPagination={getUserNOtificationsListPagination}
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
                    getJobList={getUserNOtificationsListPagination}
                    selectedJob={selectedJobForSection}
                    onClick={updateJobCancelClickHandler}
                    responsibleUser={JobResponsibleUser}
                    formError={JobFormError}
                    setFormError={setJobFormError}
                    getJobListPagination={getUserNOtificationsListPagination}
                    paginationData={paginationData}
                    setSelectedJob={setSelectedJobForSection}
                    filters={filters}
                    setFilters={setFilters}
                    successMessage={jobSuccessMessage}
                    setSuccessMessage={setJobSuccessMessage}
                />
                <div className="blurBg"></div>
            </div>}
            {openTaskPopup && <div className={`mainpopups`}>
                <TaskUpdate
                    serviceTypes={TaskServiceTypes}
                    paymentTerms={TaskPaymentTerms}
                    customerList={taskCustomerList}
                    getTaskList={getUserNOtificationsListPagination}
                    taskUpdateDetail={taskSectionUpdateDetail}
                    onClick={onTaskCancelBtnHandler}
                    formError={taskFormError}
                    setFormError={setTaskFormError}
                    paginationData={paginationData}
                    getTaskListPagination={getUserNOtificationsListPagination}
                    updatedtaskData={taskUpdatedtaskData}
                    setUpdatetaskdData={setTaskUpdatetaskdData}
                    settaskUpdateDetail={settaskSectionUpdateDetail}
                    isCallEntry={taskIsCallEntry}
                    filters={filters}
                    successMessage={taskSuccessMessage}
                    setSuccessMessage={setTaskSuccessMessage}
                />
                <div className="blurBg"></div>
            </div>}
            {openCallEntryPopup && <div className={`mainpopups`}>
                <CallEntryPopup
                    serviceTypes={callEntryServiceTypes}
                    paymentTerms={callEntryPaymentTerms}
                    customerList={callEntryCustomerList}
                    getTaskList={getUserNOtificationsListPagination}
                    taskUpdateDetail={callEntryUpdateDetail}
                    onClick={onCallEntryCancelBtnHandler}
                    formError={callEntryFormError}
                    setFormError={setCallEntryFormError}
                    paginationData={paginationData}
                    getTaskListPagination={getUserNOtificationsListPagination}
                    updatedtaskData={updatedCallEntryData}
                    setUpdatetaskdData={setUpdateCallEntryData}
                    settaskUpdateDetail={setCallEntryUpdateDetail}
                    isCallEntry={isCallEntryEdit}
                    filters={filters}
                    ibUsers={callEntryIbUsers}
                    successMessage={callSuccessMessage}
                    setSuccessMessage={setCallSuccessMessage}
                />
                <div className="blurBg"></div>
            </div>}
        </>
    )
}
export default SingleNotification
