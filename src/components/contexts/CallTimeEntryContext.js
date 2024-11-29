/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import { createContext } from "react";

import { fecthUsersWithType, fetchServiceTypes, getCust, getSingleTask } from '../../API/authCurd';

export const CallTimeEntryContext = createContext();

const CallTimeEntryContextProvider = ({ children }) => {
    const [openCallEntryPopup, setOpenCallEntryPopup] = useState(false);
    const [callEntryServiceTypes, setCallEntryServiceTypes] = useState([]);
    const [callEntryPaymentTerms, setCallEntryPaymentTerms] = useState([]);
    const [callEntryCustomerList, setCallEntryCustomerList] = useState([]);
    const [callEntryUpdateDetail, setCallEntryUpdateDetail] = useState([]);
    const [callEntryFormError, setCallEntryFormError] = useState({})
    const [updatedCallEntryData, setUpdateCallEntryData] = useState(null)
    const [isCallEntryEdit, setIsCallEntryEdit] = useState(false)
    const [callEntryIbUsers, setCallEntryIbUsers] = useState([])
    const [callSuccessMessage, setCallSuccessMessage] = useState("");

    // Service types
    const getCallEntryServiceTypes = () => {
        fetchServiceTypes().then((res) => {
            if (res.data?.service_types) { setCallEntryServiceTypes(res.data?.service_types) }
        }).catch(() => { setCallEntryServiceTypes([]) })
    }

    // Customer list
    function getCallEntryCustomersList() {
        getCust().then((res) => {
            setCallEntryCustomerList(res.data.customers)
        }).catch(err => {
            setCallEntryCustomerList([])
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

    const getCallEntryIbUsers = () => {
        // 2: IB users
        fecthUsersWithType(2).then((res) => {
            if (res.data?.users) { setCallEntryIbUsers(res.data?.users) }
        }).catch(() => { setCallEntryIbUsers([]) })
    }

    // Update Task cancel button handle
    const onCallEntryCancelBtnHandler = () => {
        setOpenCallEntryPopup(false);
        setCallEntryUpdateDetail({})
        setUpdateCallEntryData(null)
        setCallSuccessMessage("")
    }

    // Open Task edit popup
    const updateCallEntryPopupOpen = (data) => {
        if (data.name == "Call Time Entry") {
            setIsCallEntryEdit(true)
            getCallEntryIbUsers()
            getSingleTaskData(data.id).then((res) => {
                if (res?.Task) {
                    setCallEntryUpdateDetail(res.Task)
                }
            }).catch(() => {
                setCallEntryUpdateDetail([])
            })
            setOpenCallEntryPopup(true);
            setCallEntryFormError({})
            getCallEntryCustomersList();
        }
    }

    return (
        <CallTimeEntryContext.Provider value={{
            openCallEntryPopup, setOpenCallEntryPopup, callEntryServiceTypes, setCallEntryServiceTypes, callEntryPaymentTerms, setCallEntryPaymentTerms, callEntryCustomerList, setCallEntryCustomerList,
            callEntryUpdateDetail, setCallEntryUpdateDetail, callEntryFormError, setCallEntryFormError, updatedCallEntryData, setUpdateCallEntryData,
            getCallEntryServiceTypes, getCallEntryCustomersList, onCallEntryCancelBtnHandler, updateCallEntryPopupOpen, isCallEntryEdit, getCallEntryIbUsers, callEntryIbUsers, setCallEntryIbUsers, callSuccessMessage, setCallSuccessMessage
        }}>
            {children}
        </CallTimeEntryContext.Provider>
    )
}

export default CallTimeEntryContextProvider
