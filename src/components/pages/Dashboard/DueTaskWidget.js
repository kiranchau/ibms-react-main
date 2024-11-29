/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/alt-text */
import React, { useContext, useEffect, useState } from "react";
import { isOverdue } from "../../../Utils/dateFormat";
import { TaskContext } from "../../contexts/TaskContext";
import TaskUpdate from "../../popups/taskpops/TaskUpdate";
import CallEntryPopup from "../../popups/taskpops/CallEntryPopup";
import { fecthUsersWithType, fetchServiceTypes, getCust, getSingleTask } from "../../../API/authCurd";
import { Table, Tooltip } from 'antd';
import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
import { BsExclamationCircleFill } from "react-icons/bs"

export const DueTaskWidget = ({ dashboardData, getDashboardData }) => {
  const [toggle, setToggle] = useState(1)
  const [overdueTasks, setOverdueTasks] = useState([])
  const [overdueFiveDaysTasks, setOverdueFiveDaysTasks] = useState([])
  const {
    openTaskPopup, TaskServiceTypes, TaskPaymentTerms, taskCustomerList, taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError,
    setTaskFormError, taskUpdatedtaskData, setTaskUpdatetaskdData, taskIsCallEntry, onTaskCancelBtnHandler, updateTaskPopupOpen, 
    taskSuccessMessage, setTaskSuccessMessage
  } = useContext(TaskContext)
  const [CallEnterypopUps, setCallEnterypopUps] = useState(false);
  const [callEntryIbUsers, setCallEntryIbUsers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [taskUpdateDetail, settaskUpdateDetail] = useState([]);
  const [formError, setFormError] = useState({})
  const [updatedtaskData, setUpdatetaskdData] = useState(null)
  const [isCallEntry, setIsCallEntry] = useState(false)
  const [columns, setColumns] = useState([])
  const [columnsForFiveDay, setColumnsForFiveDay] = useState([])

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
    })
  }

  function updateToggle(id) {
    setToggle(id)
  }

  useEffect(() => {
    if (dashboardData) {
      setOverdueTasks(dashboardData?.overdue_tasks ? dashboardData.overdue_tasks : "");
      setOverdueFiveDaysTasks(dashboardData?.task_due__5_days ? dashboardData.task_due__5_days : "");
    }
  }, [dashboardData])

  const getIbUsers = () => {
    // 2: IB users
    fecthUsersWithType(2).then((res) => {
      if (res.data?.users) { setCallEntryIbUsers(res.data?.users) }
    }).catch(() => { setCallEntryIbUsers([]) })
  }

  // Get single task data by ID
  function getSingleTaskData(id) {
    return getSingleTask(id).then((res) => {
      return res.data
    }).catch(() => {
      return
    })
  }

  const onTaskClickHandler = (e, record) => {
    if (record.name == "Call Time Entry") {
      setIsCallEntry(true)
      getIbUsers()
      getServiceTypes()
      getCustomersList()
      getSingleTaskData(record.id).then((res) => {
        if (res?.Task) {
          settaskUpdateDetail(res.Task)
        }
      }).catch(() => {
        settaskUpdateDetail([])
      })
      setCallEnterypopUps(true);
    } else {
      updateTaskPopupOpen(record?.name, record?.id)
    }
  }

  const closeCallEntryPopup = () => {
    setCallEnterypopUps(false);
    setFormError({})
    setUpdatetaskdData({})
    settaskUpdateDetail(null)
  }

  useEffect(() => {
    let columnsDef = [
      {
        title: "Task Name",
        dataIndex: "name",
        key: "taskName",
        width: 190,
        sorter: sortByString(["name"]),
        render: (text, record) => {
          return record?.name ? <div>{isOverdue(record?.desired_due_date) && <Tooltip placement="top" title={"Task Overdue"}><span><BsExclamationCircleFill className="redirect-icon text-danger" /></span></Tooltip>} {record?.name}</div> : null
        }
      },
      {
        title: "Due Date",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",
        width: 130,
        sorter: sortByDate(["desired_due_date"]),
        render: (text, record) => {
          return record?.desired_due_date ? <div>{record?.desired_due_date}</div> : null
        }
      },
    ]
    setColumns(columnsDef)
  }, [overdueTasks])

  useEffect(() => {
    let columnsDef = [
      {
        title: "Task Name",
        dataIndex: "name",
        key: "taskName",
        width: 190,
        sorter: sortByString(["name"]),
        render: (text, record) => {
          return record?.name ? <div>{record?.name}</div> : null
        }
      },
      {
        title: "Due Date",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",
        width: 130,
        sorter: sortByDate(["desired_due_date"]),
        render: (text, record) => {
          return record?.desired_due_date ? <div>{record?.desired_due_date}</div> : null
        }
      },
    ]
    setColumnsForFiveDay(columnsDef)
  }, [overdueFiveDaysTasks])

  const onRowClick = (e, record) => {
    e.preventDefault()
    onTaskClickHandler(e, record)
  }

  return (
    <>
      <div className="taskWidget-wrap ">
        <div className=" billpage px-0">
          <div className='billTab'>
            <div type='button'
              className={toggle === 1 ? "box active" : 'box'}
              onClick={() => updateToggle(1)}>
              <div className="headTitle"> Overdue Tasks</div>

            </div>
            <div type='button'
              className={toggle === 2 ? " box active" : 'box'}
              onClick={() => updateToggle(2)}>
              <div className="headTitle">Tasks Due in 5 Days</div>
            </div>

          </div>
          <div className="card">
            <div className={toggle === 1 ? "showContent" : 'content'}>
              <Table
                columns={columns}
                dataSource={overdueTasks}
                sticky={{
                  offsetHeader: 0,
                }}
                pagination={{
                  showSizeChanger: false
                }}
                onRow={(record, rowIndex) => ({
                  onClick: (e) => { onRowClick(e, record) }
                })}
              />
            </div>
            <div className={toggle === 2 ? "showContent" : 'content'}>
              <Table
                columns={columnsForFiveDay}
                dataSource={overdueFiveDaysTasks}
                sticky={{
                  offsetHeader: 0,
                }}
                pagination={{
                  showSizeChanger: false
                }}
                onRow={(record, rowIndex) => ({
                  onClick: (e) => { onRowClick(e, record) }
                })}
              />
            </div>
          </div>
        </div>
      </div>
      {openTaskPopup && <div className={`mainpopups`}>
        <TaskUpdate
          serviceTypes={TaskServiceTypes}
          paymentTerms={TaskPaymentTerms}
          customerList={taskCustomerList}
          getTaskList={getDashboardData}
          taskUpdateDetail={taskSectionUpdateDetail}
          onClick={onTaskCancelBtnHandler}
          formError={taskFormError}
          setFormError={setTaskFormError}
          paginationData={{}}
          getTaskListPagination={getDashboardData}
          updatedtaskData={taskUpdatedtaskData}
          setUpdatetaskdData={setTaskUpdatetaskdData}
          settaskUpdateDetail={settaskSectionUpdateDetail}
          isCallEntry={taskIsCallEntry}
          filters={{}}
          successMessage={taskSuccessMessage}
          setSuccessMessage={setTaskSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>}
      <div className={`${CallEnterypopUps ? "mainpopups" : "nomainpopups"}`}>
        <CallEntryPopup
          serviceTypes={serviceTypes}
          customerList={customerList}
          getTaskList={getDashboardData}
          taskUpdateDetail={taskUpdateDetail}
          onClick={closeCallEntryPopup}
          formError={formError}
          setFormError={setFormError}
          paginationData={{}}
          getTaskListPagination={getDashboardData}
          updatedtaskData={updatedtaskData}
          setUpdatetaskdData={setUpdatetaskdData}
          settaskUpdateDetail={settaskUpdateDetail}
          isCallEntry={isCallEntry}
          filters={{}}
          ibUsers={callEntryIbUsers}
        />
        <div className="blurBg"></div>
      </div>
    </>
  )
}
