
import React, { useEffect, useState } from "react";
import { Button, Space, Table, DatePicker, Select } from "antd";
import { FaTasks } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "../../SCSS/forums.scss";
import { GetUsers, deleteJob, fetchJobCodes, getCust, getJob } from "../../../API/authCurd";
import { sortByDate, sortByString } from "../../../Utils/sortFunctions";
const { RangePicker } = DatePicker;
const onChange = (value, dateString) => {
  console.log("Selected Time: ", value);
  console.log("Formatted Selected Time: ", dateString);
};
const onOk = (value) => {
  console.log("onOk: ", value);
};

const handleChange = (value) => {
  console.log(`selected ${value}`);
};

const ForumTable = () => {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [columns, setColumns] = useState([])
  const [jobDetail, setJobDetail] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [responsibleUser, setResponsibleUser] = useState([]);

  const handleChange = (filters, sorter) => {
    console.log(filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const clearFilters = () => {
    setFilteredInfo({});
  };
  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };
  const setAgeSort = () => {
    setSortedInfo({
      order: "descend",
      columnKey: "age",
    });
  };


  function getJobList() {
    getJob().then((res) => {
      setJobDetail(res.data.Projects)
    }).catch(err => {
      setJobDetail([])
    })
  }

  const getResponsibleUsers = () => {
    GetUsers().then((res) => {
      if (res.data?.users) { setResponsibleUser(res.data?.users) }
    }).catch(() => { setResponsibleUser([]) })
  }

  function getCustomersList() {
    getCust().then((res) => {
      setCustomerList(res.data.customers)
    }).catch(err => {  setCustomerList([])    })
  }

  const getJobCodes = () => {
    fetchJobCodes().then((res) => {
      if (res.data?.job_codes) { setJobCodes(res.data?.job_codes) }
    }).catch(() => { setJobCodes([]) })
  }

  function deletJobList(id) {
    deleteJob(id).then(() => {
      getJobList()
    }).catch(err => {
      console.log("deletJobList: ", err)
    })
  }

  useEffect(() => {
    getJobList()
    getResponsibleUsers()
    getCustomersList()
    getJobCodes()
  }, [])

  useEffect(() => {
    const jobCodeFilter = jobCodes.map((item) => ({ text: item.name, value: item.id }))
    const clientFilter = customerList.map((item) => ({ text: item.name, value: item.id }))
    const primAssignUserFilter = responsibleUser.map((item) => ({ text: item.name, value: item.id }))

    const columnsDef = [
      {
        title: "Client",
        dataIndex: ["customer_details", "name"],
        key: "clientName",
        filters: clientFilter,
        onFilter: (value, record) => record.customer_details.id == value,
        render: (text, record) => {
          return (
            <a href={`https://example.com/${record.id}`} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          )
        },
        // filteredValue: filteredInfo.name || null,
        // sorter: (a, b) => a.customer_details.name.length - b.customer_details.name.length,
        sorter: sortByString(["customer_details", "name"]),
        // sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Job Name",
        dataIndex: "name",
        key: "jobName",
        sorter: sortByString(["name"]),
        // sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Job Code",
        dataIndex: ["type_details", "name"],
        key: "joCode",
        sorter: sortByString(["type_details", "name"]),
        // sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
        filters: jobCodeFilter,
        onFilter: (value, record) => record.type_details.id == value,
        ellipsis: true,
      },
      {
        title: "Primary Assigned User",
        dataIndex: ["user", "name"],
        key: "primaryAssignedUser",
        sorter: sortByString(["user", "name"]),
        filters: primAssignUserFilter,
        onFilter: (value, record) => record.user.id == value,
        // sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Due Date",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",
        sorter: sortByDate(["desired_due_date"]),
        // sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
        ellipsis: true,
      },

      {
        title: "Date Completed",
        dataIndex: "created_at",
        key: "dateCompleted",
        // filters: [
        //   {
        //     text: "London",
        //     value: "London",
        //   },
        //   {
        //     text: "New York",
        //     value: "New York",
        //   },
        // ],
        // filteredValue: filteredInfo.address || null,
        // onFilter: (value, record) => record.address.includes(value),
        sorter: sortByDate(["created_at"]),
        // sortOrder: sortedInfo.columnKey === "address" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: "Completed By",
        dataIndex: "CompletedBy",
        key: "completedBy",
        // sorter: (a, b) => a.city - b.city,
        // sortOrder: sortedInfo.columnKey === "city" ? sortedInfo.order : null,
        ellipsis: true,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        render: (text, record) => (
          <MdDelete
            onClick={() => { deletJobList(record.id) }}
            style={{ color: '#666', cursor: 'pointer', fontSize: '20px' }}
          />
        ),
      },
    ];
    setColumns(columnsDef)
  }, [jobDetail, jobCodes, customerList, responsibleUser])

  return (
    <>
     
      <Table columns={columns} dataSource={jobDetail} onChange={handleChange} />
     

    </>
  );
};
export default ForumTable;
