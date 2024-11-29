/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import { DatePicker } from 'antd';
import Dropdown from 'react-bootstrap/Dropdown';
import { IoMdAdd } from "react-icons/io";
import Form from 'react-bootstrap/Form';
import dayjs from "dayjs"
import 'dayjs/locale/en';

import { convertDateFormatTwo, getCurrentDate } from '../../../Utils/dateFormat';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { getActivityNotesUsersDepartment } from '../../../API/authCurd';

const AddAssignedUser = ({ assignedUsers, setAssignedUsers, assignedDueDate, setAssignedDueDate, isOpen, setIsOpen }) => {
    const [searchBar, setSearchBar] = useState('');
    const [users, setUsers] = useState([])
    const [filteredData, setFilteredData] = useState([])

    function getUserAndDepartments() {
        getActivityNotesUsersDepartment(1).then((res) => {
            if (res.data?.users) { setUsers(res.data?.users) }
        }).catch(() => { setUsers([]) })
    }

    const onToggleClickHandler = (data) => {
        setSearchBar("")
        setIsOpen((prev) => {
            if (prev == false) {
                getUserAndDepartments()
            }
            return !prev
        })
    }

    const handleSearch = (searchValue) => {
        setSearchBar(searchValue);
    };

    function onAssignChangeHandler(e, item) {
        let assign = assignedUsers ? assignedUsers : []
        if (assign?.includes(item.id)) {
            assign = assign.filter((u) => { return u != item.id })
        } else {
            assign.push(item.id)
        }
        setAssignedUsers([...assign])
    }

    useEffect(() => {
        if (searchBar) {
            let userList = users.filter((item) => { if (item.email) { return item } })
            let deptList = users.filter((item) => { if (!item.email) { return item } })
            let userCheckList = userList.map((item) => ({
                id: item.id,
                name: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
            }))
            let deptCheckList = deptList.map((item) => ({ id: -item.id, name: `All ${item.name}` }))

            const filterUserData = userCheckList.filter(item => { return item?.name?.toLowerCase()?.includes(searchBar.toLowerCase()); });
            const filterDeptData = deptCheckList.filter(item => { return item?.name?.toLowerCase()?.includes(searchBar.toLowerCase()); });

            const sortedUserList = sortObjectsByAttribute(filterUserData);
            const sortedDeptList = sortObjectsByAttribute(filterDeptData);
            setFilteredData([...sortedDeptList, ...sortedUserList])
        } else {
            let userList = users.filter((item) => { if (item.email) { return item } })
            let deptList = users.filter((item) => { if (!item.email) { return item } })

            let userCheckList = userList.map((item) => ({
                id: item.id,
                name: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
            }))
            let deptCheckList = deptList.map((item) => ({ id: -item.id, name: `All ${item.name}` }))

            const sortedUserList = sortObjectsByAttribute(userCheckList);
            const sortedDeptList = sortObjectsByAttribute(deptCheckList);
            setFilteredData([...sortedDeptList, ...sortedUserList])
        }
    }, [users, searchBar])

    const handleAssignUserDesiredDateChange = (date) => {
        setIsOpen(true)
        setAssignedDueDate(convertDateFormatTwo(date))
    }

    const closeAssignDropdown = () => {
        setSearchBar("")
        setIsOpen(false)
        setAssignedDueDate(getCurrentDate())
    }

    return (
        <div className="assign-task-btn">
            <Dropdown show>
                {<Dropdown.Toggle variant="primary" id="dropdown-basic" onClick={onToggleClickHandler}>
                    <IoMdAdd /> Add Assigned User
                </Dropdown.Toggle>}
                {isOpen && <Dropdown.Menu>
                    <div className='inner-menu-content'>
                        <div className='user-list'>
                            <input
                                className="search-box"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                value={searchBar}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Form className="px-2">
                                <div className='user-list-wrap'>
                                    {filteredData.map(item => {
                                        return (
                                            <Form.Check
                                                key={item.id}
                                                type="checkbox"
                                                data-userid={item.id}
                                                label={item.name}
                                                onChange={(e) => onAssignChangeHandler(e, item)}
                                                checked={assignedUsers?.includes(item.id)}
                                            />
                                        )
                                    })}
                                </div>
                            </Form>
                        </div>
                        <div className='w-50 addCust '>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Desired Due Date</label>
                                <DatePicker
                                    value={assignedDueDate ? dayjs(assignedDueDate, "MM/DD/YYYY") : ""}
                                    onChange={handleAssignUserDesiredDateChange}
                                    name='desired_due_date'
                                    format="MM/DD/YYYY"
                                    className='myDatePicker'
                                    placeholder="Desired Due Date"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrap">
                        <a type="button" className="cancel-btn" onClick={closeAssignDropdown}>Cancel</a>
                    </div>
                </Dropdown.Menu>}
            </Dropdown>
        </div>
    )
}

export default AddAssignedUser