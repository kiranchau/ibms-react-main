/* eslint-disable no-dupe-keys */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */

import React, { useContext, useEffect, useState } from "react";
import TaskUpdate from "../../popups/taskpops/TaskUpdate";
import { useLocation, useNavigate } from 'react-router-dom';
import TableBtn from "../../commonModules/UI/TableBtn";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import ActivityPopups from "../../popups/taskpops/ActivityPopups";
import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
import { deleteTask, deleteTaskActivityDocument, fecthUsersWithType, fetchActivityNotesByTaskId, getJob, getSingleTask, patchCustomerReview, postDuplicateTaskData, uploadTaskActivityDocument } from "../../../API/authCurd";
import { BiSolidEdit } from "react-icons/bi";
import { Table, Tooltip } from "antd";
import { calculatePageRange, downloadFile, saveFilterToLocal } from "../../../Utils/helpers";
import { LoadingOutlined } from '@ant-design/icons';
import EditableText from "../../EditableText ";
import TaskReview from "./TaskReview";
import * as RiIcons from "react-icons/ri";
import AssignUser from "./AssignUser";
import { isOverdue, parseDateTimeString } from "../../../Utils/dateFormat";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { paginationInitialPage, paginationSizeChanger } from "../../../Utils/pagination";
import { BsExclamationCircleFill } from "react-icons/bs"
import { FaArrowAltCircleUp } from "react-icons/fa"
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import { AssigneeFilter, CustomerReviewFilter, JobFilter, StatusFilter, TaskFilter } from "../../FilterDropdown";
import TaskBeingWorkedOn from "./TaskBeingWorkedOn";
import { confirmDelete, confirmWindow } from "../../commonModules/UI/Dialogue";
import { JobContext } from "../../contexts/JobContext";
import UpdateForm from "../../popups/jobspopups/updateForm";
import { CustomerContext } from "../../contexts/CustomerContext";
import UpdateCust from "../../popups/custpops/UpdateCust";
import { FaSquareArrowUpRight } from "react-icons/fa6";
import CallEntryPopup from "../../popups/taskpops/CallEntryPopup";
import AssignedUserList from "./AssignedUserList";
import { taskActivityDocExtentions } from "../../../Utils/staticdata";

const TasksTable = ({ taskId, getServiceTypes, getCustomersList, isLoading, serviceTypes, paymentTerms, customerList, getTaskList, taskDetail, paginationData, getTaskListPagination, showCallEntries, filters, setFilters }) => {
  const [popUps, setPopUps] = useState(false);
  const [activepopUps, setActivePopUps] = useState(false);
  const [taskUpdateDetail, settaskUpdateDetail] = useState([]);
  const [activityNotes, setActivityNotes] = useState([]);
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [jobList, setJobList] = useState([])
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [assignedUser, setAssignedUser] = useState([]);
  const [checkboxStates, setCheckboxStates] = useState([]);
  const [updatedtaskData, setUpdatetaskdData] = useState(null)
  const [formError, setFormError] = useState({})
  const [selectedTasks, setSelectedTasks] = useState(null)
  const [jobFilterArr, setJobFilterArr] = useState([])
  const [cliFilterArr, setCliFilterArr] = useState([])
  const [statusFilterArr, setStatusFilterArr] = useState([])
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const [isCallEntry, setIsCallEntry] = useState(false)
  const [fileList, setFileList] = useState([]);
  const [taskForActivity, setTaskForActivity] = useState(null)
  const {
    jobOpenPopup, jobSectionCodes, JobPaymentTerms, JobCustomerList, selectedJobForSection, setSelectedJobForSection,
    JobResponsibleUser, JobFormError, setJobFormError, updateJobCancelClickHandler, updateJobPopupOpen, jobSuccessMessage, setJobSuccessMessage
  } = useContext(JobContext)
  const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
    selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
    setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
    setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
    setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
    updateCustomerPopupOpen } = useContext(CustomerContext)
  const [CallEnterypopUps, setCallEnterypopUps] = useState(false);
  const [callEntryIbUsers, setCallEntryIbUsers] = useState([]);
  let navigate = useNavigate()
  const [fetchedTaskdata, setFetchedTaskData] = useState([]);
  const [taskSuccessMessage, setTaskSuccessMessage] = useState("");
  const [callSuccessMessage, setCallSuccessMessage] = useState("");

  const options = [
    { value: '1', label: 'To do', id: "1" },
    { value: '2', label: 'In Progress', id: "2" },
    { value: '4', label: 'Review', id: "4" },
    { value: '3', label: 'Done', id: "3" },
  ];

  useEffect(() => {
    const initialStates = taskDetail?.reduce((acc, record) => {
      const storedState = localStorage.getItem(`checkboxState_${record.id}`);
      acc[record.id] = storedState ? JSON.parse(storedState) : false;
      return acc;
    }, {});
    setCheckboxStates(initialStates);
  }, [taskDetail]);

  const handleCheckboxChange = async (userId) => {
    try {
      const updatedCheckboxStates = { ...checkboxStates, [userId]: !checkboxStates[userId] };
      const payload = { checked: updatedCheckboxStates[userId] };
      const response = await patchCustomerReview(userId, payload);
      // Update the local state using the updatedCheckboxStates
      setCheckboxStates(updatedCheckboxStates);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const deletTaskData = async (record) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) {
      return;
    }
    try {
      await deleteTask(record.id);
      getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false)
      // getTaskList();
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  const duplicateTask = async (record) => {
    let isConfirm = confirmWindow("Are you sure you want to duplicate this task?")
    if (isConfirm) {
      try {
        const taskIds = record.id;
        const payload = {
          task_id: taskIds,
        };
        const response = await postDuplicateTaskData(payload);
        // getTaskList()
        getTaskListPagination(paginationData.per_page, paginationInitialPage, filters, false)
        if (response.ok) {
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error saving data:', error.message);
      }
    }
  };

  // On pagination change handler
  const handleOnPageChange = (pageNumber) => {
    getTaskListPagination(paginationData.per_page, pageNumber, filters, true)
  }

  // custom filter check handler
  const customFilterHandler = () => {
    let fils = { ...filters, global_search: "" }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('tasks', saveFilter)
    resetSearch()
    if (globalSearch == "") {
      getTaskListPagination(paginationData.per_page, paginationData.current_page, fils, true)
    }
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let search = { ...filters, [key]: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('tasks', saveFilter)
    getTaskListPagination(paginationData.per_page, paginationData.current_page, search, true)
  }

  // On cell handler
  const onCellHandler = () => {
    return { onClick: (event) => { event.stopPropagation() } }
  }

  // On job click handler
  const onJobNameClickHandler = (e, record) => {
    e.stopPropagation()
    updateJobPopupOpen(record?.project_id)
  }

  // On cell handler
  const onCustomerNameClickcHandler = (e, record) => {
    e.stopPropagation()
    updateCustomerPopupOpen(record?.customer_id)
  }

  const seeMoreClickHandle = (e, record)=>{
    e.stopPropagation()
    updatePopUps(record)
  }

  useEffect(() => {
    let userType = localStorage.getItem('usertype');
    let columnsDef = [
      {
        title: "",
        width: 50,
        key: "taskBeing",
        onCell: onCellHandler,
        render: (text, record) => {
          return (
            <TaskBeingWorkedOn record={record} paginationData={paginationData} filters={filters} getTaskListPagination={getTaskListPagination} />
          )
        },
      },
      {
        title: "Customer Name",
        dataIndex: ["customer_name"],
        key: "clientName",
        width: 180,
        render: (text, record) => {
          return text ? <div>
            {(userType == 1 || userType == 2) ? <Tooltip placement="top" title={"Go To Customer"}>
              <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e,) => onCustomerNameClickcHandler(e, record)} />
              <span onClick={(e,) => onCustomerNameClickcHandler(e, record)} className="ms-1">{text}</span>
            </Tooltip> : text}
          </div> : "";
        },
        sorter: sortByString(["customer_name"]),
      },
      {
        title: "Job",
        dataIndex: ["project_name"],
        key: "job",
        width: 220,
        render: (text, record) => {
          return text ? <div>
            {(userType == 1 || userType == 2) ? <Tooltip placement="top" title={"Go To Job"}>
              <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onJobNameClickHandler(e, record)} />
              <span onClick={(e) => onJobNameClickHandler(e, record)} className="ms-1">{text}</span>
            </Tooltip> : text}
          </div> : "";
        },
        filteredValue: filters.job_id,
        sorter: sortByString(["project_name"]),
        filterDropdown: (props) => { return <JobFilter {...props} subsection={'tasks'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
      },
      {
        title: "Task Name",
        dataIndex: "name",
        key: "taskName",
        width: 190,
        sorter: sortByString(["name"]),
        render: (text, record) => {
          return (
            <div>{record.priority == 2 && <Tooltip placement="top" title={"High Priority"}><span><FaArrowAltCircleUp className="redirect-icon text-danger" /></span></Tooltip>} {text}</div>
          );
        },
        filteredValue: filters.task_id,
        filterDropdown: (props) => { return <TaskFilter {...props} subsection={'tasks'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
      },
      {
        title: "Due Date",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",
        width: 130,
        sorter: sortByDate(["desired_due_date"]),
        render: (text, record) => {
          return record?.desired_due_date ? <div>{record?.desired_due_date} {isOverdue(record?.desired_due_date) && <Tooltip placement="top" title={"Task Overdue"}><span><BsExclamationCircleFill className="redirect-icon text-danger" /></span></Tooltip>}</div> : null
        }
      },
      {
        title: "Assignee",
        dataIndex: "assigned_user_details",
        key: "assignto",
        width: 160,
        filteredValue: filters.assignee,
        filterDropdown: (props) => { return <AssigneeFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (_, record) => {
          return <AssignedUserList record={record} />
        },
      },
      {
        title: "Date Completed",
        dataIndex: "completion_date",
        key: "completion_date",
        width: 150,
        sorter: sortByString(["completion_date"]),
        render: (text, record) => (
          <span>
            {record.completion_date ? parseDateTimeString(record.completion_date, 6) : null}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 160,
        filteredValue: filters.status,
        onCell: onCellHandler,
        filterDropdown: (props) => { return <StatusFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => (
          <>
            <EditableText
              record={record}
              options={options}
              paginationData={paginationData}
              getTaskListPagination={getTaskListPagination}
              filters={filters}
            />
          </>
        ),
      },
      {
        title: "Customer Review",
        dataIndex: "customer_review",
        key: "customerreview",
        width: 170,
        // onCell: onCellHandler,
        filteredValue: filters.customer_review,
        filterDropdown: (props) => { return <CustomerReviewFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => (
          <TaskReview record={record} handleCheckboxChange={handleCheckboxChange} />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        className: "actions-column",
        width: 140,
        onCell: onCellHandler,
        render: (text, record) => (
          <>
            <div className="d-flex">
              {/* <MyTooltip title="Call Entry">
                <TableBtn className="activeLog update-task-btn" onclick={() => openCallEntryPopup(record)}>
                  <BiSolidEdit />
                </TableBtn>
              </MyTooltip> */}
              <MyTooltip title="Edit Task">
                <TableBtn className="activeLog update-task-btn" onclick={() => updatePopUps(record)}>
                  <BiSolidEdit />
                </TableBtn>
              </MyTooltip>
              {(userType == 1 || userType == 2) && <div className="mx-2">
                <TableBtn className="activeLog update-task-btn" >
                  <AssignUser assignedUser={assignedUser} setAssignedUser={setAssignedUser} record={record} paginationData={paginationData}
                    getTaskListPagination={getTaskListPagination} selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} getTaskList={getTaskList} filters={filters} />
                </TableBtn >
              </div>}
              {(userType == 1 || userType == 2) && <MyTooltip title="Duplicate Task">
                <TableBtn className=" activeLog update-task-btn " onclick={() => duplicateTask(record)}>
                  <HiOutlineDocumentDuplicate />
                </TableBtn>
              </MyTooltip>}
              {((userType == 1 || userType == 2) && (record?.status != 3)) && <div className="mx-2">
                <MyTooltip title="Delete Task">
                  <TableBtn className=" activeLog update-task-btn " onclick={() => deletTaskData(record)}>
                    <RiIcons.RiDeleteBin6Fill />
                  </TableBtn>
                </MyTooltip>
              </div>}
            </div>
          </>
        ),
      },
    ];

    if (userType == '3') {
      // If user type is 3, hide the 'taskBeing' and 'customer review' columns
      columnsDef = columnsDef.filter(column => column.key !== "taskBeing" && column.key !== "customerreview");
    }

    setColumns(columnsDef)
  }, [taskDetail, jobList, selectedTasks, assignedUser, jobFilterArr, data, cliFilterArr, statusFilterArr, filters])

  function getJobList() {
    getJob().then((res) => {
      setJobList(res.data.Projects)
    }).catch(err => { setJobList([]) })
  }

  function getActivityNotesByTaskId(id) {
    fetchActivityNotesByTaskId(id).then((res) => {
      setActivityNotes(res.data)
    }).catch(() => { setActivityNotes([]) })
  }

  // Get single task data by ID
  function getSingleTaskData(id) {
    return getSingleTask(id).then((res) => {
      return res.data
    }).catch(() => {
      return
    })
  }

  const getIbUsers = () => {
    // 2: IB users
    fecthUsersWithType(2).then((res) => {
      if (res.data?.users) { setCallEntryIbUsers(res.data?.users) }
    }).catch(() => { setCallEntryIbUsers([]) })
  }

  const updatePopUps = (data) => {
    if (data?.name == "Call Time Entry") {
      setIsCallEntry(true)
      getIbUsers()
      getSingleTaskData(data.id).then((res) => {
        if (res?.Task) {
          settaskUpdateDetail(res.Task)
        }
      }).catch(() => {
        settaskUpdateDetail([])
      })
      setCallEnterypopUps(true);
    } else {
      getServiceTypes();
      setIsCallEntry(false)
      getSingleTaskData(data.id).then((res) => {
        if (res?.Task) {
          setFetchedTaskData(res.Task)
        }
      }).catch(() => {
        setFetchedTaskData([])
      })
      setPopUps(true);
    }
    setFormError({})
    getCustomersList();
    setTaskSuccessMessage("")
    setCallSuccessMessage("")
  }

  const closeCallEntryPopup = () =>{
    setCallEnterypopUps(false);
    setFormError({})
    setUpdatetaskdData({})
    settaskUpdateDetail(null)
    settaskUpdateDetail(null)
    setFetchedTaskData(null)
  }
  const onCancelBtnHandler = () => {
    setIsCallEntry(false)
    // getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false)
    // getTaskList(false)
    setFormError({})
    setPopUps(false);
    setUpdatetaskdData({})
    settaskUpdateDetail(null)
    setFetchedTaskData(null)
  }

  const openActivityLogs = (record) => {
    getSingleTaskData(record.id).then((res) => {
      if (res?.Task) {
        setTaskForActivity(res.Task)
      }
    }).catch(() => {
      setTaskForActivity([])
    })
    setActivePopUps(true)
    getActivityNotesByTaskId(record.id)
  }

  const onRowClick = (e, record) => {
    const target = e.target
    if (!target.className.includes('update-task-btn')) {
      openActivityLogs(record)
    }
  }

  // table onChange handler function 
  const onTableChangeHandler = (pagination, filters, sorter, extra) => {
    const { currentDataSource } = extra
    if (filters.job) {
      setJobFilterArr(filters.job)
    } else {
      setJobFilterArr([])
    }
    if (filters.clientName) {
      setCliFilterArr(filters.clientName)
    } else {
      setCliFilterArr([])
    }
    if (filters.status) {
      setStatusFilterArr(filters.status)
    } else {
      setStatusFilterArr([])
    }
  }

  useEffect(() => {
    let searchedData = taskDetail
    // if (!showCallEntries) {
    //   searchedData = searchedData?.filter((item) => {
    //     return (item.name != "Call Time Entry")
    //   })
    // }
    setData(searchedData)
  }, [taskDetail, showCallEntries, filters])

  const onCancelButtonClick = () => {
    setActivePopUps(false)
    setTaskForActivity(null)
    setActivityNotes([])
    setFileList([])
    // getTaskList(false)
    getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false)
  }

  useEffect(() => {
    if (taskForActivity) {
      const doc = taskForActivity?.activity_document_details?.map((doc) => {
        let parts = doc.document_url.split("/")
        // let name = parts[parts.length - 1]
        let name = doc?.document_name
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
      // let exts = taskActivityDocExtentions.join(", ")
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

  useEffect(() => {
    const taskId = queryParams.get('task_id');
    const isEmailLink = queryParams.get('isEmailLink');
    const isAssigneeLink = queryParams.get('isAssigneeLink');
    const userId = queryParams.get('user_id');
    let token = localStorage.getItem("token")
    let localUserId = localStorage.getItem("id")
    if (isEmailLink == "true" && isAssigneeLink == "True") {
      if (token && (userId == localUserId)) {
        openActivityLogs({ id: taskId })
      } else {
        navigate("/")
      }
    } else if (isEmailLink == "true") {
      if (token && (userId == localUserId)) {
        openActivityLogs({ id: taskId })
      } else {
        navigate("/")
      }
    }
  }, [])

  return (
    <>
      <div className="custTable">
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ y: `calc(100vh - 240px)` }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => { onRowClick(e, record) }
          })}
          loading={{
            indicator: <LoadingOutlined style={{ fontSize: 50, color: '#2c0036' }} spin />,
            spinning: isLoading,
          }}
          onChange={onTableChangeHandler}
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
          rowClassName={(record, index) => {
            return record.priority == 2 ? "high-priority-task" : ""
          }}
        />
      </div>

      <div className={`${popUps ? "mainpopups" : "nomainpopups"}`}>
        <TaskUpdate
          serviceTypes={serviceTypes}
          paymentTerms={paymentTerms}
          customerList={customerList}
          getTaskList={getTaskList}
          taskUpdateDetail={fetchedTaskdata}
          onClick={onCancelBtnHandler}
          formError={formError}
          setFormError={setFormError}
          paginationData={paginationData}
          getTaskListPagination={getTaskListPagination}
          updatedtaskData={updatedtaskData}
          setUpdatetaskdData={setUpdatetaskdData}
          settaskUpdateDetail={setFetchedTaskData}
          isCallEntry={isCallEntry}
          filters={filters}
          successMessage={taskSuccessMessage}
          setSuccessMessage={setTaskSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${CallEnterypopUps ? "mainpopups" : "nomainpopups"}`}>
        <CallEntryPopup
          serviceTypes={serviceTypes}
          paymentTerms={paymentTerms}
          customerList={customerList}
          getTaskList={getTaskList}
          taskUpdateDetail={taskUpdateDetail}
          onClick={closeCallEntryPopup}
          formError={formError}
          setFormError={setFormError}
          paginationData={paginationData}
          getTaskListPagination={getTaskListPagination}
          updatedtaskData={updatedtaskData}
          setUpdatetaskdData={setUpdatetaskdData}
          settaskUpdateDetail={settaskUpdateDetail}
          isCallEntry={isCallEntry}
          filters={filters}
          ibUsers={callEntryIbUsers}
          successMessage={callSuccessMessage}
          setSuccessMessage={setCallSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${activepopUps ? "mainpopups" : "nomainpopups"}`}>
        <ActivityPopups
          onClick={onCancelButtonClick}
          activityNotes={activityNotes} taskId={taskId} setActivityNotes={setActivityNotes} selectedTask={taskForActivity}
          getActivityNotesByTaskId={getActivityNotesByTaskId}
          multiple={true}
          documentUploadCustomRequest={documentUploadCustomRequest}
          fileList={fileList}
          docOnChangehandler={docOnChangehandler}
          handleDownload={handleDownload}
          handleRemove={handleRemove}
        />
        <div className="blurBg"></div>
      </div>
      {jobOpenPopup && <div className={`mainpopups`}>
        <UpdateForm
          jobCodes={jobSectionCodes}
          paymentTerms={JobPaymentTerms}
          customerList={JobCustomerList}
          getJobList={getJobList}
          selectedJob={selectedJobForSection}
          onClick={updateJobCancelClickHandler}
          responsibleUser={JobResponsibleUser}
          formError={JobFormError}
          setFormError={setJobFormError}
          getJobListPagination={getTaskListPagination}
          paginationData={paginationData}
          setSelectedJob={setSelectedJobForSection}
          filters={filters}
          setFilters={setFilters}
          successMessage={jobSuccessMessage}
          setSuccessMessage={setJobSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>}
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
    </>
  );
};

export default TasksTable;
