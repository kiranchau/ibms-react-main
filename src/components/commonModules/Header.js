/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Smlllogo from "../../images/Login/SmallLogo.png";
import logo from "../../images/logo.png";
import "../SCSS/header.scss";
import * as IoIcons from 'react-icons/io'
import * as TbIcons from 'react-icons/tb'
import * as RiIcons from 'react-icons/ri'
import { NotificationCount, deleteNotifications, updateUserLastActiveTime } from "../../API/authCurd";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Notification from "./NotificationComponent/Notification";
import { getNameInitials } from "../../Utils/helpers";
import { parseDateTimeString } from "../../Utils/dateFormat";
import { ImSearch } from "react-icons/im";
import { GlobalSearch } from "../contexts/GlobalSearchContext";
import CenterTooltip from "./UI/CenterTooltip";
import Form from 'react-bootstrap/Form';
import { sortObjectsByAttribute } from "../../Utils/sortFunctions";

const Header = (props) => {
  const [show, setShow] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const Navigation = (url) => {
    window.location.href = url;
  };
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [notificationContent, setNotificationContent] = useState([]);
  const [counting, setCounting] = useState(0);
  const { setGlobalSearch, serchText, setSearchText, companies, selectedCompany, setSelectedCompany, resetSearch, selectedCompanyData, setSelectedCompanyData } = useContext(GlobalSearch)
  const location = useLocation()
  let userType = localStorage.getItem('usertype')
  const navigate = useNavigate()

  const getUserNotifications = () => {
    NotificationCount(localStorage.getItem("tokenId"))
      .then((res) => {
        if (res.data && res.data.length !== 0) {
          const notificationCount = res.data.length;
          // Assuming notification_template is an array within each notification
          const notificationDescriptions = res.data.map(notification => {
            if (notification.notification_template && notification.notification_template.length > 0) {
              return notification.notification_template[0].description;
            } else {
              return undefined; // Adjust this based on your data structure
            }
          });

          const notificationDtails = res.data
          setCounting(notificationCount);
          setNotificationContent(notificationDtails);
        }
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  };

  useEffect(() => {
    if (userType != 3) {
      getUserNotifications();
    }
  }, []);

  const clearNotifications = (e) => {
    deleteNotifications().then((res) => {
      setNotificationContent([])
      setCounting(0)
    }).catch((err) => { })
  }

  const handleNotificationClick = (url, id) => {
    const lowerCaseUrl = url.toLowerCase(); // Convert URL to lowercase
    if (lowerCaseUrl.includes('task') && id === 'yourTaskId') {
      // Redirect to the Task page with the specified task ID using a query parameter
      Navigation(`/tasks?id=${id}`);
    } else if (lowerCaseUrl.includes('project') && id === 'yourProjectId') {
      // Redirect to the Project page with the specified project ID using a query parameter
      Navigation(`/projects?id=${id}`);
    } else if (lowerCaseUrl.includes('customer') && id === 'yourCustomerId') {
      // Redirect to the Customer page with the specified customer ID using a query parameter
      Navigation(`/customers?id=${id}`);
    } else {
      // Redirect to a default page or handle other cases
      // Navigation('/default');
    }
  };

  useEffect(() => {
    setUserDetails(props.user)
  }, [props.user])

  useEffect(() => {
    setSearchText("")
    setGlobalSearch("")
  }, [location])

  const onGlobalSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  const onBlurClickHandler = (e) => {
    e.preventDefault()
    setGlobalSearch(serchText)
  }

  const logoOnClickHandler = () => {
    const usertype = localStorage.getItem("usertype")
    if (usertype == 3) {
      navigate("/tasks")
    } else {
      navigate("/dashboard")
    }
  }

  const logoutClickHandler = (e) => {
    e.preventDefault()
    updateUserLastActiveTime().then((res) => {
      localStorage.clear(e)
      navigate("/")
    }).catch((err) => {
      console.log("logoutClickHandler-err: ", err)
    })
  }

  const onCustomerFilterChangeHandler = (e) => {
    resetSearch()
    if (e.target.value == "") {
      setSelectedCompanyData(null)
    } else {
      let cp = companies?.find((c) => c.id == e.target.value)
      setSelectedCompanyData(cp)
    }
    setSelectedCompany(e.target.value)
  }

  return (
    <>
      <div className="headbg p-2 d-flex justify-content-between align-items-center header-container">
        <div className="topSection p-2 d-flex align-items-center">
          <img src={Smlllogo} className="smallLogo" alt="small Logo" onClick={logoOnClickHandler} />
          <img src={logo} className="smallLogo mobilelogo" alt="small Logo" onClick={logoOnClickHandler} />
          <div type='button' onClick={props.onClick}><RiIcons.RiBarChartHorizontalFill className="myIcon" /></div>
        </div>
        <div className="center-content">
          <div className="user-title">
            {(userDetails?.user_type == 3 && companies?.length > 0) &&
              <p className="mb-0 ">{`Customer Portal - ${selectedCompanyData ? selectedCompanyData?.name : "All Companies"}`}</p>
            }
          </div>
          <form className="search-box-wrap" onSubmit={onBlurClickHandler}>
            <div className="inner-searchbox">
              <ImSearch />
              <input
                type="text"
                placeholder="Search"
                value={serchText}
                onChange={onGlobalSearchChange}
                autoComplete="false"
              />
            </div>
          </form>
          {(userDetails?.user_type == 3 && companies?.length > 1) && <div className=" selectBox-wrap">
            <label>Company Selection:</label>
            <Form.Select
              aria-label="Default select example"
              value={selectedCompany ? selectedCompany : ""}
              onChange={onCustomerFilterChangeHandler}
            >
              <option key={0} value={""}>All Companies</option>
              {sortObjectsByAttribute(companies).map((item) => {
                return <option value={item.id} key={item.id}>{item.name}</option>
              })}
            </Form.Select>
          </div>}
        </div>
        <div className="px-2 d-flex align-items-center profile-text">
          <div className="float-end px-2">
            <div className="userName">{`${userDetails?.first_name ? userDetails?.first_name : ""} ${userDetails?.last_name ? userDetails?.last_name : ""}`}</div>
          </div>
          <div>
            <div className="profileIcon d-flex align-items-center justify-content-center">
              {getNameInitials(userDetails?.first_name, userDetails?.last_name)}
            </div>
          </div>
          {userType != 3 && <CenterTooltip title="Notifications">
            <span className="myIcon d-flex align-items-center position-relative" onClick={handleShow}>
              <IoIcons.IoIosNotifications />
              {counting > 0 && <div className="position-absolute notificationCount">
                <div className={counting === 0 ? "" : "pulse-base"}>
                  <span className="notification-count">{counting}</span>
                </div>
              </div>}
            </span>
          </CenterTooltip>}
          <Offcanvas show={show} onHide={handleClose} placement="end" className='notification-wrap'>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                <div><IoIcons.IoIosNotifications className="noti-icon" /> Alerts</div>
                <p onClick={(e) => { clearNotifications(e) }} className="clear-btn">Clear All</p>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="pt-0">
              <div>
                {notificationContent.map((notifi, index) => (
                  <div className="noti-user-wrap" key={index}>
                    <div className="user-profile">
                      {getNameInitials(notifi?.notification_user?.first_name, notifi?.notification_user?.last_name)}
                    </div>
                    <div className="user-info">
                      <div className="name-time">
                        <div className='overSizeFlow'>
                          <React.Fragment key={index}>
                            <div className="d-flex justify-content-between  notTab">
                              <Notification
                                description={notifi.description}
                                created_at={parseDateTimeString(notifi.created_at, 7)}
                                // url={notifi.url}
                                onClick={() => handleNotificationClick(notifi.url)}
                              />
                            </div>
                          </React.Fragment>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Offcanvas.Body>
          </Offcanvas>
          <CenterTooltip title="Log Out">
            <Link onClick={(e) => logoutClickHandler(e)}><span className="myIcon d-flex align-items-center"> <TbIcons.TbLogout /> </span></Link>
          </CenterTooltip>
        </div>
      </div>
    </>
  );
};

export default Header;
