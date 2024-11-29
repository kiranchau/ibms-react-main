/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

import '../../SCSS/users.scss';
import UsersTable from './UsersTable';
import Button from '../../commonModules/UI/Button';
import AddUser from '../../popups/userpops/AddUser';
import { GetAllUsers, fetchClientStatus, fetchDepartments, fetchJobCodes, fetchPermissions, fetchUserType, getCust, getUsersPagination } from '../../../API/authCurd';
import { calculatePageCount, checkPermission } from '../../../Utils/helpers';

const Users = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [popUps, setPopUps] = useState(false);
  const [usersList, setUsersList] = useState([])
  const [formData, setFormData] = useState({});
  const [fetchData, setFetchData] = useState([])
  const [clientStatus, setClientStatus] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const [permissionArr, setPermissionsArr] = useState([])
  const [addFormError, setAddFormError] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    let permission = checkPermission("Users")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  function getDepartmentList() {
    fetchDepartments().then((res) => {
      if (res.data?.departments) { setDepartments(res.data?.departments) }
    }).catch(() => { setDepartments([]) })
  }

  const getJobCodes = () => {
    fetchJobCodes()
      .then((res) => {

        if (res.data?.job_codes) { setJobCodes(res.data?.job_codes) }
      }).catch(() => { setJobCodes([]) })
  }

  // Get user list function
  function getUsersList() {
    GetAllUsers().then((res) => {
      setUsersList(res.data.users)
    }).catch(() => {
      setUsersList([])
    })
  }

  // Get user list function
  function getUsersListPagination(perPage, pageNum) {
    setIsLoading(true)
    getUsersPagination(perPage, pageNum).then((res) => {
      setIsLoading(false)
      setUsersList(res.data?.users?.data)
      let pageCount = calculatePageCount(res.data?.users.total, res.data?.users.per_page)
      setPaginationData({
        current_page: res.data?.users.current_page,
        prev_page_url: res.data?.users.prev_page_url,
        next_page_url: res.data?.users.next_page_url,
        per_page: res.data?.users.per_page,
        total: res.data?.users.total,
        pagesCount: pageCount
      })
    }).catch(err => {
      setIsLoading(false)
      setUsersList([])
    })
  }

  const getClientStatus = () => {
    fetchClientStatus().then((res) => {
      if (res.data?.client_status) { setClientStatus(res.data?.client_status) }
    }).catch(() => { setClientStatus([]) })
  }


  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
      console.log("getCustomersList-jobs: ", err)
    })
  }

  const getuserType = () => {
    fetchUserType().then((res) => {
      if (res.data?.user_type) { setFetchData(res.data?.user_type) }
    }).catch(() => { setFetchData([]) })
  }

  const getPermissionList = () => {
    fetchPermissions().then((res) => {
      if (res.data) { setPermissions(res.data) }
    }).catch(() => { setPermissions([]) })
  }

  const addUserButtonClickHandler = () => {
    setAddFormError({})
    setPermissionsArr([])
    setFormData({});
    setPopUps(!popUps);
    getClientStatus();
    getCustomersList();
    getJobCodes();
    getPermissionList()
  }

  useEffect(() => {
    getUsersList()
    // getUsersListPagination(20, 1)
    getuserType();
    getDepartmentList()
  }, [])

  return (
    <>
      <div className="PageContent userpage">
        <div className='mx-3 settingPage'>
          <div className="header px-3 py-1 d-flex justify-content-between">
            <div><span className='pe-2'>
              <FaIcons.FaUsers />
            </span>
              Users </div>
            <Button className="headBtn" onClick={addUserButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Add User</Button>
          </div>
          <UsersTable
            usersList={usersList}
            paginationData={paginationData}
            setPaginationData={setPaginationData}
            getUsersListPagination={getUsersListPagination}
            customerList={customerList}
            clientStatus={clientStatus}
            departments={departments}
            getClientStatus={getClientStatus}
            getCustomersList={getCustomersList}
            getDepartmentList={getDepartmentList}
            permissions={permissions}
            getPermissionList={getPermissionList}
            getUsersList={getUsersList}
            fetchData={fetchData}
          />
        </div>
      </div>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <AddUser onClick={() => setPopUps(!popUps)} getUsersList={getUsersList} formData={formData} customerList={customerList}
          setFormData={setFormData} fetchData={fetchData} setFetchData={setFetchData} clientStatus={clientStatus} jobCodes={jobCodes} departments={departments} getUsersListPagination={getUsersListPagination} paginationData={paginationData} addFormError={addFormError} setAddFormError={setAddFormError} permissions={permissions}
          permissionArr={permissionArr} setPermissionsArr={setPermissionsArr} setPaginationData={setPaginationData}
          />
        <div className="blurBg"></div>
      </div>
    </>
  );
}

export default Users;
