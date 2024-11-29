/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from "react";
import TableBtn from "../../commonModules/UI/TableBtn";
import { Table, Tooltip } from "antd";
import * as RiIcons from "react-icons/ri";
import UpdateForm from "../../popups/jobspopups/updateForm";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import { useLocation } from 'react-router-dom';
import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
import { deleteJob, deleteJobDocument, fetchActivityNotesByJobId, fetchJobCodes, fetchJobs, fetchServiceTypes, getCust, getSingleJob, uploadJobActivityDocument } from "../../../API/authCurd";
import { calculatePageRange, downloadFile, saveFilterToLocal } from "../../../Utils/helpers";
import { LoadingOutlined } from '@ant-design/icons';
import { confirmDelete } from "../../commonModules/UI/Dialogue";
import { jobActivityDocExtentions, jobStatuses } from "../../../Utils/staticdata";
import { BiSolidEdit } from "react-icons/bi";
// import { BsExclamationCircleFill } from "react-icons/bs"
import { FaArrowAltCircleUp } from "react-icons/fa"
import { paginationSizeChanger } from "../../../Utils/pagination";
import JobTask from "./JobTask";
import { MdTask } from "react-icons/md";
import * as FaIcons from 'react-icons/fa';
import { IoMdCall } from "react-icons/io";
import { RiFileSearchFill } from "react-icons/ri";
import Audittrail from "./AuditTrail";
import CallHistory from "./CallHistory";
import { useNavigate } from "react-router-dom"
import Dropdown from 'react-bootstrap/Dropdown';
import { IoMdMore } from "react-icons/io";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import ActivityPopups from "../../popups/taskpops/ActivityPopups";
import { JobStatusFilter, JobCodeFilter, PrimaryAssignedFilter, JobFilter } from "../../FilterDropdown";
import { CustomerContext } from "../../contexts/CustomerContext";
import UpdateCust from "../../popups/custpops/UpdateCust";
import { FaSquareArrowUpRight } from "react-icons/fa6";
import { isOverdue, parseDateTimeString } from "../../../Utils/dateFormat";
import { BsExclamationCircleFill } from "react-icons/bs";
import { FaRecycle } from "react-icons/fa";
import { TaskContext } from "../../contexts/TaskContext";
import TaskUpdate from "../../popups/taskpops/TaskUpdate";


const JobsTable = ({ jobDetail, getJobList, paginationData, getJobListPagination, customerList, paymentTerms, responsibleUser, getCustomersList, getResponsibleUsers, getJobCodes, jobCodes, setPaginationData, isLoading, filters, setFilters }) => {
  const [selectedJob, setSelectedJob] = useState([]);
  const [popUps, setPopUps] = useState(false);
  const [TaskpopUps, setTaskPopUps] = useState(false);
  const [auditTrailpopUps, setAuditTrailPopUps] = useState(false);
  const [callHistorypopUps, setCallHistoryPopUps] = useState(false);
  const [activitypopUps, setActivityPopUps] = useState(false);
  const [columns, setColumns] = useState([]);
  const [formError, setFormError] = useState({})
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [data, setData] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [taskCustomerList, setTaskCustomerList] = useState([]);
  const [taskFormError, setTaskFormError] = useState({})
  const [taskFormValue, setTaskFormValue] = useState({})
  const [jobs, setJobs] = useState([]);
  const [selectedJobForAuditTrail, setSelectedJobAuditTrail] = useState(null);
  const [selectedJobForCallLog, setSelectedJobCallLog] = useState(null);
  let navigate = useNavigate()
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const [activityNotes, setActivityNotes] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [jobForActivity, setJobForActivity] = useState(null);
  const [jobCodesForFilter, setJobCodesForFilter] = useState([]);
  const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
    selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
    setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
    setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
    setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
    updateCustomerPopupOpen } = useContext(CustomerContext)
  const [isMoreOpenSelected, setIsMoreOpenSelected] = useState(null)
  const [jobSuccessMessage, setJobSuccessMessage] = useState("");
  const {
    openTaskPopup, TaskServiceTypes, TaskPaymentTerms, taskCustomerList:taskCustomerListNew, taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError:taskFormErrorNew,
    setTaskFormError: setTaskFormErrorNew, taskUpdatedtaskData, setTaskUpdatetaskdData, taskIsCallEntry, onTaskCancelBtnHandler, updateTaskPopupOpen, taskSuccessMessage, setTaskSuccessMessage
} = useContext(TaskContext)

  function deletJobList(e, id) {
    setIsMoreOpenSelected(null)
    e.preventDefault()
    let isConfirm = confirmDelete("job")
    if (isConfirm) {
      deleteJob(id).then((res) => {
        // getJobList()
        getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
      }).catch(() => { })
    }
  }

  // Get job codes function
  const getJobCode = () => {
    fetchJobCodes().then((res) => {
      if (res.data?.job_codes) { setJobCodesForFilter(res.data?.job_codes) }
    }).catch(() => { setJobCodesForFilter([]) })
  }

  useEffect(() => {
    getJobCode();
  }, [])

  // Job audit trail open button handler
  const openJobAuditTrailPopup = (e, record) => {
    setIsMoreOpenSelected(null)
    e.preventDefault()
    setSelectedJobAuditTrail(record)
    setAuditTrailPopUps(true)
  }
  const openActivityPopup = (record) => {
    getSingleJobData(record.id).then((res) => {
      if (res?.job) {
        setJobForActivity(res.job)
      }
    }).catch(() => {
      setJobForActivity(null)
    })
    getActivityNotesByJobId(record.id)
    setActivityPopUps(true)
  }
  const closeActivityPopup = () => {
    setFileList([])
    setJobForActivity(null)
    setActivityPopUps(false)
    setActivityNotes([])
  }

  // Job audit trail close button handler
  const closeJobAuditTrailPopup = () => {
    setIsMoreOpenSelected(null)
    setAuditTrailPopUps(false)
    setSelectedJobAuditTrail(null)
  }

  // Job Call history open button handler
  const openCallHistoryPopup = (e, record) => {
    setIsMoreOpenSelected(null)
    e.preventDefault()
    setSelectedJobCallLog(record)
    setCallHistoryPopUps(true)
  }

  // Job Call history close button handler
  const closeCallHistoryPopup = () => {
    setIsMoreOpenSelected(null)
    setSelectedJobCallLog(null)
    setCallHistoryPopUps(false)
    getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
  }

  // On pagination change handler
  const handleOnPageChange = (pageNumber) => {
    getJobListPagination(paginationData.per_page, pageNumber, filters, true)
  }

  // custom filter check handler
  const customFilterHandler = () => {
    let fils = { ...filters, global_search: "" }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('jobs', saveFilter)
    resetSearch()
    if (globalSearch == "") {
      getJobListPagination(paginationData.per_page, paginationData.current_page, fils, true)
    }
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let search = { ...filters, [key]: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('jobs', saveFilter)
    getJobListPagination(paginationData.per_page, paginationData.current_page, search, true)
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

  const onToggleClickHandler = (data, record) => {
    setIsMoreOpenSelected((prev) => record.id == prev ? null : record.id)
}

  useEffect(() => {
    const columnsDef = [
      {
        title: 'Customer Name',
        dataIndex: ["customer_name"],
        key: "clientname",
        width: 200,
        render: (text, record) => {
          return text ? <div> <Tooltip placement="top" title={"Go To Customer"}>
            <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onCustomerNameClickcHandler(e, record)} />
           <span onClick={(e) => onCustomerNameClickcHandler(e, record)} className="ms-1">{text}</span> 
          </Tooltip>
          </div> : "";
        },
        sorter: sortByString(["customer_name"]),
      },
      {
        title: 'Job Name',
        dataIndex: 'name',
        key: "jobname",
        width: 250,
        sorter: sortByString(["name"]),
        render: (text, record) => {
          return (
            <div>{record.priority == 2 && <Tooltip placement="top" title={"High Priority"}><span><FaArrowAltCircleUp className="text-danger redirect-icon" /></span></Tooltip>} {text}
              {record?.recurring_job == 1 ? <Tooltip placement="top" title={"Recurring Job"}>
                <FaRecycle className="recurring-icon" />
              </Tooltip> : null}
            </div>
          );
        },
        filteredValue: filters.job_id,
        filterDropdown: (props) => { return <JobFilter {...props} subsection={'jobs'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> }
      },
      {
        title: 'Job Code',
        dataIndex: ["type_name"],
        width: 180,
        key: "type_details",
        sorter: sortByString(["type_name"]),
        filteredValue: filters.type_id,
        filterDropdown: (props) => { return <JobCodeFilter options={jobCodesForFilter} {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          return (
            <div >{text}</div>
          )
        },
      },
      {
        title: 'Primary Assigned User',
        dataIndex: ["user_first_name"],
        key: "Primary Assigned User",
        filteredValue: filters.assignee,
        filterDropdown: (props) => { return <PrimaryAssignedFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        sorter: sortByString(["user_first_name"]),
        width: 190,

      },
      {
        title: 'Total Time',
        dataIndex: ["total_time"],
        key: "total_time",
        sorter: sortByString(["total_time"]),
        width: 160,
        render: (text, record) => {
          return record?.total_time ? record?.total_time : '-'
        }
      },
      {
        title: 'Status',
        dataIndex: ["status"],
        width: 160,
        key: "status",
        sorter: sortByString(["status"]),
        filteredValue: filters.status,
        filterDropdown: (props) => { return <JobStatusFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          const data = jobStatuses.find(js => js.id == record.status)
          if (record.status == 0 || record.status == 1) {
            return "Needs Invoicing"
          } else {
            return data?.name ? data?.name : ""
          }
        }
      },
      {
        title: "Due Date",
        dataIndex: "due_date",
        key: "desiredDueDate",
        width: 130,
        sorter: sortByDate(["due_date"]),
        render: (text, record) => {
          return record?.due_date ? <div>{parseDateTimeString(record?.due_date, 6)} {isOverdue(record?.due_date) && <Tooltip placement="top" title={"Job Overdue"}><span><BsExclamationCircleFill className="redirect-icon text-danger" /></span></Tooltip>}</div> : null
        }
      },
      {
        title: 'Actions',
        key: "actions",
        width: 130,
        onCell: onCellHandler,
        render: (text, record) => (
          <div className="d-flex justify-content-around actions-column gap-2 ">
            <MyTooltip title="Edit Job">
              <TableBtn className="pass delete-action-btn" onclick={() => updatePopUps(record)}>
                <BiSolidEdit />
              </TableBtn>
            </MyTooltip>
            <MyTooltip title="Add Task">
              {(record?.type_id == 6) ? <TableBtn className="pass delete-action-btn" onclick={(e) => openCallHistoryPopup(e, record)}>
                <FaIcons.FaClipboardList />
              </TableBtn> : <TableBtn className="pass delete-action-btn" onclick={() => onTaskAddClickHandler(record)}>
                <FaIcons.FaClipboardList />
              </TableBtn>}
            </MyTooltip>
            <MyTooltip title="Show Tasks">
              <TableBtn className="pass delete-action-btn" onclick={(e) => showTasksButtonOnclickHandler(e, record)}>
                <MdTask />
              </TableBtn>
            </MyTooltip>
            <MyTooltip title="More" >
              <TableBtn className="bill more-option-wrap">
                <div className='more-option'>
                  <Dropdown show>
                    <Dropdown.Toggle id="dropdown-basic" onClick={(data) => {onToggleClickHandler(data, record)}}>
                      <IoMdMore />
                    </Dropdown.Toggle>
                    {(isMoreOpenSelected == record.id) && <Dropdown.Menu>
                      <Dropdown.Item href="#/action-1" onClick={(e) => openJobAuditTrailPopup(e, record)}> <RiFileSearchFill />Audit Trail</Dropdown.Item>
                      {record?.type_id == 6 && <Dropdown.Item href="#/action-2" onClick={(e) => openCallHistoryPopup(e, record)} ><IoMdCall />Call Logs</Dropdown.Item>}
                      {record?.task_count == 0 && <Dropdown.Item href="#/action-3" onClick={(e) => deletJobList(e, record.id)}> <RiIcons.RiDeleteBin6Fill />Delete</Dropdown.Item>}
                    </Dropdown.Menu>}
                  </Dropdown>
                </div>
              </TableBtn>
            </MyTooltip>
          </div>
        )
      },
    ];
    setColumns(columnsDef);

  }, [jobDetail, data, jobCodesForFilter, filters, isMoreOpenSelected])

  // Get single job record 
  function getSingleJobData(id) {
    return getSingleJob(id).then((res) => {
      return res?.data
    }).catch(err => {
      return
    })
  }

  const updatePopUps = (data) => {
    setFormError({})
    setPopUps(true)
    getSingleJobData(data.id).then((res) => {
      if (res?.job) {
        setSelectedJob(res.job)
      }
    }).catch(() => {
      setSelectedJob([])
    })
    getCustomersList()
    getResponsibleUsers()
    getJobCodes()
    setJobSuccessMessage("")
  }

  const onRowClick = (e, record) => {
    const target = e.target
    if (!target.className.includes('delete-action-btn')) {
      openActivityPopup(record)
    }
  }

  // table onChange handler function 
  const onTableChangeHandler = (pagination, filters, sorter, extra) => {
    const { currentDataSource } = extra
  }

  function getTaskCustomersList() {
    getCust().then((res) => {
      setTaskCustomerList(res.data.customers)
    }).catch(err => {
      setTaskCustomerList([])
    })
  }

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  const getJobsData = (id) => {
    fetchJobs(id).then((res) => {
      if (res.data?.jobs) {
        setJobs(res.data?.jobs);
      }
    }).catch(() => {
      setJobs([]);
    });
  };

  const onTaskAddClickHandler = (record) => {
    setTaskFormError({})
    setTaskPopUps(true)
    getTaskCustomersList()
    getServiceTypes()
    getJobsData(record.customer_id)
    setTaskFormValue({ customer: record.customer_id, project: record.id })
  }

  // Show Task button click handler
  const showTasksButtonOnclickHandler = (e, record) => {
    e.preventDefault()
    navigate(`/tasks?job_id=${record.id}&id=${record.customer_id}&is_call_entry=${record?.type_id == 6 ? 1 : 0}`)
  }

  useEffect(() => {
    let searchedData = jobDetail
    setData(searchedData)
  }, [jobDetail])

  // Get activity notes of job
  const getActivityNotesByJobId = (id) => {
    fetchActivityNotesByJobId(id).then((res) => {
      if (res.data?.job_notes) {
        setActivityNotes(res.data?.job_notes)
      }
    }).catch(() => { setActivityNotes([]) })
  }

  useEffect(() => {
    if (jobForActivity) {
      const doc = jobForActivity?.activity_document_details?.map((doc) => {
        let parts = doc.document_url.split("/")
        // let name = parts[parts.length - 1]
        let name = doc?.document_name
        return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
      })
      setFileList(doc)
    }
  }, [jobForActivity])

  // Document upload handler
  const documentUploadCustomRequest = (data) => {
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
        // getJobList()
      }).catch(err => {
        onError({ message: err.response?.data.message || "Failed to upload document" })
      })
    } else {
      // let exts = jobActivityDocExtentions.join(", ")
      onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
    }
  }

  // Docuemnt remove function
  function removeDocument(id) {
    deleteJobDocument(id).then(() => {
      // getJobList(false)
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

  useEffect(() => {
    const jobId = queryParams.get('job_id');
    const isEmailLink = queryParams.get('isEmailLink');
    const userId = queryParams.get('user_id');
    const isJobTaskLink = queryParams.get('jobTaskLink');
    let token = localStorage.getItem("token")
    let localUserId = localStorage.getItem("id")
    if (isEmailLink == "true") {
      if (isJobTaskLink == "true") {
        if (token && (userId == localUserId)) {
          openActivityPopup({ id: jobId })
        } else {
          navigate("/")
        }
      } else {
        if (token && (userId == localUserId)) {
          openActivityPopup({ id: jobId })
        } else {
          navigate("/")
        }
      }
    }
  }, [])

  function openTaskUpdateModel(taskId, msg) {
    if (taskId) {
      setTaskSuccessMessage(msg ? msg : "")
      setTimeout(() => {
        setTaskSuccessMessage("")
      }, 10000)
      updateTaskPopupOpen("name", taskId)
    }
  }

  return (
    <>
      <div className="custTable">
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ y: `calc(100vh - 240px)` }}
          sticky={{
            offsetHeader: 0,
          }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => { onRowClick(e, record) }
          })}
          loading={{
            indicator:
              <LoadingOutlined
                style={{
                  fontSize: 50,
                  color: '#2c0036',
                }}
                spin
              />,
            spinning: isLoading
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
            return paginationData.total ? (
              <div className="text-end d-flex justify-content-between align-items-center">
                <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
              </div>
            ) : null
          }}
          rowClassName={(record, index) => {
            return record.priority == 2 ? "high-priority-task" : ""
          }}
        />
      </div>
      <div className={`${popUps ? "mainpopups" : "nomainpopups"}`}>
        <UpdateForm
          jobCodes={jobCodes}
          paymentTerms={paymentTerms}
          customerList={customerList}
          getJobList={getJobList}
          selectedJob={selectedJob}
          onClick={() => setPopUps(!popUps)}
          responsibleUser={responsibleUser}
          formError={formError}
          setFormError={setFormError}
          getJobListPagination={getJobListPagination}
          paginationData={paginationData}
          setSelectedJob={setSelectedJob}
          filters={filters}
          setFilters={setFilters}
          successMessage={jobSuccessMessage}
          setSuccessMessage={setJobSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${TaskpopUps ? "mainpopups" : "nomainpopups"}`}>
        <JobTask
          onClick={() => setTaskPopUps(!TaskpopUps)}
          serviceTypes={serviceTypes}
          customerList={taskCustomerList}
          formError={taskFormError}
          setFormError={setTaskFormError}
          formValue={taskFormValue}
          setFormValue={setTaskFormValue}
          jobs={jobs}
          setJobs={setJobs}
          isFromJob={true}
          openModel={openTaskUpdateModel}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${auditTrailpopUps ? "mainpopups" : "nomainpopups"}`}>
        <Audittrail
          onClick={closeJobAuditTrailPopup}
          selectedJobForAuditTrail={selectedJobForAuditTrail}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${callHistorypopUps ? "mainpopups" : "nomainpopups"}`}>
        <CallHistory
          selectedJobForCallLog={selectedJobForCallLog}
          onClick={closeCallHistoryPopup}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${activitypopUps ? "mainpopups" : "nomainpopups"}`}>
        <ActivityPopups
          onClick={closeActivityPopup}
          activityNotes={activityNotes}
          setActivityNotes={setActivityNotes}
          selectedJob={jobForActivity}
          getActivityNotesByTaskId={getActivityNotesByJobId}
          multiple={true}
          documentUploadCustomRequest={documentUploadCustomRequest}
          fileList={fileList}
          docOnChangehandler={docOnChangehandler}
          handleDownload={handleDownload}
          handleRemove={handleRemove}
          isJob={true}
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
      {openTaskPopup && <div className={`mainpopups`}>
        <TaskUpdate
          serviceTypes={TaskServiceTypes}
          paymentTerms={TaskPaymentTerms}
          customerList={taskCustomerListNew}
          getTaskList={getJobListPagination}
          taskUpdateDetail={taskSectionUpdateDetail}
          onClick={onTaskCancelBtnHandler}
          formError={taskFormErrorNew}
          setFormError={setTaskFormErrorNew}
          paginationData={paginationData}
          getTaskListPagination={getJobListPagination}
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
    </>
  );

};

export default JobsTable;
