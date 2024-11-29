/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useContext, useEffect, useState } from "react";
import UpdateUser from '../../popups/userpops/UpdateUser'
import { Table } from "antd";
import { sortByNumber, sortByString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { LoadingOutlined } from '@ant-design/icons';
import { calculatePageRange, getFilterFromLocal, getUniqueValuesByKey, removeNullFromArray, saveFilterToLocal } from "../../../Utils/helpers";
import { paginationInitialPage, paginationPerPage, paginationSizeChanger } from "../../../Utils/pagination";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import { userStatus } from "../../../Utils/staticdata";
import { confirmDelete } from "../../commonModules/UI/Dialogue";
import { deleteUserData } from "../../../API/authCurd";
import TableBtn from "../../commonModules/UI/TableBtn";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import * as RiIcons from "react-icons/ri";
import PasswordCustomerFilter from "../../FilterDropdown/PasswordCustomerFilter";

const UsersTable = ({ usersList, paginationData, getUsersListPagination, customerList, clientStatus, departments, getClientStatus, getCustomersList, getDepartmentList, getPermissionList, permissions, setPaginationData, getUsersList, fetchData }) => {
  const [popUps, setPopUps] = useState(false);
  const [columns, setColumns] = useState([]);
  const [mySpin, setMySpin] = useState();
  const [editFormData, setEditFormData] = useState({});
  const [editFormError, setEditFormError] = useState({})
  const [selectedUser, setSelectedUser] = useState(null);
  const [toggle, setToggle] = useState(1);
  const [permissionArr, setPermissionsArr] = useState([]);
  const [formattedUserList, setFormattedUserList] = useState([]);
  const [statusFilterValue, setStatusFilterValue] = useState(["1"])
  const [userTypeFilterValue, setUserTypeFilterValue] = useState([])
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const [userType, setUserType] = useState(1);
  const [filters, setFilters] = useState({
    customer_id: [],
  })
  const [filter, setFilter] = useState({
    customer_id: [],
  })
  // Get all th elements in the Ant Design table header
  const tableHeaders = document.querySelectorAll('.ant-table-cell');

  // Remove tooltip on hover by setting title to an empty string
  tableHeaders.forEach(th => {
    th.addEventListener('mouseenter', () => {
      th.setAttribute('title', '');
    });
  });
  useEffect(() => {
    if (usersList.length === 0) {
      setMySpin(false);
    } else {
      setMySpin(true);
    }
  }, [usersList])

  // On cell handler
  const onCellHandler = () => {
    return { onClick: (event) => { event.stopPropagation() } }
  }

  // custom filter check handler
  const customFilterHandler = (key) => {
    resetSearch()
    let fils = filters
    setFilter((prev) => ({ ...prev, customer_id: fils.customer_id ? fils.customer_id : [] }))
    let prevFilter = getFilterFromLocal('users')
    saveFilterToLocal('users', { ...prevFilter, customer_id: fils.customer_id ? fils.customer_id : [] })
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let prevFilter = getFilterFromLocal('users')
    saveFilterToLocal('users', { ...prevFilter, [key]: [] })
    setFilter((prev) => ({ ...prev, [key]: [] }))
  }

  const deleteUserRow = async (record) => {
    let isConfirm = confirmDelete("user")
    if (isConfirm) {
      deleteUserData(record.id).then(() => {
        getUsersList();
      })
    }
  };

  // Column Definition
  useEffect(() => {
    const typeFilter = fetchData.map((item) => ({ text: item?.name, value: item?.id }))
    const statusFilter = userStatus.map((item) => ({ text: item?.name, value: item?.id }))
    const uniqueClient = getUniqueValuesByKey(usersList, "customer_details")
    let clientArr = removeNullFromArray(uniqueClient)
    const clientFilter = sortObjectsByAttribute(clientArr.map((item) => ({ name: item?.name, id: item?.id })), "name")

    const columnsDef = [
      {
        title: 'Id',
        dataIndex: "id",
        key: "id",
        sorter: sortByNumber(["id"]),
        width: 90
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'username',
        width: 150,
        render: (text, record) => {
          const fullName = `${record?.first_name ? record?.first_name : ""} ${record?.last_name ? record?.last_name : ""}`.trim();
          return <div>{fullName}</div>;
        },
        sorter: sortByString(['first_name']),
      },
      {
        title: 'Company',
        dataIndex: ["customer_details", 'name'],
        key: 'company',
        sorter: sortByString(["customer_details", "name"]),
        width: 180,
        filteredValue: filters.customer_id,
        filterDropdown: (props) => { return <PasswordCustomerFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} allOptions={clientFilter} /> },
      },
      {
        title: 'Email',
        dataIndex: "email",
        key: "useremail",
        sorter: sortByString(["email"]),
        width: 220
      },
      {
        title: 'Phone',
        dataIndex: "phone_no",
        key: "phone_no",
        sorter: sortByNumber(["phone_no"]),
        width: 150
      },
      {
        title: 'User Type',
        dataIndex: ["user_type_with_id", "name"],
        key: "usertype",
        sorter: sortByString(["user_type_with_id", "name"]),
        filters: typeFilter,
        filteredValue: userTypeFilterValue,
        width: 150,
        onFilter: (value, record) => record.user_type_with_id?.id == value,
      },
      {
        title: 'Status',
        dataIndex: ["status"],
        key: "status",
        sorter: sortByString(["status"]),
        filters: statusFilter,
        width: 120,
        filteredValue: statusFilterValue,
        onFilter: (value, record) => record.status == value,
        render: (text, record) => {
          const status = userStatus.find(item => item.id == record?.status);
          return status?.name ? status?.name : "";
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        className: "actions-column",
        onCell: onCellHandler,
        render: (text, record) => (
          <>
            <div className="d-flex">
              <div className="mx-2">
                <MyTooltip title="Delete User">
                  <TableBtn className=" activeLog update-task-btn " onclick={() => deleteUserRow(record)}>
                    <RiIcons.RiDeleteBin6Fill />
                  </TableBtn>
                </MyTooltip>
              </div>
            </div>
          </>
        ),
      },
    ];
    setColumns(columnsDef);
  }, [usersList, formattedUserList, fetchData, statusFilterValue, userTypeFilterValue, filters])

  // Filter
  useEffect(() => {
    let formattedData = usersList
    if (globalSearch) {
      setFilters((prev) => ({ ...prev, customer_id: [] }))
      formattedData = formattedData.filter((item) => {
        const fullName = `${item.first_name} ${item.last_name}`
        const idString = item.id.toString();
        const status = userStatus.find(status => status.id == item.status)?.name;
        return (item?.email?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.first_name?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.last_name?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (fullName?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (idString.includes(globalSearch?.trim()?.toLowerCase())) ||
          (status?.toLowerCase()?.includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.user_type_with_id?.name?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase()))
      })
    } else {
      if (userTypeFilterValue?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (userTypeFilterValue?.includes(item.user_type))
        })
      }
      if (statusFilterValue?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (statusFilterValue?.includes(`${item.status}`))
        })
      }
      if (filter?.customer_id?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (filter?.customer_id?.includes(item.customer_id ? item.customer_id : ""))
        })
      }
    }
    setFormattedUserList(formattedData)
  }, [usersList, globalSearch, userTypeFilterValue, statusFilterValue, filter])

  // Age change handler
  const handleOnPageChange = (pageNumber) => {
    getUsersListPagination(20, pageNumber)
  }

  // Update popup function
  const updatePopUps = (data) => {
    setEditFormError({})
    setPopUps(true)
    setSelectedUser(data)
    getClientStatus()
    getCustomersList()
    getDepartmentList()
    getPermissionList()
  }

  // On Row click handler function
  const onRowClick = (e, record) => {
    updatePopUps(record)
  }

  // table onChange handler function 
  const onTableChangeHandler = (pagination, filters, sorter, extra) => {
    const { currentDataSource } = extra
    if (filters.status) {
      setStatusFilterValue(filters.status)
      let prevFilter = getFilterFromLocal('users')
      saveFilterToLocal('users', { ...prevFilter, status: filters.status })
    } else {
      setStatusFilterValue([])
      let prevFilter = getFilterFromLocal('users')
      saveFilterToLocal('users', { ...prevFilter, status: [] })
    }
    if (filters.usertype) {
      setUserTypeFilterValue(filters.usertype)
      let prevFilter = getFilterFromLocal('users')
      saveFilterToLocal('users', { ...prevFilter, usertype: filters.usertype })
    } else {
      setUserTypeFilterValue([])
      let prevFilter = getFilterFromLocal('users')
      saveFilterToLocal('users', { ...prevFilter, usertype: [] })
    }
    setPaginationData({
      ...paginationData,
      current_page: pagination.current,
      total: currentDataSource.length
    })
  }

  useEffect(() => {
    let savedFilters = getFilterFromLocal('users')
    setStatusFilterValue(savedFilters?.status ? savedFilters.status : ['1'])
    setUserTypeFilterValue(savedFilters?.usertype ? savedFilters.usertype : [])
    setFilter({ customer_id: savedFilters?.customer_id ? savedFilters.customer_id : [] })
    setFilters((prev) => ({ ...prev, customer_id: savedFilters?.customer_id ? savedFilters.customer_id : [] }))
  }, [])

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      per_page: paginationPerPage,
      total: formattedUserList.length,
    })
  }, [formattedUserList])

  const closeButtonHandler = () => {
    setSelectedUser(null)
    setPopUps(!popUps)
  }

  return (
    <>
      <Table columns={columns}
        dataSource={formattedUserList}
        scroll={{ y: `calc(100vh - 230px)` }}
        sticky={{
          offsetHeader: 0,
        }}
        loading={{
          indicator:
            <LoadingOutlined
              style={{
                fontSize: 50,
                color: '#2c0036',
              }}
              spin
            />,
          spinning: mySpin ? false : true
        }}
        onRow={(record, rowIndex) => ({
          onClick: (e) => { onRowClick(e, record) }
        })}
        onChange={onTableChangeHandler}
        pagination={{
          position: ['bottomRight'],
          pageSize: paginationData.per_page,
          current: paginationData.current_page,
          showSizeChanger: paginationSizeChanger
        }}
        footer={() => {
          return paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
            <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
          </div> : null
        }}
      />
      <div className={`${popUps ? "mainpopups" : "nomainpopups"}`}>
        <UpdateUser
          onClick={closeButtonHandler}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          editFormError={editFormError}
          setEditFormError={setEditFormError}
          customerList={customerList}
          clientStatus={clientStatus}
          departments={departments}
          selectedUser={selectedUser}
          toggle={toggle}
          setToggle={setToggle}
          paginationData={paginationData}
          getUsersListPagination={getUsersListPagination}
          permissions={permissions}
          permissionArr={permissionArr}
          setPermissionsArr={setPermissionsArr}
          getUsersList={getUsersList}
          userType={userType}
          setUserType={setUserType}
        />
        <div className="blurBg"></div>
      </div>
    </>
  );
};
export default UsersTable;
