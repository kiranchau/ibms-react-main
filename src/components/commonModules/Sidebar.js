/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import * as AiIcons from 'react-icons/ai';
import * as PiIcons from 'react-icons/pi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import { BsDatabaseFillGear } from "react-icons/bs";
import { FaExclamation } from "react-icons/fa";

import '../SCSS/sidebar.scss';
import Header from "./Header";
import { fecthUsersWithType, fetchDepartments, fetchPermissions, getUserDetails, updateExclaimationMark } from "../../API/authCurd";
import { adminPermissions, customerPermissions } from "../../Utils/staticdata";
import CenterTooltip from "./UI/CenterTooltip";
import { sortObjectsByAttribute } from "../../Utils/sortFunctions";
import { GlobalSearch } from "../contexts/GlobalSearchContext";
import { uniqueItemsFromArray } from "../../Utils/helpers";

const markFields = ["Client Job Requests", "CollabHub"]

const Sidebar = () => {
  const [permissions, setPermissions] = useState([]);
  const [permissionArr, setPermissionsArr] = useState([]);
  const [userPermission, setUserPermission] = useState("[]")
  const [inActive, setInActive] = useState(false);
  const [user, setUser] = useState(null);
  const { setMentionArr, setCompanies, setSelectedCompany, setSelectedCompanyData, userData, setUserData, fetchUserData } = useContext(GlobalSearch)

  const menuItems = [
    { name: "Dashboard", to: '/dashboard', exact: true, icon: <AiIcons.AiFillDashboard /> },
    { name: "Customers", to: '/customers', exact: true, icon: <FaIcons.FaBriefcase /> },
    { name: "Jobs", to: '/jobs', icon: <MdIcons.MdFactory /> },
    { name: "Tasks", to: '/tasks', exact: true, icon: <FaIcons.FaClipboardList /> },
    { name: "Notifications", to: '/notifications', exact: true, icon: <MdIcons.MdNotifications /> },
    { name: "CollabHub", to: '/forums', exact: true, icon: <MdIcons.MdForum /> },
    { name: "Client Job Requests", to: '/clientjobrequest', exact: true, icon: <MdIcons.MdFactory /> },
    { name: "Billings", to: '/bill', exact: true, icon: <FaIcons.FaMoneyBillAlt /> },
    { name: "Settings", to: '/settings', icon: <BsDatabaseFillGear /> },
    { name: "Users", to: '/users', icon: <FaIcons.FaUsers /> },
    { name: "Reports", to: '/reports', exact: true, icon: <IoIcons.IoDocumentText /> },
    { name: "Passwords", to: '/passwords', icon: <PiIcons.PiLockKeyFill /> },
  ]

  // Get user details by token function
  const getUserDetailsByToken = () => {
    getUserDetails().then((res) => {
      setUser(res.data)
      setUserData(res.data)
      localStorage.setItem("permissions", res.data?.user_permissions ? res.data?.user_permissions.permission_ids : "[]")
      localStorage.setItem("permittedmodules", res.data?.permissions ? res.data?.permissions : "")
      localStorage.setItem("first_name", res.data?.first_name)
      localStorage.setItem("last_name", res.data?.last_name)
      localStorage.setItem("usertype", res.data?.user_type)
      localStorage.setItem("id", res.data?.id)
      localStorage.setItem("customerId", res.data?.customer_id)
      setUserPermission(res.data?.user_permissions ? res.data?.user_permissions.permission_ids : "[]")
      let customerContactDetails = res.data?.user_contact_details ? res.data?.user_contact_details : []
      let comps = []
      if (customerContactDetails?.length > 0) {
        customerContactDetails.forEach((item) => {
          comps.push({ id: item?.customer_details.id, name: item?.customer_details.name, email: item?.customer_details.email })
        })
      }
      if (res.data?.customer_details) {
        comps.push({ id: res.data?.customer_details.id, name: res.data?.customer_details.name, email: res.data?.customer_details.email })
      }
      let uniqueClient = uniqueItemsFromArray(comps)
      let sortedCompanies = sortObjectsByAttribute(uniqueClient, "name")
      setCompanies(sortedCompanies)
      if (sortedCompanies?.length > 0) {
        if (sortedCompanies?.length == 1) {
          setSelectedCompany(sortedCompanies?.[0]?.id ? sortedCompanies?.[0]?.id : "")
          setSelectedCompanyData(sortedCompanies?.[0] ? sortedCompanies?.[0] : null)
        }
        else {
          setSelectedCompany("")
          setSelectedCompanyData(null)
        }
      } else {
        setSelectedCompany("")
        setSelectedCompanyData(null)
      }
    }).catch((err) => { })
  }

  const getPermissionList = () => {
    fetchPermissions().then((res) => {
      if (res.data) { setPermissions(res.data) }
    }).catch(() => { setPermissions([]) })
  }

  function getMentionsArray() {
    Promise.all([fetchDepartments(), fecthUsersWithType(2)]).then((response) => {
      let list = []
      response.forEach((res) => {
        if (res.data.departments) {
          let deps = res?.data?.departments?.map((item) => ({
            id: -item.id,
            value: `All ${item?.name}`,
          }))
          list.push(sortObjectsByAttribute(deps, "value"))
        } else if (res.data.users) {
          let users = res?.data?.users?.map((item) => ({
            id: item.id,
            value: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`,
          }))
          list.push(sortObjectsByAttribute(users, "value"))
        }
      })
      setMentionArr(list.flat())
    }).catch(() => setMentionArr([]))
  }

  useEffect(() => {
    getPermissionList()
    getUserDetailsByToken()
    getMentionsArray()
  }, [])

  useEffect(() => {
    let tabs = []
    if (user?.user_type == 1) {
      tabs = [...adminPermissions]
    } else if (user?.user_type == 3) {
      tabs = [...customerPermissions]
    } else {
      const perm = JSON.parse(userPermission)
      perm.forEach((item) => {
        let obj = permissions.find(x => x.permission_id == item)
        if (obj) {
          tabs.push(obj.permission_name)
        }
      })
      if (user?.user_type == 2) {
        tabs.push("Dashboard")
        tabs.push("Notifications")
      }
    }
    setPermissionsArr(tabs)
  }, [userPermission, permissions, user])

  const closeNavbar = (e, item) => {
    if (markFields.includes(item?.name)) {
      let payload = { section: item?.name }
      updateExclaimationMark(payload).then((res) => {
        fetchUserData()
      })
    }

    if (window.innerWidth <= 576) {
      setInActive(false)
    }
  }

  return (
    <>
      <Header onClick={() => setInActive(!inActive)} user={user} />
      <div className={`${inActive ? 'navigation smallNav' : 'navigation bigNav'}`}>
        <div style={{ paddingTop: "70px" }}>
          <ul>
            {
              menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <li className={`list ${permissionArr.includes(item.name) ? "" : "hidden"}`} onClick={(e) => closeNavbar(e, item)}>
                    <NavLink to={item.to} className={({ isActive }) => isActive ? "active" : undefined}>
                      <b></b>
                      <b></b>
                      <b></b>
                      <CenterTooltip title={item.name} >
                        <span className="icon myIcon"> {item.icon}</span>
                      </CenterTooltip>
                      <span className="title">{item.name} {(item.name == "CollabHub" && userData?.user_type != 3 && userData?.is_new_post == 1) && <span><FaExclamation className="text-danger" /></span>}
                        {(item.name == "Client Job Requests" && userData?.user_type != 3 && userData?.is_new_request == 1) && <span><FaExclamation className="text-danger" /></span>}</span>
                    </NavLink>
                  </li>
                </React.Fragment>
              ))
            }
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
