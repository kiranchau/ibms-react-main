/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import * as FaIcons from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

import '../../SCSS/settings.scss'
import * as IoIcons from 'react-icons/io5';
import JobReports from './JobReports';
import WorkloadReport from './WorkloadReport';
import CompletedTaskReport from './CompletedTaskReport';
import UserActivityReport from './UserActivityReport';
import { GetUsers, fecthUsersWithType, getCust } from '../../../API/authCurd';
import { checkPermission } from '../../../Utils/helpers';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import ProjectHourlyReport from './ProjectHourlyReport';
import UserAuditTrailReport from './UserAuditTrailReport';

const Reports = () => {
  const [ibUsers, setIbUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [usersList, setUserList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [toggleState, setToggleState] = useState(1);
  const navigate = useNavigate()

  useEffect(() => {
    let permission = checkPermission("Reports")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  // Toggle tabs
  const toggleTab = (index) => {
    setToggleState(index)
  }

  // Get IB users list type = 2
  const getIbUsers = () => {
    fecthUsersWithType(2).then((res) => {
      if (res.data?.users) { setIbUsers(sortObjectsByAttribute(res.data?.users, "first_name")) }
    }).catch(() => { setIbUsers([]) })
  }

  // Get Customer users list type = 3
  const getCustomerUsers = () => {
    fecthUsersWithType(3).then((res) => {
      if (res.data?.users) { setCustomers(res.data?.users) }
    }).catch(() => { setCustomers([]) })
  }

  // Get user list funtion
  const getUserList = () => {
    GetUsers().then((res) => {
      if (res.data?.users) { setUserList(res.data?.users) }
    }).catch(() => { setUserList([]) })
  }

  // Get Customer list
  function getCustomersList() {
    getCust().then((res) => {
      if (res.data?.customers) { setCustomerList(res.data.customers) }
    }).catch(err => { setCustomerList([]) })
  }

  useEffect(() => {
    getIbUsers()
    // getCustomerUsers()
    getCustomersList()
    getUserList()
  }, [])

  const settingMenu = [
    { id: 1, title: "IB-RECRUIT Job Time Tracking Report", },
    { id: 2, title: "IB-RECRUIT Specialist Workload", },
    { id: 3, title: "Completed Tasks by User Report", },
    { id: 4, title: "User Activity Report", },
    { id: 5, title: "Project Hourly Report", },
    // { id: 6, title: "User Audit Trail Report", },
  ]

  const settingContent = [
    { id: 1, Content: <JobReports users={customerList} toggleState={toggleState} /> },
    { id: 2, Content: <WorkloadReport users={ibUsers} toggleState={toggleState} />, },
    { id: 3, Content: <CompletedTaskReport users={ibUsers} toggleState={toggleState} />, },
    { id: 4, Content: <UserActivityReport users={ibUsers} toggleState={toggleState} />, },
    { id: 5, Content: <ProjectHourlyReport customers={customerList} toggleState={toggleState} />, },
    // { id: 6, Content: <UserAuditTrailReport users={usersList} />, },
  ]

  return (
    <>

      {/* <SettingMenu /> */}
      <div className='PageContent '>

        <div className='mx-3 mt-2 settingPage'>
          <div className="header px-3 py-1">

            <span className='pe-2'>
              <IoIcons.IoDocumentText />
            </span>
            Reports

          </div>
          <div className=' h-100  tab-container'>
            <div className='Column1'>
              <div className='OnlyShadow'>
                <div className='ToGeneral InShadow'>
                  <div className='ProfileInfo'>
                    <div className='ProfileMenu'>
                      {settingMenu.map((menu, index) => (
                        <div key={index} className={toggleState === menu.id ? "ProfileTab-active" : "ProfileTab"} onClick={() => toggleTab(menu.id)}>
                          {menu.title}
                          <span className="ProfileTab-Arrow">
                            <FaIcons.FaCaretRight />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-tabs position-relative">
              {settingContent.map((cont, index) => (
                <div className={toggleState === cont.id ? "active-content" : "content"} key={index}>
                  {cont.Content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </>

  )
}

export default Reports;
