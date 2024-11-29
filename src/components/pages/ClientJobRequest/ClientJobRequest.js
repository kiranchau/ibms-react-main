/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import * as MdIcons from 'react-icons/md';
import * as FaIcons from "react-icons/fa6";

import '../../SCSS/jobs.scss';
import JobsTable from './JobsTable';
import { calculatePageCount, checkPermission, getFilterFromLocal, saveFilterToLocal } from '../../../Utils/helpers';
import { deleteJob, fecthUsersWithType, fetchJobCodes, fetchServiceTypes, getCientRequestJobPage, getCust, getJob } from '../../../API/authCurd';
import { paginationInitialPage } from '../../../Utils/pagination';
import CustomerContextProvider from '../../contexts/CustomerContext';
import AddClientJobReqFormWrap from './AddClientJobReqFormWrap';
import Button from '../../commonModules/UI/Button';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
const paginationPerPage = 50

const ClientJobRequest = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobCodes, setJobCodes] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [responsibleUser, setResponsibleUser] = useState([]);
  const [jobDetail, setJobDetail] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    customer_id: [],
    request_status: ["11", "12", "14"],
    assignee: [],
    job_id: []
  })
  const [openAddJobReqPopup, setOpenAddJobReqPopup] = useState(false)
  const { globalSearch, selectedCompany } = useContext(GlobalSearch)
  const usertype = localStorage.getItem("usertype")

  useEffect(() => {
    let permission = checkPermission("Client Job Requests")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  function getJobListPagination(perPage, pageNum, searchParams, isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    let search = JSON.stringify(searchParams)
    getCientRequestJobPage(perPage, pageNum, search).then((res) => {
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

  function getJobList() {
    setIsLoading(true)
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
    })
  }

  useEffect(() => {
    if (globalSearch) {
      let searchParams = { customer_id: [], request_status: [], assignee: [], global_search: globalSearch?.trim(), job_id: [] }
      setFilters(searchParams)
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('clientJobsRequest', saveFilter)
      getJobListPagination(paginationPerPage, paginationInitialPage, searchParams)
    } else {
      let userType = localStorage.getItem('usertype');
      if (userType == 3) {
        let savedFilters = getFilterFromLocal('clientJobsRequest')
        let searchParams = {
          ...filters,
          customer_id: selectedCompany ? [selectedCompany] : [],
          request_status: savedFilters?.request_status ? savedFilters?.request_status : ["11", "12", "14"],
          assignee: savedFilters?.assignee ? savedFilters?.assignee : [],
          job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
          global_search: ""
        }
        let { global_search, ...saveFilter } = searchParams
        saveFilterToLocal('clientJobsRequest', saveFilter)
        setFilters(searchParams)
        getJobListPagination(paginationPerPage, paginationInitialPage, searchParams)
      } else {
        let savedFilters = getFilterFromLocal('clientJobsRequest')
        let searchParams = {
          ...filters,
          customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [],
          request_status: savedFilters?.request_status ? savedFilters?.request_status : ["11", "12", "14"],
          assignee: savedFilters?.assignee ? savedFilters?.assignee : [],
          job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
          global_search: ""
        }
        let { global_search, ...saveFilter } = searchParams
        saveFilterToLocal('clientJobsRequest', saveFilter)
        setFilters(searchParams)
        getJobListPagination(paginationPerPage, paginationInitialPage, searchParams)
      }
    }
  }, [globalSearch, selectedCompany])

  const openClientJobReqButtonClick = () => {
    setOpenAddJobReqPopup(true)
    getCustomersList()
  }

  const onAddCloseButtonHandler = () => {
    setOpenAddJobReqPopup(false)
    setCustomerList([])
  }

  return (
    <div className="PageContent jobpage">
      <div className='mx-3 mt-2 settingPage'>
        <div className="header px-3 py-1 d-flex justify-content-between">
          <div>
            <span className='pe-2'>
              <MdIcons.MdFactory />
            </span>
            Client Job Requests </div>
          {(usertype == 3) && <Button className="headBtn" onClick={openClientJobReqButtonClick}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> New Job Request</Button>}
        </div>
        <div className='h-100'>
          <CustomerContextProvider>
            <JobsTable
              jobDetail={jobDetail}
              getJobListPagination={getJobListPagination}
              paginationData={paginationData}
              setPaginationData={setPaginationData}
              jobCodes={jobCodes}
              getJobCodes={getJobCodes}
              getServiceTypes={getServiceTypes}
              getCustomersList={getCustomersList}
              customerList={customerList}
              getJobList={getJobList}
              deletJobList={deletJobList}
              serviceTypes={serviceTypes}
              isLoading={isLoading}
              getResponsibleUsers={getResponsibleUsers}
              responsibleUser={responsibleUser}
              setJobDetail={setJobDetail}
              filters={filters}
              setFilters={setFilters}
            />
          </CustomerContextProvider>
        </div>
      </div>
      {openAddJobReqPopup && <div className={`centerpopups`}>
        <AddClientJobReqFormWrap jobDetail={jobDetail}
          customerList={customerList}
          onClick={onAddCloseButtonHandler}
          getJobListPagination={getJobListPagination}
          paginationData={paginationData}
          setPaginationData={setPaginationData}
          filters={filters}
          setFilters={setFilters}
        />
        <div className="blurBg"></div>
      </div>}
    </div>
  )
}

export default ClientJobRequest;
