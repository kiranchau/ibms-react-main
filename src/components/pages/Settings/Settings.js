/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import * as FaIcons from 'react-icons/fa';
import '../../SCSS/settings.scss'
import JobsCodes from './JobsCodes';
import ForumsTopicCategories from './ForumsTopicCategories';
import ClientStatuses from './ClientStatuses';
import Departments from './Departments';
import ServiceType from './ServiceType';
import { useNavigate } from "react-router-dom";
import { checkPermission } from '../../../Utils/helpers';
import { BsDatabaseFillGear } from "react-icons/bs";
const Settings = () => {
  const [toggleState, setToggleState] = useState(1);
  const navigate = useNavigate()

  useEffect(() => {
    let permission = checkPermission("Settings")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  const toggleTab = (index) => {
    setToggleState(index)
  }

  const settingMenu = [
    { id: 1, title: "Job Codes", },
    { id: 2, title: "Client Statuses", },
    { id: 3, title: "Departments", },
    { id: 4, title: "Forum Topic Categories", },
    { id: 6, title: "Service Types", },
  ]

  const settingContent = [
    { id: 1, Content: <JobsCodes /> },
    { id: 2, Content: <ClientStatuses />, },
    { id: 3, Content: <Departments />, },
    { id: 4, Content: <ForumsTopicCategories />, },
    { id: 6, Content: <ServiceType />, },
  ]

  return (
    <>
      <div className='PageContent '>
        <div className='mx-3 mt-2 settingPage'>
          <div className="header px-3 py-1">
            <span className='pe-2'>
            <BsDatabaseFillGear />
            </span>
            Settings
          </div>
          <div className='tab-container h-100'>
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
            <div className="content-tabs">
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

export default Settings;
