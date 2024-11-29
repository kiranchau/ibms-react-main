/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from "react";
import { Table, Tooltip } from "antd";
import { useNavigate, useLocation } from "react-router-dom"
import { LoadingOutlined } from '@ant-design/icons';
// import { BsExclamationCircleFill } from "react-icons/bs"
import { FaArrowAltCircleUp } from "react-icons/fa"
import * as RiIcons from "react-icons/ri";

import UpdateForm from "../../popups/jobspopups/updateForm";
import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
import { deleteJob, deleteJobDocument, fetchActivityNotesByJobId, fetchJobs, fetchServiceTypes, getCust, getSingleJob, uploadJobActivityDocument } from "../../../API/authCurd";
import { calculatePageRange, downloadFile, saveFilterToLocal } from "../../../Utils/helpers";
import { confirmDelete } from "../../commonModules/UI/Dialogue";
import { paginationSizeChanger } from "../../../Utils/pagination";
import JobTask from "./JobTask";
import Audittrail from "./AuditTrail";
import CallHistory from "./CallHistory";
import { CustomerFilter, JobFilter, ReqStatusFilter, RequestedByFilter } from "../../FilterDropdown";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import UpdateClientForm from "./updateClientForm";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import { BiSolidEdit } from "react-icons/bi";
import ActivityPopups from "../../popups/taskpops/ActivityPopups";
import { clientJobStatuses, jobActivityDocExtentions } from "../../../Utils/staticdata";
import { parseDateTimeString } from "../../../Utils/dateFormat";

const JobsTable = ({ jobDetail, setJobDetail, getJobList, paginationData, getJobListPagination, customerList, responsibleUser, getCustomersList, getResponsibleUsers, getJobCodes, jobCodes, setPaginationData, isLoading, filters, setFilters }) => {
  const [selectedJob, setSelectedJob] = useState([]);
  const [popUps, setPopUps] = useState(false);
  const [TaskpopUps, setTaskPopUps] = useState(false);
  const [auditTrailpopUps, setAuditTrailPopUps] = useState(false);
  const [callHistorypopUps, setCallHistoryPopUps] = useState(false);
  const [columns, setColumns] = useState([]);
  const [formError, setFormError] = useState({})
  const [data, setData] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [taskCustomerList, setTaskCustomerList] = useState([]);
  const [taskFormError, setTaskFormError] = useState({})
  const [taskFormValue, setTaskFormValue] = useState({})
  const [jobs, setJobs] = useState([]);
  const [selectedJobForAuditTrail, setSelectedJobAuditTrail] = useState(null);
  const [selectedJobForCallLog, setSelectedJobCallLog] = useState(null);
  let navigate = useNavigate()
  const { globalSearch, setGlobalSearch } = useContext(GlobalSearch)

 const [clientJobError, setClientJobError]= useState({})
 const [popUpClientJob, setPopUpClientJob] = useState(false);
 const [selectedClientJob, setSelectedClientJob] = useState(null);
 const [activitypopUps, setActivityPopUps] = useState(false);
 const [jobForActivity, setJobForActivity] = useState(null);
 const [activityNotes, setActivityNotes] = useState([]);
 const [fileList, setFileList] = useState([]);
 const [jobSuccessMessage, setJobSuccessMessage] = useState("");
 const usertype = localStorage.getItem("usertype")
 const location = useLocation();
 const queryParams = new URLSearchParams(location.search);

  // Job audit trail open button handler
  const openJobAuditTrailPopup = (record) => {
    setSelectedJobAuditTrail(record)
    setAuditTrailPopUps(true)
  }

  // Job audit trail close button handler
  const closeJobAuditTrailPopup = () => {
    setAuditTrailPopUps(false)
    setSelectedJobAuditTrail(null)
  }

  // Job Call history open button handler
  const openCallHistoryPopup = (record) => {
    setSelectedJobCallLog(record)
    setCallHistoryPopUps(true)
  }

  // Job Call history close button handler
  const closeCallHistoryPopup = () => {
    setSelectedJobCallLog(null)
    setCallHistoryPopUps(false)
  }

  // On pagination change handler
  const handleOnPageChange = (pageNumber) => {
    getJobListPagination(paginationData.per_page, pageNumber, filters, true)
  }

  // custom filter check handler
  const customFilterHandler = () => {
    let fils = { ...filters, global_search: "" }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('clientJobsRequest', saveFilter)
    getJobListPagination(paginationData.per_page, paginationData.current_page, fils, true)
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let search = { ...filters, [key]: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('clientJobsRequest', saveFilter)
    getJobListPagination(paginationData.per_page, paginationData.current_page, search, true)
  }

  // On cell handler
  const onCellHandler = () => {
    return { onClick: (event) => { event.stopPropagation() } }
  }

  function deletClientJob(e, id) {
    e.preventDefault()
    let isConfirm = confirmDelete("job")
    if (isConfirm) {
      deleteJob(id).then((res) => {
        getJobListPagination(paginationData.per_page, paginationData.current_page, filters, false)
      }).catch(() => { })
    }
  }

  useEffect(() => {
    const columnsDef = [
      {
        title: 'Customer Name',
        dataIndex: ["customer_name"],
        key: "clientname",
        width: 200,
        filteredValue: filters.customer_id,
        filterDropdown: (props) => { return <CustomerFilter {...props} subsection={'clientjobrequest'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          return (
            <div>{text}</div>
          );
        },
        sorter: sortByString(["customer_name"]),
      },
      {
        title: 'Job Name ',
        dataIndex: 'name',
        key: "jobname",
        width: 250,
        sorter: sortByString(["name"]),
        render: (text, record) => {
          return (
            <div>{record.priority == 2 && <Tooltip placement="top" title={"High Priority"}><span><FaArrowAltCircleUp className="redirect-icon text-danger" /></span></Tooltip>} {text}</div>
          );
        },
        filteredValue: filters.job_id,
        filterDropdown: (props) => { return <JobFilter {...props} subsection={'clientjobrequest'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> }
      },
      {
        title: 'Request Status ',
        dataIndex: "request_status",
        width: 180,
        key: "requestStatus",
        sorter: sortByString(["request_status"]),
        filteredValue: filters.request_status,
        filterDropdown: (props) => { return <ReqStatusFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          const data = clientJobStatuses.find(js => js.id == record.request_status)
          return data ? data.name : null;
        },
      },
      {
        title: 'Last Comment ',
        dataIndex: "last_comment",
        key: "lastComment",
        sorter: sortByString(["last_comment"]),
        width: 190,
        render: (text, record) => {
          return record?.last_comment ? <div dangerouslySetInnerHTML={{ __html: record?.last_comment }}></div> : null
        },
      },
      {
        title: 'Requested By ',
        dataIndex: "user_first_name",
        key: "requestedBy",
        filteredValue: filters.assignee,
        filterDropdown: (props) => { return <RequestedByFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        sorter: sortByString(["user_first_name"]),
        width: 160,
      },
      {
        title: 'Date Converted',
        dataIndex: "converted_date",
        key: "convertedDate",
        sorter: sortByDate(["converted_date"]),
        width: 160,
        render: (text, record) => {
          return record?.converted_date ? <div>{parseDateTimeString(record?.converted_date, 6)}</div> : null
        }
      },
      {
        title: 'Actions',
        key: "actions",
        width: 100,
        onCell: onCellHandler,
        render: (text, record) => (
          <div className="d-flex justify-content-around actions-column gap-2 ">
            <MyTooltip title="Edit Job">
              <TableBtn className="pass delete-action-btn" onclick={() => editButtonHandler(record)}>
                <BiSolidEdit />
              </TableBtn>
            </MyTooltip>
            {(usertype == 3) && <MyTooltip title="Delete">
              <TableBtn className="pass delete-action-btn" onclick={(e) => deletClientJob(e, record.id)}>
                <RiIcons.RiDeleteBin6Fill />
              </TableBtn>
            </MyTooltip>}
          </div>
        )
      },
    ];
    setColumns(columnsDef);
  }, [jobDetail, data, filters])

  useEffect(() => {
    let searchedData = jobDetail
    setData(searchedData)
  }, [globalSearch, jobDetail])

  // Get single job record 
  function getSingleJobData(id) {
    return getSingleJob(id).then((res) => {
      return res?.data
    }).catch(err => {
      return
    })
  }

  const updateClientJobPopUps = (data) => {
    setClientJobError({})
    setPopUpClientJob(true)
    getSingleJobData(data.id).then((res) => {
      if (res?.job) {
        setSelectedClientJob(res.job)
      }
    }).catch(() => {
      setSelectedClientJob(null)
    })
    getCustomersList()
  }

  const onClientJobCancelHandler = () => {
    setClientJobError({})
    setPopUpClientJob(false)
    setSelectedClientJob(null)
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

  const openJobUpdateAfterConvert = (jobId) => {
    let data = { id: jobId }
    updatePopUps(data)
  }

  const onRowClick = (e, record) => {
    const target = e.target
    if (!target.className.includes('delete-action-btn')) {
      openActivityPopup(record)
    }
  }

  const editButtonHandler = (record) => {
    if (record?.request_status == 11 || record?.request_status == 12 || record?.request_status == 16) {
      updateClientJobPopUps(record)
    } else {
      updatePopUps(record)
    }
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
    getJobsData(record.customer)
    setTaskFormValue({ customer: record.customer, project: record.id })
  }

  // Show Task button click handler
  const showTasksButtonOnclickHandler = (record) => {
    navigate("/tasks", { state: { jobId: record.id } })
  }

  // Get activity notes of job
  const getActivityNotesByJobId = (id) => {
    fetchActivityNotesByJobId(id).then((res) => {
      if (res.data?.job_notes) {
        setActivityNotes(res.data?.job_notes)
      }
    }).catch(() => { setActivityNotes([]) })
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
    getJobListPagination(paginationData.per_page, paginationData.current_page, filters, true)
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
    let token = localStorage.getItem("token")
    let localUserId = localStorage.getItem("id")
    if (isEmailLink == "true") {
      if (token && (userId == localUserId)) {
        openActivityPopup({ id: jobId })
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
          isClientRequest={true}
          filters={filters}
          successMessage={jobSuccessMessage}
          setSuccessMessage={setJobSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>
      {popUpClientJob && <div className={`mainpopups`}>
        <UpdateClientForm
          customerList={customerList}
          selectedJob={selectedClientJob}
          setSelectedJob={setSelectedClientJob}
          onClick={onClientJobCancelHandler}
          formError={clientJobError}
          setFormError={setClientJobError}
          getJobListPagination={getJobListPagination}
          paginationData={paginationData}
          isClientRequest={true}
          filters={filters}
          openJobUpdateAfterConvert={openJobUpdateAfterConvert}
        />
        <div className="blurBg"></div>
      </div>}
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
    </>
  );
};

export default JobsTable;
