/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import * as FaIcons from "react-icons/fa6";
import CustTable from './CustTable';
import Button from '../../commonModules/UI/Button';
import '../../SCSS/customers.scss';
import AddCust from '../../popups/custpops/AddCust';
import { fetchCities, fetchClientStatus, fetchCountries, fetchPaymentTerms, fetchStates, fecthUsersWithType, fetchCustomerPagination, getAllCust } from '../../../API/authCurd';
import { calculatePageCount, checkPermission } from '../../../Utils/helpers';
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [popUps, setPopUps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [clientStatus, setClientStatus] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({});
  const [userDetail, setUserDetail] = useState([]);
  const [ibUsers, setIbUsers] = useState([]);
  const [formError, setFormError] = useState({})
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    let permission = checkPermission("Customers")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  const getPaymentTerms = () => {
    fetchPaymentTerms().then((res) => {
      if (res.data?.payment_terms) { setPaymentTerms(res.data?.payment_terms) }
    }).catch(() => { setPaymentTerms([]) })
  }

  const getClientStatus = () => {
    fetchClientStatus().then((res) => {
      if (res.data?.client_status) { setClientStatus(res.data?.client_status) }
    }).catch(() => { setClientStatus([]) })
  }

  const getCountries = () => {
    fetchCountries().then((res) => {
      if (res.data?.countries) { setCountries(res.data?.countries) }
    }).catch(() => { setCountries([]) })
  }

  const getStates = () => {
    return fetchStates().then((res) => {
      if (res.data?.states) { setStates(res.data?.states) }
    }).catch(() => { setStates([]) })
  }

  const getCities = () => {
    fetchCities().then((res) => {
      if (res.data?.cities) { setCities(res.data?.cities) }
    }).catch(() => { setCities([]) })
  }

  const getIbUsers = () => {
    // 2: IB users
    fecthUsersWithType(2).then((res) => {
      if (res.data?.users) { setIbUsers(res.data?.users) }
    }).catch(() => { setIbUsers([]) })
  }

  function getCustomersList() {
    setIsLoading(true)
    getAllCust().then((res) => {
      setIsLoading(false)
      setUserDetail(res.data.customers)
    }).catch(err => {
      setIsLoading(false)
    })
  }

  function getCustomersListPagination(perPage, pageNum) {
    setIsLoading(true)
    fetchCustomerPagination(perPage, pageNum).then((res) => {
      setIsLoading(false)
      setUserDetail(res.data?.customers?.data)
      let pageCount = calculatePageCount(res.data?.customers.total, res.data?.customers.per_page)
      setPaginationData({
        current_page: res.data?.customers.current_page,
        prev_page_url: res.data?.customers.prev_page_url,
        next_page_url: res.data?.customers.next_page_url,
        per_page: res.data?.customers.per_page,
        total: res.data?.customers.total,
        pagesCount: pageCount
      })
    }).catch(err => {
      setIsLoading(false)
      setUserDetail([])
    })
  }

  useEffect(() => {
    getCustomersList();
  }, [])

  const addClientButtonClickHandler = () => {
    setFormData({});
    setFormError({})
    setPopUps(!popUps);
    getClientStatus();
    getCountries();
    getStates().then(() => {
      setFormData((prev) => ({ ...prev, country: "1" }))
    });
    getCities();
    getIbUsers();
  }

  if (isLoading == "true") {
    return (
      <section>
        <p className='mt-5 pt-5 ps-3'>Loading....</p>
      </section>
    )
  }

  return (
    <div className="PageContent custpage">
      <div className='mx-3 mt-2 settingPage'>
        <div className="header px-3 py-1 d-flex justify-content-between">
          <div><span className='pe-2'>
            <FaIcons.FaBriefcase />
          </span>
            Customers </div>
          <Button className="headBtn" onClick={addClientButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Add Customer</Button>
        </div>
        <div className='h-100'>
          <CustTable
            userDetail={userDetail}
            getPaymentTerms={getPaymentTerms}
            getClientStatus={getClientStatus}
            getCountries={getCountries}
            getStates={getStates}
            getCities={getCities}
            paymentTerms={paymentTerms}
            clientStatus={clientStatus}
            countries={countries}
            states={states}
            cities={cities}
            getCustomersList={getCustomersList}
            isLoading={isLoading}
            ibUsers={ibUsers}
            getIbUsers={getIbUsers}
            paginationData={paginationData}
            setPaginationData={setPaginationData}
            getCustomersListPagination={getCustomersListPagination}
            setUserDetail={setUserDetail}
          />
        </div>
      </div>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <AddCust
          paymentTerms={paymentTerms}
          clientStatus={clientStatus}
          countries={countries}
          states={states}
          cities={cities}
          formData={formData}
          setFormData={setFormData}
          getCustomersList={getCustomersList}
          onClick={() => setPopUps(!popUps)}
          ibUsers={ibUsers}
          formError={formError}
          setFormError={setFormError}
          setPaginationData={setPaginationData}
          paginationData={paginationData}
          getCustomersListPagination={getCustomersListPagination}
        />
        <div className="blurBg"></div>
      </div>
    </div>
  )
}

export default Customers;
