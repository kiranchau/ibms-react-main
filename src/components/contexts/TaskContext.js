/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import { createContext } from "react";

import { fetchServiceTypes, getCust, getSingleTask } from '../../API/authCurd';

export const TaskContext = createContext();

const TaskContextProvider = ({ children }) => {
    const [openTaskPopup, setTaskOpenPopup] = useState(false);
    const [TaskServiceTypes, setTaskServiceTypes] = useState([]);
    const [TaskPaymentTerms, setTaskPaymentTerms] = useState([]);
    const [taskCustomerList, setTaskCustomerList] = useState([]);
    const [taskSectionUpdateDetail, settaskSectionUpdateDetail] = useState([]);
    const [taskFormError, setTaskFormError] = useState({})
    const [taskUpdatedtaskData, setTaskUpdatetaskdData] = useState(null)
    const [taskIsCallEntry, setTaskIsCallEntry] = useState(false)
    const [taskSuccessMessage, setTaskSuccessMessage] = useState("");

    const getServiceTypes = () => {
        fetchServiceTypes().then((res) => {
            if (res.data?.service_types) { setTaskServiceTypes(res.data?.service_types) }
        }).catch(() => { setTaskServiceTypes([]) })
    }

    function getCustomersList() {
        getCust().then((res) => {
            setTaskCustomerList(res.data.customers)
        }).catch(err => {
            setTaskCustomerList([])
        })
    }

    // Get single task data by ID
    function getSingleTaskData(id) {
        return getSingleTask(id).then((res) => {
            return res.data
        }).catch(() => {
            return
        })
    }

    // Update Task cancel button handle
    const onTaskCancelBtnHandler = () => {
        setTaskOpenPopup(false);
        setTaskUpdatetaskdData({})
        settaskSectionUpdateDetail(null)
        setTaskSuccessMessage("")
    }

    // Open Task edit popup
    const updateTaskPopupOpen = (name, id) => {
        if (name == "Call Time Entry") {
            setTaskIsCallEntry(true)
        } else {
            setTaskIsCallEntry(false)
        }
        setTaskFormError({})
        getSingleTaskData(id).then((res) => {
            if (res?.Task) {
                settaskSectionUpdateDetail(res.Task)
            }
        }).catch(() => {
            settaskSectionUpdateDetail([])
        })
        setTaskOpenPopup(true);
        getServiceTypes();
        getCustomersList();
    }

    return (
        <TaskContext.Provider value={{
            openTaskPopup, setTaskOpenPopup, TaskServiceTypes, setTaskServiceTypes, TaskPaymentTerms, setTaskPaymentTerms, taskCustomerList, setTaskCustomerList,
            taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError, setTaskFormError, taskUpdatedtaskData, setTaskUpdatetaskdData,
            taskIsCallEntry, setTaskIsCallEntry, getServiceTypes, getCustomersList, onTaskCancelBtnHandler, updateTaskPopupOpen, taskSuccessMessage, setTaskSuccessMessage
        }}>
            {children}
        </TaskContext.Provider>
    )
}

export default TaskContextProvider
