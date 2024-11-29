/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { Table } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
import { getUniqueValuesByKey } from "../../../Utils/helpers";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import TaskUpdate from "../../popups/taskpops/TaskUpdate";
import { fetchServiceTypes, getCust, getSingleTask } from "../../../API/authCurd";

const DashCol4TaskTable = ({ taskDetail, dashboardData, loading, getDashboardData }) => {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [overDueTasks, setOverDueTask] = useState([])
  const [formattedOverDueTasks, setFormattedOverDueTask] = useState([])
  const { globalSearch, setGlobalSearch } = useContext(GlobalSearch)
  const [popUps, setPopUps] = useState(false);
  const [taskUpdateDetail, settaskUpdateDetail] = useState(null);
  const [updatedtaskData, setUpdatetaskdData] = useState(null)
  const [formError, setFormError] = useState({})
  const [serviceTypes, setServiceTypes] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const [filters, setFilters] = useState({ customer_id: [], job_id: [] })

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get('id');

  useEffect(() => {
    if (id) {
      let filterData = taskDetail.filter(item => item.customer == id)
      if (filterData.length === 0) {
        setData([]);
      } else {
        setData(filterData);
      }
    } else {
      setData(taskDetail)
    }
  }, [taskDetail])

  useEffect(() => {
    if (dashboardData) {
      setOverDueTask(dashboardData.overdue_tasks)
    } else {
      setOverDueTask([])
    }
  }, [dashboardData])

  useEffect(() => {
    let formattedData = overDueTasks
    if (globalSearch) {
      formattedData = formattedData.filter((item) => {
        const dueDate = item.desired_due_date ? item.desired_due_date : ""
        return (item?.customer_details?.name?.toLowerCase().includes(globalSearch.toLowerCase())) ||
          (item.project_details?.name?.toLowerCase().includes(globalSearch.toLowerCase())) ||
          (item.name?.toLowerCase().includes(globalSearch.toLowerCase())) ||
          (dueDate?.toLowerCase().includes(globalSearch.toLowerCase()))
      })
    }
    setFormattedOverDueTask(formattedData)
  }, [overDueTasks, globalSearch])

  useEffect(() => {
    const uniqueJobs = getUniqueValuesByKey(overDueTasks, "project_details")
    const jobFilter = uniqueJobs.map((item) => ({ text: item?.name, value: item?.id }))
    const uniqueClient = getUniqueValuesByKey(overDueTasks, "customer_details")
    const clientFilter = uniqueClient.map((item) => ({ text: item?.name, value: item?.id }))

    const columnsDef = [{
      title: "Client",
      dataIndex: ["customer_details", "name"],
      key: "clientName",
      filters: clientFilter,
      onFilter: (value, record) => record.customer_details.id == value,
      render: (text, record) => {
        return (<div>{text}</div>)
      },
      sorter: sortByString(["customer_details", "name"]),
      width: 140,
    },
    {
      title: "Job",
      dataIndex: ["project_details", "name"],
      key: "job",
      render: (text, record) => {
        return (<div>{text}</div>)
      },
      sorter: sortByString(["project_details", "name"]),
      filters: jobFilter,
      onFilter: (value, record) => record.project_details.id == value,
      width: 120,

    },
    {
      title: "Task Name",
      dataIndex: "name",
      key: "taskName",
      sorter: sortByString(["name"]),
      width: 130,
    },
    {
      title: "Due Date",
      dataIndex: "desired_due_date",
      key: "desiredDueDate",
      sorter: sortByDate(["desired_due_date"]),
      width: 120,
    },
    ];
    setColumns(columnsDef)
  }, [overDueTasks, formattedOverDueTasks])

  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    }).catch(() => { setServiceTypes([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {
      setCustomerList([])
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

  const updatePopUps = (data) => {
    setFormError({})
    getSingleTaskData(data.id).then((res) => {
      if (res?.Task) {
        settaskUpdateDetail(res.Task)
      }
    }).catch(() => {
      settaskUpdateDetail([])
    })
    setPopUps(true);
    getServiceTypes();
    getCustomersList();
  }

  const onCancelBtnHandler = () => {
    setPopUps(false);
    setUpdatetaskdData({})
    settaskUpdateDetail(null)
  }

  const onRowClick = (e, record) => {
    updatePopUps(record)
  }

  return (
    <>
      <div className="custTable">
        <Table
          columns={columns}
          dataSource={formattedOverDueTasks}
          rowKey="id"
          scroll={{ y: `calc(100vh - 415px)` }}
          sticky={{
            offsetHeader: 0,
          }}
          loading={{
            indicator: <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />,
            spinning: loading
          }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => { onRowClick(e, record) }
          })}
        />
      </div>
      {popUps && <div className={`mainpopups`}>
        <TaskUpdate
          serviceTypes={serviceTypes}
          customerList={customerList}
          getTaskList={getDashboardData}
          taskUpdateDetail={taskUpdateDetail}
          onClick={onCancelBtnHandler}
          formError={formError}
          setFormError={setFormError}
          paginationData={paginationData}
          getTaskListPagination={getDashboardData}
          updatedtaskData={updatedtaskData}
          setUpdatetaskdData={setUpdatetaskdData}
          settaskUpdateDetail={settaskUpdateDetail}
          filters={filters}
          isDashboard={true}
        />
        <div className="blurBg"></div>
      </div>}
    </>
  );
};

export default DashCol4TaskTable;