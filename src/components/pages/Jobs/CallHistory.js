/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { MdCall } from "react-icons/md";
import { MdCallEnd } from "react-icons/md";
import { Table, Tooltip } from 'antd';

import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import MyTooltip from "../../commonModules/UI/MyTooltip";
import { endCallLog, fecthUsersWithType, fetchTasksForCallLog, getCust, getSingleTask, startCallLog } from '../../../API/authCurd';
import { sortByDate, sortByString } from '../../../Utils/sortFunctions';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { taskStatus } from '../../../Utils/staticdata';
import TableBtn from '../../commonModules/UI/TableBtn';
import { BiSolidEdit } from 'react-icons/bi';
import CallEntryPopup from '../../popups/taskpops/CallEntryPopup';
import JobContextProvider from '../../contexts/JobContext';
import { startsWithMinus } from '../../../Utils/helpers';
import { LoadingOutlined } from '@ant-design/icons';

const CallHistory = (props) => {
  const [callHistory, setCallHistory] = useState([])
  const [columns, setColumns] = useState([])
  const [checkDoneTask, setCheckDoneTask] = useState(false)
  const [callAlreadyPresent, setCallAlreadyPresent] = useState(false)
  const [CallEnterypopUps, setCallEnterypopUps] = useState(false);
  const [callEntryIbUsers, setCallEntryIbUsers] = useState([]);
  const [isCallEntry, setIsCallEntry] = useState(false)
  const [formError, setFormError] = useState({})
  const [taskUpdateDetail, settaskUpdateDetail] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [updatedtaskData, setUpdatetaskdData] = useState(null)
  const [remainingHours, setRemainingHours] = useState("")
  const [showRemainingHourMessage, setShowRemainingHourMessage] = useState("") 
  const [isLoading, setIsLoading] = useState(false);
  const [callSuccessMessage, setCallSuccessMessage] = useState("");

  // Get Task function
  function getJobTaskList(id, isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    fetchTasksForCallLog(id).then((res) => {
      if (res.data?.remaining_hours) {
        setRemainingHours(res.data?.remaining_hours)
      }else{
        setRemainingHours(0)
      }
      if (res.data?.tasks) { setCallHistory(res.data?.tasks) }
      setIsLoading(false)
    }).catch((err) => {
      setCallHistory([])
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!(remainingHours == "0:00" || remainingHours == "0" || remainingHours == "00:00" || remainingHours == null || startsWithMinus(remainingHours))) {
      setShowRemainingHourMessage("")
    } else {
      setShowRemainingHourMessage("Warning: No Hours Remaining")
    }
  }, [remainingHours])

  // Start Call function
  function startCall(data) {
    startCallLog(data).then(() => {
      getJobTaskList(props.selectedJobForCallLog?.id)
    }).catch((err) => {
      console.log("startCall-err: ", err)
    })
  }

  // Stop Call function
  function stopCall(id) {
    endCallLog(id).then(() => {
      getJobTaskList(props.selectedJobForCallLog?.id)
    }).catch((err) => {
      console.log("stopCall-err: ", err)
    })
  }

  // Delete function
  function deleteCallRecord(id) {

  }

  // Start Button click handler
  const startButtonClickHandler = () => {
    let data = {
      job_id: props.selectedJobForCallLog?.id
    }
    startCall(data)
  }

  // Stop Button click handler
  const stopButtonClickHandler = (record) => {
    stopCall(record.id)
  }

  // Stop Button click handler
  const deleteButtonClickHandler = (record) => {
    deleteCallRecord(record.id)
  }

  // Close button handler
  const closeButtonHandler = () => {
    setShowRemainingHourMessage("")
    setRemainingHours("")
    setCallHistory([])
    props.onClick()
  }

  useEffect(() => {
    if (props?.selectedJobForCallLog) {
      getJobTaskList(props?.selectedJobForCallLog?.id)
    } else {
      setCallHistory([])
    }
  }, [props.selectedJobForCallLog])

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

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
    })
  }

  const updatePopUps = (data) => {
    if (data.name == "Call Time Entry") {
      setIsCallEntry(true)
      getIbUsers()
      getSingleTaskData(data.id).then((res) => {
        if (res?.Task) {
          settaskUpdateDetail(res.Task)
        }
      }).catch(() => {
        settaskUpdateDetail([])
      })
      setCallEnterypopUps(true);
      setFormError({})
      getCustomersList();
    }
    setCallSuccessMessage("")
  }

  const closeCallEntryPopup = () =>{
    setCallEnterypopUps(false);
    setFormError({})
    settaskUpdateDetail([])
  }

  useEffect(() => {
    const statusFilter = taskStatus.map((item) => ({ text: item.name, value: item.id }));
    const columnDef = [
      {
        title: 'Task Name ',
        dataIndex: 'name',
        key: 'name',
        width:120,
        sorter: sortByString(["name"]),
      },
      {
        title: 'Assigned User(s)',
        dataIndex: 'assigned_user_details',
        key: 'assigned_user_details',
        width:150,
        render: (text, record) => {
          const assignedUsers = record.assigned_user_details;
          return (
            <div>
              {Array.isArray(assignedUsers) && assignedUsers.length > 0 ? (
                assignedUsers.map((user) => (
                  <div key={user.id}>{`${user?.assigned_users?.first_name ? user?.assigned_users?.first_name : ""} ${user?.assigned_users?.last_name ? user?.assigned_users?.last_name : ''}`}</div>
                ))
              ) : (
                <div></div>
              )}
            </div>
          );
        }
      },
      {
        title: 'Duration',
        dataIndex: 'call_log_duration',
        key: 'call_log_duration',
        width:120,
        sorter: sortByString(["call_log_duration"]),
      },
      {
        title: 'Customer Review Task ',
        dataIndex: 'customer_review',
        key: 'customer_review',
        width:180,
        render: (text, record) => {
          return record?.customer_review == 1 ? "Yes" : "No"
        }
      },
      {
        title: 'Due Date',
        dataIndex: 'desired_due_date',
        key: 'desired_due_date',
        sorter: sortByDate(["desired_due_date"]),
        width:120,
        render: (text, record) => (
          <span>
            {record.desired_due_date ? parseDateTimeString(record.desired_due_date, 6) : null}
          </span>
        )
      },
      {
        title: 'Date Completed ',
        dataIndex: 'completion_date',
        key: 'completion_date',
        width:160,
        sorter: sortByDate(["completion_date"]),
        render: (text, record) => (
          <span>
            {record.completion_date ? parseDateTimeString(record.completion_date, 6) : null}
          </span>
        )
      },
      {
        title: 'Start Time',
        dataIndex: 'start_time',
        key: 'start_time',
        width:120,
        sorter: sortByString(["start_time"]),
        render: (text, record) => (
          <span>
            {record.start_time ? parseDateTimeString(record.start_time, 10) : null}
          </span>
        )
      },
      {
        title: 'Stop Time',
        dataIndex: 'end_time',
        key: 'end_time',
        width:120,
        sorter: sortByString(["end_time"]),
        render: (text, record) => (
          <span>
            {record.end_time ? parseDateTimeString(record.end_time, 10) : null}
          </span>
        )
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        width:120,
        filters: statusFilter,
        onFilter: (value, record) => {
          return record.status == value;
        },
        render: (_, record) => {
          let data = taskStatus.find((s) => s.id == record.status)
          return data ? data.name : null
        }
      },
      {
        title: 'Action',
        key: 'action',
        width:120,
        render: (_, record) => (
          <div >
            {(record.status == 2 && record.start_time) && <MyTooltip title="Stop Call">
                <Button type="button" className="end-call call-btn" onClick={() => { stopButtonClickHandler(record) }}>  <MdCallEnd /> End Call</Button>
            </MyTooltip>}

            {record.status == 3 && <MyTooltip title="Edit Task">
                <TableBtn className="activeLog update-task-btn" onclick={() => updatePopUps(record)}>
                  <BiSolidEdit />
                </TableBtn>
              </MyTooltip>}
          </div>
        ),
      },
    ];
    setColumns(columnDef)
    let isDone = callHistory.every(obj => obj.status == 3)
    setCheckDoneTask(isDone)

    let isCallAlreadyStarted = callHistory.some(obj => obj.status == 2 && obj.name == "Call Time Entry")
    setCallAlreadyPresent(isCallAlreadyStarted)
  }, [callHistory])

  return (
    <>
    <form noValidate>
      <div className='popups d-flex justify-content-center align-items-center call-log-popup'>
        <div className='addpopups'>
          <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
            <div>Call Time Entry</div>

            <div className='myIcon' type='button' onClick={closeButtonHandler}>
              <IoIosCloseCircle style={{ width: '28px' }} />
            </div>
          </div>
          <div className='popBody p-3'>
              <div className='mb-3 start-call-wrap'>
                {(!callAlreadyPresent) && <Button disabled={(remainingHours == "0:00" || remainingHours == "0" || remainingHours == "00:00" || remainingHours == null || startsWithMinus(remainingHours))} type="button" className="start-call call-btn" onClick={() => { startButtonClickHandler() }}> <MdCall /> Start Call</Button>}
                {((!callAlreadyPresent) && showRemainingHourMessage) && <p>{showRemainingHourMessage}</p>}
              </div>
            <Table
              columns={columns}
              dataSource={callHistory}
              pagination={{
                pageSize: 20
              }}
              scroll={{ y: `calc(100vh - 300px)` }}
              sticky={{
                offsetHeader: 0,
              }}
                loading={{
                  indicator:<LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />,
                  spinning: isLoading
                }}
            />
          </div>
        </div>
      </div>
    </form>
      {CallEnterypopUps && <div className={`mainpopups`}>
      <JobContextProvider>
        <CallEntryPopup
          serviceTypes={serviceTypes}
          paymentTerms={paymentTerms}
          customerList={customerList}
          getTaskList={getJobTaskList}
          taskUpdateDetail={taskUpdateDetail}
          onClick={closeCallEntryPopup}
          formError={formError}
          setFormError={setFormError}
          getTaskListPagination={getJobTaskList}
          updatedtaskData={updatedtaskData}
          paginationData={{}}
          setUpdatetaskdData={setUpdatetaskdData}
          settaskUpdateDetail={settaskUpdateDetail}
          isCallEntry={isCallEntry}
          ibUsers={callEntryIbUsers}
          isFromHistory={true}
          filters={{}}
          successMessage={callSuccessMessage}
          setSuccessMessage={setCallSuccessMessage}
        />
        <div className="blurBg"></div>
        </JobContextProvider>
      </div>}
    </>
  );
}

export default CallHistory;
