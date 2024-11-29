/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { MdCall } from "react-icons/md";
import { MdCallEnd } from "react-icons/md";
import { Table } from 'antd';

import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import MyTooltip from "../../commonModules/UI/MyTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import { endCallLog, fetchTasksForCallLog, startCallLog } from '../../../API/authCurd';
import { sortByDate, sortByString } from '../../../Utils/sortFunctions';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { taskStatus } from '../../../Utils/staticdata';

const CallHistory = (props) => {
  const [callHistory, setCallHistory] = useState([])
  const [columns, setColumns] = useState([])
  const [checkDoneTask, setCheckDoneTask] = useState(false)

  // Get Task function
  function getJobTaskList(id) {
    fetchTasksForCallLog(id).then((res) => {
      if (res.data?.tasks) { setCallHistory(res.data?.tasks) }
    }).catch((err) => {
      setCallHistory([])
    })
  }

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

  useEffect(() => {
    const statusFilter = taskStatus.map((item) => ({ text: item.name, value: item.id }));
    const columnDef = [
      {
        title: 'Task Name ',
        dataIndex: 'name',
        key: 'name',
        sorter: sortByString(["name"]),
      },
      {
        title: 'Assigned User(s)',
        dataIndex: 'assigned_user_details',
        key: 'assigned_user_details',
        render: (text, record) => {
          const assignedUsers = record.assigned_user_details;
          return (
            <div>
              {Array.isArray(assignedUsers) && assignedUsers.length > 0 ? (
                assignedUsers.map((user) => (
                  <div key={user.id}>{`${user.assigned_users.first_name} ${user.assigned_users.last_name || ''}`}</div>
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
        sorter: sortByString(["call_log_duration"]),
      },
      {
        title: 'Customer Review Task ',
        dataIndex: 'customer_review',
        key: 'customer_review',
        render: (text, record) => {
          return record?.customer_review == 1 ? "Yes" : "No"
        }
      },
      {
        title: 'Date Completed ',
        dataIndex: 'completion_date',
        key: 'completion_date',
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
        sorter: sortByString(["start_time"]),
        render: (text, record) => (
          <span>
            {record.start_time ? parseDateTimeString(record.start_time, 9) : null}
          </span>
        )
      },
      {
        title: 'Stop Time',
        dataIndex: 'end_time',
        key: 'end_time',
        sorter: sortByString(["end_time"]),
        render: (text, record) => (
          <span>
            {record.end_time ? parseDateTimeString(record.end_time, 9) : null}
          </span>
        )
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
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
        render: (_, record) => (
          <div >
            {(record.status == 2 && record.start_time) && <MyTooltip title="Stop Call">
              <TableBtn className="pass delete-action-btn" onclick={() => { stopButtonClickHandler(record) }}>
                <MdCallEnd />
              </TableBtn>
            </MyTooltip>}
          </div>
        ),
      },
    ];
    setColumns(columnDef)
    let isDone = callHistory.every(obj => obj.status == 3)
    setCheckDoneTask(isDone)
  }, [callHistory])

  return (
    <form noValidate>
      <div className='popups d-flex justify-content-center align-items-center call-log-popup'>
        <div className='addpopups'>
          <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
            <div>Call Entry time</div>

            <div className='myIcon' type='button' onClick={closeButtonHandler}>
              <IoIosCloseCircle style={{ width: '28px' }} />
            </div>
          </div>
          <div className='popBody p-3'>
            <div className='mb-3 d-flex'>
              {(callHistory.length == 0 || checkDoneTask) &&
                <Button type="button" className="start-call call-btn" onClick={() => { startButtonClickHandler() }}> <MdCall /> Start Call</Button>
              }
            </div>
            <Table
              columns={columns}
              dataSource={callHistory}
              pagination={{
                pageSize: 20
              }}
              scroll={{ y: `calc(100vh - 260px)` }}
              sticky={{
                offsetHeader: 0,
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default CallHistory;
