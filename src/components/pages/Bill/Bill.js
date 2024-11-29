/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import BillItems from "./BillItems";
import '../../SCSS/bill.scss';
import CustBill from "./CustBill";
import Payables from "./Payables";
import Payments from "./Payments";
import { fetchCustomerBillItems, fetchCustomerBillItemsPagination } from "../../../API/authCurd";
import { calculatePageCount, checkPermission } from "../../../Utils/helpers";
import { useNavigate } from "react-router-dom";
import CustomerContextProvider from "../../contexts/CustomerContext";
import JobContextProvider from "../../contexts/JobContext";
import TaskContextProvider from "../../contexts/TaskContext";
import CallTimeEntryContextProvider from "../../contexts/CallTimeEntryContext";

const Bill = () => {
  const [toggle, setToggle] = useState(1)
  const [customerbillItems, setCustomerBillItems] = useState([]);
  const [customerBillPaginationData, setCustomerBillPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const navigate = useNavigate()
  const [custBillIsLoading, setCustBillIsLoading] = useState(true);

  useEffect(() => {
    let permission = checkPermission("Billings")
    if (!permission) {
      navigate("/dashboard")
    }
  }, [])

  // Get customer bill items data with pagination
  function getCustomerBillItemsListPagination(perPage, pageNum) {
    fetchCustomerBillItemsPagination(perPage, pageNum).then((res) => {
      setCustomerBillItems(res.data?.billable_items?.data)
      let pageCount = calculatePageCount(res.data?.billable_items.total, res.data?.billable_items.per_page)
      setCustomerBillPaginationData({
        current_page: res.data?.billable_items.current_page,
        prev_page_url: res.data?.billable_items.prev_page_url,
        next_page_url: res.data?.billable_items.next_page_url,
        per_page: res.data?.billable_items.per_page,
        total: res.data?.billable_items.total,
        pagesCount: pageCount
      })
    }).catch(err => {
      setCustomerBillItems([])
    })
  }
  // Get customer bill items data with pagination
  function getCustomerBillItemsList(isLoader = true) {
    if (isLoader) {
      setCustBillIsLoading(true)
    }
    fetchCustomerBillItems(0).then((res) => {
      setCustBillIsLoading(false)
      setCustomerBillItems(res.data?.billable_items)
    }).catch(err => {
      setCustBillIsLoading(false)
      setCustomerBillItems([])
    })
  }

  function updateToggle(id) {
    setToggle(id)
  }
  return (
    <>
      <div className="PageContent billpage pb-0">
        <div className='billTab'>
          <div type='button'
            className={toggle === 1 ? "box active" : 'box'}
            onClick={() => updateToggle(1)}>
            <div className="headTitle"> Billable Items</div>

          </div>
          <div type='button'
            className={toggle === 2 ? " box active" : 'box'}
            onClick={() => updateToggle(2)}>
            <div className="headTitle">Customer Bills</div>

          </div>
          {/* <div type='button'
            className={toggle === 3 ? "box active" : 'box'}
            onClick={() => updateToggle(3)}>
            <div className="headTitle">Payables</div>
          </div>
          <div type='button'
            className={toggle === 4 ? "box active" : 'box'}
            onClick={() => updateToggle(4)}>
            <div className="headTitle">Payments</div>
          </div> */}

        </div>
        <div className={toggle === 1 ? "showContent" : 'content'}>
          <CustomerContextProvider>
            <JobContextProvider>
              <TaskContextProvider>
                <CallTimeEntryContextProvider>
                  <BillItems getCustomerBillItemsListPagination={getCustomerBillItemsListPagination} getCustomerBillItemsList={getCustomerBillItemsList} togglePage={toggle} />
                </CallTimeEntryContextProvider>
              </TaskContextProvider>
            </JobContextProvider>
          </CustomerContextProvider>
        </div>
        <div className={toggle === 2 ? "showContent" : 'content'}>
          <CustomerContextProvider>
            <CustBill
              customerbillItems={customerbillItems}
              setCustomerBillItems={customerbillItems}
              getCustomerBillItemsListPagination={getCustomerBillItemsListPagination}
              paginationData={customerBillPaginationData}
              setPaginationData={setCustomerBillPaginationData}
              getCustomerBillItemsList={getCustomerBillItemsList}
              custBillIsLoading={custBillIsLoading}
            />
          </CustomerContextProvider>
        </div>
        <div className={toggle === 3 ? "showContent" : 'content'}>
          <Payables />
        </div>
        <div className={toggle === 4 ? "showContent" : 'content'}>
          <Payments />
        </div>
      </div>
    </>
  );
};

export default Bill;
