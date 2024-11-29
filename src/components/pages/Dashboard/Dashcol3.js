/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";

import "../../SCSS/dashboard.scss";
import Notification from "../../commonModules/NotificationComponent/Notification";
import { parseDateTimeString } from "../../../Utils/dateFormat";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";

const Dashcol3 = ({ dashboardData }) => {
  const [notificationContent, setNotificationContent] = useState([]);
  const [formattedNoti, setFormattedNoti] = useState([]);
  const { globalSearch, setGlobalSearch } = useContext(GlobalSearch)

  useEffect(() => {
    if (dashboardData) {
      setNotificationContent(dashboardData.notifications);
    }
  }, [dashboardData]);

  useEffect(() => {
    let formattedData = notificationContent
    if (globalSearch) {
      formattedData = formattedData.filter((item) => {
        return (item?.notification_title?.toLowerCase().includes(globalSearch.toLowerCase())) ||
          (item.description?.toLowerCase().includes(globalSearch.toLowerCase()))
      })
    }
    setFormattedNoti(formattedData)
  }, [notificationContent, globalSearch])

  return (
    <div className="innerHole">
      <div className="d-flex justify-content-between py-3 px-2">
        <div className="heading"><IoIosNotifications style={{ width: '30px', height: '30px', marginRight: '10px' }} />Notification</div>
        <Link to="/notifications">View all</Link>
      </div>
      <div className="overSizeFlow">
        {formattedNoti.map((notifi, index) => (
          <React.Fragment key={index}>
            <div className="noti-user-wrap">
              <div className="user-profile">PJ</div>
              <Notification
                description={notifi.description}
                created_at={parseDateTimeString(notifi.created_at, 1)}
                url={notifi.url}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Dashcol3;
