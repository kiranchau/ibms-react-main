/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import Button from '../../commonModules/UI/Button';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from "react-icons/fa6";
import JobsTable from './JobsTable';
import '../../SCSS/jobs.scss';
import AddJobs from '../../popups/jobspopups/AddJobs';
import { calculatePageCount, checkPermission, getFilterFromLocal, saveFilterToLocal } from '../../../Utils/helpers';
import { deleteJob, fecthUsersWithType, fetchJobCodes, fetchPaymentTerms, fetchServiceTypes, getCust, getJob, getjobPage } from '../../../API/authCurd';
import { useNavigate, useLocation } from "react-router-dom";
import { paginationInitialPage } from '../../../Utils/pagination';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
import UpdateForm from '../../popups/jobspopups/updateForm';
import { JobContext } from '../../contexts/JobContext';
import CustomerContextProvider from '../../contexts/CustomerContext';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import Form from 'react-bootstrap/Form';
const paginationPerPage = 50

const Jobs = () => {
  const [popUps, setPopUps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobCodes, setJobCodes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [responsibleUser, setResponsibleUser] = useState([]);
  const [jobDetail, setJobDetail] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formError, setFormError] = useState({})
  const [formValues, setFormValues] = useState({})
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const navigate = useNavigate()
  let userId = localStorage.getItem("id")
  const [filters, setFilters] = useState({
    customer_id: [],
    type_id: [],
    status: ["2"],
    assignee: [],
    global_search: "",
    job_id: []
  })
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const {
    jobOpenPopup, jobSectionCodes, JobPaymentTerms, JobCustomerList, selectedJobForSection, setSelectedJobForSection,
    JobResponsibleUser, JobFormError, setJobFormError, updateJobCancelClickHandler, updateJobPopupOpen, jobSuccessMessage, setJobSuccessMessage
} = useContext(JobContext)

  useEffect(() => {
    let permission = checkPermission("Jobs")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  function getJobListPagination(perPage, pageNum, searchParams, isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    let search = JSON.stringify(searchParams)
    return getjobPage(perPage, pageNum, search).then((res) => {
      setIsLoading(false)
      setJobDetail(res.data?.Projects?.data)
      let pageCount = calculatePageCount(res.data?.Projects.total, res.data?.Projects.per_page)
      setPaginationData({
        current_page: res.data?.Projects.current_page,
        prev_page_url: res.data?.Projects.prev_page_url,
        next_page_url: res.data?.Projects.next_page_url,
        per_page: res.data?.Projects.per_page,
        total: res.data?.Projects.total,
        pagesCount: pageCount
      })
    }).catch(err => {
      setIsLoading(false)
      setJobDetail([])
    })
  }

  function getJobList(isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    getJob().then((res) => {
      setIsLoading(false)
      setJobDetail(res.data.Projects)
    }).catch(err => {
      setIsLoading(false)
    })
  }

  function deletJobList(id) {
    deleteJob(id)
      .then((res) => {
        const newData = jobDetail.filter((post) => post.id !== id);
        setJobDetail(newData);
      }).catch(err => {
        console.log("getCust: ", err)
      })
  }

  const getJobCodes = () => {
    fetchJobCodes()
      .then((res) => {
        if (res.data?.job_codes) { setJobCodes(res.data?.job_codes) }
      }).catch(() => { setJobCodes([]) })
  }

  const getPaymentTerms = () => {
    fetchPaymentTerms().then((res) => {
      if (res.data?.payment_terms) { setPaymentTerms(res.data?.payment_terms) }
    }).catch(() => { setPaymentTerms([]) })
  }

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  const getResponsibleUsers = () => {
    fecthUsersWithType(2).then((res) => {
      if (res.data?.users) { setResponsibleUser(res.data?.users) }
    }).catch(() => { setResponsibleUser([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
      console.log("getCustomersList-jobs: ", err)
    })
  }
  const addJobButtonClickHandler = () => {
    setFormError({})
    if (filters?.customer_id?.length > 0) {
      setFormValues({ customer: filters?.customer_id?.[0] ? filters?.customer_id?.[0] : "" })
    } else {
      setFormValues({})
    }
    setPopUps(!popUps)
    getJobCodes();
    getCustomersList();
    getServiceTypes();
    getResponsibleUsers()
  }

  let id;
  useEffect(() => {
    id = queryParams.get('id');
  }, [])

  useEffect(() => {
    if (globalSearch && !id) {
      let searchParams = {
        customer_id: [],
        type_id: [],
        status: [],
        assignee: [],
        job_id: [],
        global_search: globalSearch?.trim()
      }
      setFilters(searchParams);
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('jobs', saveFilter)
      getJobListPagination(paginationPerPage, paginationInitialPage, searchParams).then(() => {
        queryParams.delete(id)
      })
    } else {
      if (id) {
        resetSearch()
      }
      let savedFilters = getFilterFromLocal('jobs')
      let searchParams = {
        ...filters,
        customer_id: id ? [id] : savedFilters?.customer_id ? savedFilters?.customer_id : [],
        type_id: savedFilters?.type_id ? savedFilters?.type_id : [],
        status: savedFilters?.status ? savedFilters?.status : ["2"],
        assignee: savedFilters?.assignee ? savedFilters?.assignee : [],
        job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
        global_search: ""
      }
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('jobs', saveFilter)
      setFilters(searchParams)
      getJobListPagination(paginationPerPage, paginationInitialPage, searchParams).then(() => {
        queryParams.delete(id)
        id = null
      })
    }
  }, [globalSearch])

  function openJobUpdateModel(jobId, msg) {
    if (jobId) {
      setJobSuccessMessage(msg ? msg : "")
      setTimeout(() => {
        setJobSuccessMessage("")
      }, 10000)
      updateJobPopupOpen(jobId)
    }
  }
  useEffect(() => {
    getCustomersList()
  }, [])

  // Status filter onChange handler
  function onCustomerFilterChangeHandler(e) {
    let fils = { ...filters, customer_id: e.target.value ? [e.target.value] : [] }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('jobs', saveFilter)
    resetSearch()
    getJobListPagination(paginationData.per_page, paginationData.current_page, fils, true)
    setFilters((prev) => ({ ...prev, customer_id: e.target.value ? [e.target.value] : [] }))
  }

  return (
    <div className="PageContent jobpage">
      <div className='mx-3 mt-2 settingPage'>
        <div className="header flex-wrap px-3 py-1 d-flex justify-content-between">
          <div><span className='pe-2'>
            <MdIcons.MdFactory />
          </span>
            Jobs </div>
          <div className='header-wrapper'>
            <div className="ms-3 selectBox-wrap">
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
            </div>
            <Button className="headBtn" onClick={addJobButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Add Job</Button>
          </div>
        </div>

        <div className='h-100'>
            <JobsTable jobDetail={jobDetail}
              getJobListPagination={getJobListPagination}
              paginationData={paginationData}
              setPaginationData={setPaginationData}
              getPaymentTerms={getPaymentTerms}
              jobCodes={jobCodes}
              getJobCodes={getJobCodes}
              getServiceTypes={getServiceTypes}
              getCustomersList={getCustomersList}
              paymentTerms={paymentTerms}
              customerList={customerList}
              getJobList={getJobList} deletJobList={deletJobList}
              serviceTypes={serviceTypes}
              isLoading={isLoading}
              getResponsibleUsers={getResponsibleUsers}
              responsibleUser={responsibleUser}
              setJobDetail={setJobDetail}
              filters={filters}
              setFilters={setFilters}
            />
        </div>
      </div>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <AddJobs jobDetail={jobDetail}
          getJobList={getJobList}
          jobCodes={jobCodes}
          paymentTerms={paymentTerms}
          customerList={customerList} deletJobList={deletJobList}
          onClick={() => setPopUps(!popUps)}
          serviceTypes={serviceTypes}
          responsibleUser={responsibleUser}
          formError={formError}
          setFormError={setFormError}
          formValues={formValues}
          setFormValues={setFormValues}
          getJobListPagination={getJobListPagination}
          paginationData={paginationData}
          setPaginationData={setPaginationData}
          filters={filters}
          setFilters={setFilters}
          openModel={openJobUpdateModel}
        />
        <div className="blurBg"></div>
      </div>
      {jobOpenPopup && <div className={`mainpopups`}>
        <UpdateForm
          jobCodes={jobSectionCodes}
          paymentTerms={JobPaymentTerms}
          customerList={JobCustomerList}
          getJobList={getJobListPagination}
          selectedJob={selectedJobForSection}
          onClick={updateJobCancelClickHandler}
          responsibleUser={JobResponsibleUser}
          formError={JobFormError}
          setFormError={setJobFormError}
          getJobListPagination={getJobListPagination}
          paginationData={paginationData}
          setSelectedJob={setSelectedJobForSection}
          filters={filters}
          setFilters={setFilters}
          successMessage={jobSuccessMessage}
          setSuccessMessage={setJobSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>}
    </div>
  )
}

export default Jobs;
