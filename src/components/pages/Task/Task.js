/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import '../../SCSS/task.scss';
import * as FaIcons from 'react-icons/fa';
import AddTask from '../../popups/taskpops/addTask';
import Button from '../../commonModules/UI/Button';
import TasksTable from './TasksTable';
import { deleteTask, fetchJobs, fetchPaymentTerms, fetchServiceTypes, fetchTaskPagination, getCust, getTask } from '../../../API/authCurd';
import { calculatePageCount, checkPermission, getFilterFromLocal, saveFilterToLocal } from '../../../Utils/helpers';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { paginationInitialPage } from '../../../Utils/pagination';
import { useLocation } from 'react-router-dom';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
import TaskUpdate from '../../popups/taskpops/TaskUpdate';
import { TaskContext } from '../../contexts/TaskContext';
import JobContextProvider from '../../contexts/JobContext';
import CustomerContextProvider from '../../contexts/CustomerContext';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
const paginationPerPage = 50

const Task = () => {
  const [popUps, setPopUps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [taskDetail, settaskDetail] = useState([]);
  const [taskId, setTaskId] = useState([]);
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate()
  const [showCallEntries, setShowCallEntries] = useState(false);
  let userId = localStorage.getItem("id")
  const [filters, setFilters] = useState({
    customer_id: [],
    job_id: [],
    assignee: [],
    status: [],
    global_search: "",
    customer_review: [],
    call_time_entry: 0,
    task_id: [],
  })
  const location = useLocation()
  const { globalSearch, resetSearch, selectedCompany } = useContext(GlobalSearch)
  const {
    openTaskPopup, TaskServiceTypes, TaskPaymentTerms, taskCustomerList, taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError,
    setTaskFormError, taskUpdatedtaskData, setTaskUpdatetaskdData, taskIsCallEntry, onTaskCancelBtnHandler, updateTaskPopupOpen,
    taskSuccessMessage, setTaskSuccessMessage
} = useContext(TaskContext)
  const queryParams = new URLSearchParams(location.search);
  let userType = localStorage.getItem('usertype');

  useEffect(() => {
    let permission = checkPermission("Tasks")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  function getTaskList(isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    getTask().then((res) => {
      setIsLoading(false)
      settaskDetail(res.data.Tasks)
      setTaskId(res.data.Tasks)
    }).catch(err => {
      setIsLoading(false)
    })
  }

  function deleteTaskList(id) {
    deleteTask(id)
      .then((res) => {
        const newData = taskDetail.filter((post) => post.id !== id);
        settaskDetail(newData);
      }).catch(err => {
        console.log("deleteTask-err: ", err)
      })
  }

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  const getPaymentTerms = () => {
    fetchPaymentTerms().then((res) => {
      if (res.data?.payment_terms) { setPaymentTerms(res.data?.payment_terms) }
    }).catch(() => { setPaymentTerms([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
    })
  }
  const addTaskButtonClickHandler = () => {
    setPopUps(!popUps)
    getServiceTypes();
    getCustomersList();
    setFormError({})
    if (filters?.customer_id?.length > 0) {
      fetchJobs(filters?.customer_id?.[0]).then((res) => {
        if (res.data?.jobs) {
          setJobs(res.data?.jobs);
        }
      }).catch(() => {
        setJobs([]);
      });
      setFormValue({ customer: filters?.customer_id?.[0] ? filters?.customer_id?.[0] : "", project: queryParams.get('job_id') ? queryParams.get('job_id') : "" })
    } else {
      setJobs([])
      setFormValue({})
    }
  }

  function getTaskListPagination(perPage, pageNum, searchParams, isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    let search = JSON.stringify(searchParams)
    return fetchTaskPagination(perPage, pageNum, search).then((res) => {
      setIsLoading(false)
      settaskDetail(res.data?.Tasks?.data)
      let pageCount = calculatePageCount(res.data?.Tasks.total, res.data?.Tasks.per_page)
      setPaginationData({
        current_page: res.data?.Tasks.current_page,
        prev_page_url: res.data?.Tasks.prev_page_url,
        next_page_url: res.data?.Tasks.next_page_url,
        per_page: res.data?.Tasks.per_page,
        total: res.data?.Tasks.total,
        pagesCount: pageCount
      })
    }).catch(err => {
      setIsLoading(false)
      settaskDetail([])
    })
  }

  let id, jobId, isCallEntry;
  useEffect(() => {
    id = queryParams.get('id');
    jobId = queryParams.get('job_id');
    isCallEntry = queryParams.get('is_call_entry') == 1 ? 1 : 0;
  }, [])

  useEffect(() => {
    if (globalSearch && !id && !jobId && !isCallEntry) {
      let searchParams = {
        customer_id: selectedCompany ? [selectedCompany] : [],
        job_id: [],
        assignee: [],
        status: [],
        customer_review: [],
        global_search: globalSearch?.trim(),
        call_time_entry: 0,
        task_id: [],
      }
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('tasks', saveFilter)
      setFilters(searchParams)
      getTaskListPagination(paginationPerPage, paginationInitialPage, searchParams).then(() => {
        queryParams.delete("id")
        queryParams.delete("job_id")
        queryParams.delete("is_call_entry")
      })
    } else {
      let userType = localStorage.getItem('usertype');
      if (userType == 3) {
        let savedFilters = getFilterFromLocal('tasks')
        let searchParams = {
          ...filters,
          global_search: "",
          customer_id: selectedCompany ? [selectedCompany] : [],
          job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
          assignee: savedFilters?.assignee ? savedFilters?.assignee : [],
          status: savedFilters?.status ? savedFilters?.status : [],
          customer_review: savedFilters?.customer_review ? savedFilters?.customer_review : [],
          call_time_entry: 0,
          task_id: savedFilters?.task_id ? savedFilters?.task_id : [],
        }
        let { global_search, ...saveFilter } = searchParams
        saveFilterToLocal('tasks', saveFilter)
        setFilters(searchParams)
        getTaskListPagination(paginationPerPage, paginationInitialPage, searchParams)
      } else {
        let savedFilters = getFilterFromLocal('tasks')
        let searchParams = {
          ...filters,
          customer_id: id ? [id] : savedFilters?.customer_id ? savedFilters?.customer_id : [],
          job_id: jobId ? [jobId] : savedFilters?.job_id ? savedFilters?.job_id : [],
          assignee: savedFilters?.assignee ? savedFilters?.assignee : [],
          status: savedFilters?.status ? savedFilters?.status : [],
          customer_review: savedFilters?.customer_review ? savedFilters?.customer_review : [],
          global_search: "",
          call_time_entry: isCallEntry,
          task_id: savedFilters?.task_id ? savedFilters?.task_id : [],
        }
        let { global_search, ...saveFilter } = searchParams
        saveFilterToLocal('tasks', saveFilter)
        setFilters(searchParams)
        getTaskListPagination(paginationPerPage, paginationInitialPage, searchParams).then(() => {
          queryParams.delete("id")
          queryParams.delete("job_id")
          queryParams.delete("is_call_entry")
          id = null
          jobId = null
          isCallEntry = null
        })
      }
    }
  }, [globalSearch, selectedCompany])

  // Call Entry checkbox 
  const callEntryCheckBoxHandler = (e) => {
    let callTimeEntry = e.target.checked ? 1 : 0

    let fils = { ...filters, call_time_entry: callTimeEntry }
    getTaskListPagination(paginationPerPage, paginationData.current_page, fils)

    setFilters((prev) => ({ ...prev, call_time_entry: callTimeEntry }))
    setShowCallEntries(!showCallEntries)
  }

  function openTaskUpdateModel(taskId, msg) {
    if (taskId) {
      setTaskSuccessMessage(msg ? msg : "")
      setTimeout(() => {
        setTaskSuccessMessage("")
      }, 10000)
      updateTaskPopupOpen("name", taskId)
    }
  }
  useEffect(() => {
    getCustomersList()
  }, [])

  // Status filter onChange handler
  function onCustomerFilterChangeHandler(e) {
    let fils = { ...filters, customer_id: e.target.value ? [e.target.value] : [] }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('tasks', saveFilter)
    resetSearch()
    getTaskListPagination(paginationData.per_page, paginationData.current_page, fils, true)
    setFilters((prev) => ({ ...prev, customer_id: e.target.value ? [e.target.value] : [] }))
  }

  return (
    <div className="PageContent taskpage">
      <div className='mx-3 mt-2 settingPage'>
        <div className="header px-3 py-1 d-flex justify-content-between">
          <div><span className='pe-2'>
            <FaIcons.FaClipboardList />
          </span>
            Tasks </div>
          <div className='d-flex align-items-center call-entry-checkbox'>
            {(userType == 1 || userType == 2) && <div className="ms-3 selectBox-wrap">
              <Form.Select
                aria-label="Default select example"
                value={filters.customer_id?.[0] ? filters.customer_id?.[0] : ""}
                onChange={onCustomerFilterChangeHandler}
              >
                <option key={0} value={""}>All Customers</option>
                {sortObjectsByAttribute(customerList).map((item) => {
                  return <option value={item.id} key={item.id}>{item.name}</option>
                })}
              </Form.Select>
            </div>}
            {(userType == 1 || userType == 2) && <div className='me-3'>
              <Form.Check
                type="checkbox"
                label={`Call Time Entry`}
                onChange={callEntryCheckBoxHandler}
                checked={filters.call_time_entry == 1 ? true : false}
                className="mb-0"
              />
            </div>}
            {(userType == 1 || userType == 2) && <Button className="headBtn" onClick={addTaskButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Add Task</Button>}
          </div>
        </div>

        <div className='h-100'>
              <TasksTable taskDetail={taskDetail} getTaskList={getTaskList} deleteTaskList={deleteTaskList}
                getServiceTypes={getServiceTypes}
                getPaymentTerms={getPaymentTerms}
                getCustomersList={getCustomersList}
                serviceTypes={serviceTypes}
                paymentTerms={paymentTerms}
                customerList={customerList}
                isLoading={isLoading} taskId={taskId}
                settaskDetail={settaskDetail}
                paginationData={paginationData}
                setPaginationData={setPaginationData}
                getTaskListPagination={getTaskListPagination}
                showCallEntries={showCallEntries}
                filters={filters}
                setFilters={setFilters}
              />
        </div>
      </div>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <AddTask taskDetail={taskDetail} getTaskList={getTaskList}
          deleteTaskList={deleteTaskList}
          serviceTypes={serviceTypes}
          paymentTerms={paymentTerms}
          customerList={customerList}
          onClick={() => setPopUps(!popUps)}
          isLoading={isLoading}
          formError={formError}
          setFormError={setFormError}
          formValue={formValue}
          setFormValue={setFormValue}
          paginationData={paginationData}
          setPaginationData={setPaginationData}
          getTaskListPagination={getTaskListPagination}
          jobs={jobs}
          setJobs={setJobs}
          filters={filters}
          setFilters={setFilters}
          openModel={openTaskUpdateModel}
        />
        <div className="blurBg"></div>
      </div>
      {openTaskPopup && <div className={`mainpopups`}>
        <TaskUpdate
          serviceTypes={TaskServiceTypes}
          paymentTerms={TaskPaymentTerms}
          customerList={taskCustomerList}
          getTaskList={getTaskListPagination}
          taskUpdateDetail={taskSectionUpdateDetail}
          onClick={onTaskCancelBtnHandler}
          formError={taskFormError}
          setFormError={setTaskFormError}
          paginationData={paginationData}
          getTaskListPagination={getTaskListPagination}
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
    </div>
  )
}

export default Task;
