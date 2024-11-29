import React, { useState } from 'react'
import { createContext } from "react";

import { fecthUsersWithType, fetchJobCodes, fetchPaymentTerms, fetchServiceTypes, getCust, getSingleJob } from '../../API/authCurd';

export const JobContext = createContext();

const JobContextProvider = ({ children }) => {
    const [jobOpenPopup, setJobOpenPopup] = useState(false);
    const [jobSectionCodes, setJobSectionCodes] = useState([]);
    const [JobPaymentTerms, setJobPaymentTerms] = useState([]);
    const [JobCustomerList, setJobCustomerList] = useState([]);
    const [selectedJobForSection, setSelectedJobForSection] = useState([]);
    const [JobResponsibleUser, setJobResponsibleUser] = useState([]);
    const [JobFormError, setJobFormError] = useState({})
    const [jobServiceTypes, setJobServiceTypes] = useState([]);
    const [jobSuccessMessage, setJobSuccessMessage] = useState("");

    const getJobSectionCodes = () => {
        fetchJobCodes().then((res) => {
            if (res.data?.job_codes) { setJobSectionCodes(res.data?.job_codes) }
        }).catch(() => { setJobSectionCodes([]) })
    }

    const getJobPaymentTerms = () => {
        fetchPaymentTerms().then((res) => {
            if (res.data?.payment_terms) { setJobPaymentTerms(res.data?.payment_terms) }
        }).catch(() => { setJobPaymentTerms([]) })
    }

    const getJobServiceTypes = () => {
        fetchServiceTypes().then((res) => {
            if (res.data?.service_types) { setJobServiceTypes(res.data?.service_types) }
        }).catch(() => { setJobServiceTypes([]) })
    }

    const getJobResponsibleUsers = () => {
        fecthUsersWithType(2).then((res) => {
            if (res.data?.users) { setJobResponsibleUser(res.data?.users) }
        }).catch(() => { setJobResponsibleUser([]) })
    }

    function getJobCustomersList() {
        getCust().then((res) => {
            setJobCustomerList(res.data.customers)
        }).catch(err => {
            setJobCustomerList([])
        })
    }

    // Get single job record 
    function getSingleJobData(id) {
        return getSingleJob(id).then((res) => {
            return res?.data
        }).catch(err => {
            return
        })
    }

    // Update Job cancel button handler
    const updateJobCancelClickHandler = (record) => {
        setJobOpenPopup(false)
        setSelectedJobForSection([])
        setJobFormError({})
        setJobSuccessMessage("")
    }

    // Open Job edit popup
    const updateJobPopupOpen = (id) => {
        setJobFormError({})
        setJobOpenPopup(true)
        getSingleJobData(id).then((res) => {
            if (res?.job) {
                setSelectedJobForSection(res.job)
            }
        }).catch(() => {
            setSelectedJobForSection([])
        })
        getJobCustomersList()
        getJobResponsibleUsers()
        getJobSectionCodes()
    }

    return (
        <JobContext.Provider value={{
            jobOpenPopup, setJobOpenPopup, jobSectionCodes, setJobSectionCodes, JobPaymentTerms, setJobPaymentTerms,
            JobCustomerList, setJobCustomerList, selectedJobForSection, setSelectedJobForSection, JobResponsibleUser, setJobResponsibleUser,
            JobFormError, setJobFormError, jobServiceTypes, setJobServiceTypes, getJobSectionCodes, getJobPaymentTerms,
            getJobServiceTypes, getJobResponsibleUsers, getJobCustomersList, updateJobCancelClickHandler, updateJobPopupOpen,
            jobSuccessMessage, setJobSuccessMessage
        }}>
            {children}
        </JobContext.Provider>
    )
}

export default JobContextProvider