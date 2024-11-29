/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import { Tooltip, Spin } from "antd";
import { BiSolidLock } from "react-icons/bi";
import { BiSolidLockOpen } from "react-icons/bi";
import { LoadingOutlined } from '@ant-design/icons';

import { updateTaskBeingWorkedOn } from '../../../API/authCurd'

const TaskBeingWorkedOn = ({ record, paginationData, filters, getTaskListPagination }) => {
    const [taskBeingLoader, setTaskBeingLoader] = useState(false)
    let userId = localStorage.getItem('id')
    let userType = localStorage.getItem('usertype')

    // Task Being worked on update method
    function updateTaskBeingFlag(id, data) {
        setTaskBeingLoader(true)
        updateTaskBeingWorkedOn(id, data).then(() => {
            // getTaskList(false)
            getTaskListPagination(paginationData.per_page, paginationData.current_page, filters, false).then(() => {
                setTaskBeingLoader(false)
            })
        }).catch((err) => {
            setTaskBeingLoader(false)
            console.log("updateTaskBeingWorkedOn: ", err)
        })
    }

    // Task being worked lock Click handler
    const taskBeingLockClickHandler = (record) => {
        if (record?.working_user_id) {
            let data = { lock: 0 }
            updateTaskBeingFlag(record.id, data)
        } else {
            let data = { lock: 1 }
            updateTaskBeingFlag(record.id, data)
        }
    }

    return (<>
        {taskBeingLoader  ? <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 18, color: '#2c0036' }} spin />} /> :
            <><button disabled={!((userType == 1) || (record?.working_user_id == null) || (userId == record?.working_user_id))} className='border-0 bg-transparent' onClick={() => taskBeingLockClickHandler(record)}>{record?.working_user_id ?
                <Tooltip placement="topLeft" title={`Task is locked by ${record.working_user_name}`}>
                    <div className="lock-unlock-wrap unlock-wrap">
                        <BiSolidLock />
                    </div>
                </Tooltip> :
                <div className="lock-unlock-wrap lock-wrap"><BiSolidLockOpen />
                </div>}
            </button>
            </>}
    </>)
}

export default TaskBeingWorkedOn