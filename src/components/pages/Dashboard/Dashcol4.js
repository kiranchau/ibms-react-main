/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import * as FaIcons from 'react-icons/fa';

import "../../SCSS/dashboard.scss";
import Taskspop from "../../popups/taskpops/Taskspop";
import { deleteTask, fetchPaymentTerms, fetchServiceTypes, getCust, getTask } from '../../../API/authCurd';
import DashCol4TaskTable from "./DashCol4TaskTable";

const Dashcol4 = ({ dashboardData, loading, getDashboardData }) => {
  const [popUps, setPopUps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [taskDetail, settaskDetail] = useState([]);

  function getTaskList() {
    setIsLoading(true)
    getTask().then((res) => {
      setIsLoading(false)
      settaskDetail(res.data.Tasks)
    }).catch(err => {
      setIsLoading(false)
    })
  }

  function deleteTaskList(id) {
    deleteTask(id)
      .then((res) => {
        const newData = taskDetail.filter((post) => post.id !== id);
        settaskDetail(newData);
      }).catch(err => {
        console.log("gettask-err: ", err)
      })
  }

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  const getPaymentTerms = () => {
    fetchPaymentTerms().then((res) => {
      if (res.data?.payment_terms) { setPaymentTerms(res.data?.payment_terms) }
    }).catch(() => { setPaymentTerms([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
    })
  }

  useEffect(() => {
    // getTaskList();
  }, [])

  return (
    <div className="Row2Hgt tasktable-widget">
      <div className="TablePad">
        <div className="d-flex align-items-center px-3 pt-2 pb-3">
          <FaIcons.FaClipboardList style={{ width: '26px', height: '26px', marginRight: '10px' }} />
          <div className="heading px-2">Overdue Tasks</div>
        </div>
        <div className="tableView">
          <DashCol4TaskTable taskDetail={taskDetail} getTaskList={getTaskList} deleteTaskList={deleteTaskList}
            getServiceTypes={getServiceTypes}
            getPaymentTerms={getPaymentTerms}
            getCustomersList={getCustomersList}
            serviceTypes={serviceTypes}
            paymentTerms={paymentTerms}
            customerList={customerList}
            isLoading={isLoading}
            dashboardData={dashboardData}
            loading={loading}
            getDashboardData={getDashboardData}
          />
        </div>
      </div>
      <div className={`${popUps ? "mainpopups" : "nomainpopups"}`}>
        <Taskspop onClick={() => setPopUps(!popUps)} />
        <div className="blurBg"></div>
      </div>
    </div>
  );
};

export default Dashcol4;
