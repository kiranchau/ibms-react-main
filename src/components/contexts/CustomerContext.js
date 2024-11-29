import React, { useState } from 'react'
import { createContext } from "react";

import { fecthUsersWithType, fetchCities, fetchClientStatus, fetchCountries, fetchPaymentTerms, fetchStates, getSingleCustomer } from '../../API/authCurd';

export const CustomerContext = createContext();

const CustomerContextProvider = ({ children }) => {
    const [openCustomerPopup, setCustomerOpenPopup] = useState(false);
    const [customerPaymentTerms, setCustomerPaymentTerms] = useState([]);
    const [customerStatus, setCustomerStatus] = useState([]);
    const [customerCountries, setCustomerCountries] = useState([]);
    const [customerStates, setCustomerStates] = useState([]);
    const [customerCities, setCustomerCities] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerIbUsers, setCustomerIbUsers] = useState([]);
    const [customerFormError, setCustomerFormError] = useState({});
    const [customerUserDetail, setCustomerUserDetail] = useState([]);
    const [customerCreditFormError, setCustomerCreditFormError] = useState({})
    const [customerCreditEditFormError, setCustomerCreditEditFormError] = useState({})
    const [customerCreditAddFormValue, setCustomerCreditAddFormValue] = useState({
        customer_id: "", credit_card_no: "", exp_month_year: "", cvv: "", card_type: "", name_on_card: "", address: ""
    })
    const [customerCreditEditFormValue, setCustomerCreditEditFormValue] = useState({})
    const [customerCreditIsEditMode, setCustomerCreditIsEditMode] = useState(false)
    const [customerUpdatedData, setCustomerUpdatedData] = useState(null)

    // Get Payment terms
    const getCustomerPaymentTerms = () => {
        fetchPaymentTerms().then((res) => {
            if (res.data?.payment_terms) { setCustomerPaymentTerms(res.data?.payment_terms) }
        }).catch(() => { setCustomerPaymentTerms([]) })
    }

    // Get clinet status
    const getCustomerClientStatus = () => {
        fetchClientStatus().then((res) => {
            if (res.data?.client_status) { setCustomerStatus(res.data?.client_status) }
        }).catch(() => { setCustomerStatus([]) })
    }

    // Get countries
    const getCustomerCountries = () => {
        fetchCountries().then((res) => {
            if (res.data?.countries) { setCustomerCountries(res.data?.countries) }
        }).catch(() => { setCustomerCountries([]) })
    }

    // Get states
    const getCustomerStates = () => {
        fetchStates().then((res) => {
            if (res.data?.states) { setCustomerStates(res.data?.states) }
        }).catch(() => { setCustomerStates([]) })
    }

    // Get cities
    const getCustomerCities = () => {
        fetchCities().then((res) => {
            if (res.data?.cities) { setCustomerCities(res.data?.cities) }
        }).catch(() => { setCustomerCities([]) })
    }

    // fetch IB users // 2: IB Users
    const getCustomerIbUsers = () => {
        fecthUsersWithType(2).then((res) => {
            if (res.data?.users) { setCustomerIbUsers(res.data?.users) }
        }).catch(() => { setCustomerIbUsers([]) })
    }

        // Get single job record 
        function getSingleCustomerData(id) {
            return getSingleCustomer(id).then((res) => {
                return res?.data
            }).catch(err => {
                return
            })
        }

    // Update customer cancel button handler
    const updateCustomerCancelClickHandler = () => {
        setCustomerOpenPopup(false)
        setSelectedCustomer(null)
        setCustomerUpdatedData(null)
    }

    // Open Customer edit popup
    const updateCustomerPopupOpen = (id) => {
        setCustomerOpenPopup(true);
        setCustomerFormError({});
        getSingleCustomerData(id).then((res) => {
            if (res?.customer) {
                setSelectedCustomer(res.customer)
            }
        }).catch(() => {
            setSelectedCustomer(null)
        })
        getCustomerCountries();
        getCustomerStates();
        getCustomerCities();
        getCustomerIbUsers();
        getCustomerClientStatus()
        setCustomerCreditFormError({})
        setCustomerCreditEditFormError({})
        setCustomerCreditAddFormValue({
            customer_id: "", credit_card_no: "", exp_month_year: "", cvv: "", card_type: "", name_on_card: "", address: ""
        })
        setCustomerCreditEditFormValue({})
        setCustomerCreditIsEditMode(false)
    }

    return (
        <CustomerContext.Provider value={{
            openCustomerPopup, setCustomerOpenPopup,
            customerPaymentTerms, setCustomerPaymentTerms,
            customerStatus, setCustomerStatus,
            customerCountries, setCustomerCountries,
            customerStates, setCustomerStates,
            customerCities, setCustomerCities,
            selectedCustomer, setSelectedCustomer,
            customerIbUsers, setCustomerIbUsers,
            customerFormError, setCustomerFormError,
            customerUserDetail, setCustomerUserDetail,
            customerCreditFormError, setCustomerCreditFormError,
            customerCreditEditFormError, setCustomerCreditEditFormError,
            customerCreditAddFormValue, setCustomerCreditAddFormValue,
            customerCreditEditFormValue, setCustomerCreditEditFormValue,
            customerCreditIsEditMode, setCustomerCreditIsEditMode,
            customerUpdatedData, setCustomerUpdatedData,
            getCustomerPaymentTerms,
            getCustomerClientStatus,
            getCustomerCountries,
            getCustomerStates,
            getCustomerCities,
            getCustomerIbUsers,
            updateCustomerCancelClickHandler,
            updateCustomerPopupOpen
        }}>
            {children}
        </CustomerContext.Provider>
    )
}

export default CustomerContextProvider