/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'

import MyTooltip from "../../commonModules/UI/MyTooltip";
import { getActivityNotesUsersDepartment, getSingleTask, postAssignedUserData } from "../../../API/authCurd";
import Dropdown from 'react-bootstrap/Dropdown';
import { Form } from 'react-bootstrap';
import { MdAssignmentAdd } from "react-icons/md";
import { DatePicker } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { removeDuplicatesAndUndefined, separateAndTransformIds } from '../../../Utils/helpers';
import { convertDateFormat, convertDateFormatTwo, getCurrentDate } from '../../../Utils/dateFormat';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { FaUser } from "react-icons/fa";
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';

function AssignUser(props) {
    const [checkboxStatesAssign, setCheckboxStatesAssign] = useState([]);
    const [checkboxDeptAssign, setCheckboxDeptAssign] = useState([]);
    const [searchBar, setSearchBar] = useState('');
    const [isOpen, setIsOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [filteredData, setFilteredData] = useState([]);
    const [assignUserDueDate, setAssignUserDueDate] = useState(getCurrentDate())

    const handleSearch = (searchValue) => {
        setSearchBar(searchValue);
    };

    // Assignmendt button click handler
    const handleAssignment = async (record) => {
        const { userIds, deptIds } = separateAndTransformIds(checkboxStatesAssign)

        const payload = {
            task_id: record.id,
            user_ids: userIds ? userIds : [],
            dept_ids: deptIds ? deptIds : [],
            desired_due_date: assignUserDueDate ? convertDateFormat(assignUserDueDate) : ""
        };

        postAssignedUserData(payload).then(() => {
            props.getTaskListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
        }).catch((err) => {
            props.getTaskListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
        }).finally(() => {
            setIsOpen(false)
            setAssignUserDueDate(getCurrentDate())
            setSearchBar("")
        })
    };

    function onAssignChangeHandler(e, item) {
        let assign = checkboxStatesAssign
        if (checkboxStatesAssign.includes(item.id)) {
            assign = assign.filter((u) => { return u != item.id })
        } else {
            assign.push(item.id)
        }
        setCheckboxStatesAssign([...assign])
    }

    function getUserAndDepartments() {
        getActivityNotesUsersDepartment(1).then((res) => {
            if (res.data?.users) { setUsers(res.data?.users) }
        }).catch(() => { setUsers([]) })
    }

    // Get single task data by ID
    function getSingleTaskData(id) {
        getSingleTask(id).then((res) => {
            if (res.data?.Task) {
                let ids = res.data?.Task?.assigned_user_details.map((item) => item.user_id)
                let uniqueIds = removeDuplicatesAndUndefined(ids)
                setCheckboxStatesAssign(uniqueIds)
            }
        }).catch(() => {
            setCheckboxStatesAssign([])
        })
    }

    // Toggle click handler
    const onToggleClickHandler = (data) => {
        setSearchBar("")
        setIsOpen(data)
        if (data) {
            setCheckboxDeptAssign([])
            getUserAndDepartments()
            getSingleTaskData(props.record?.id)
            props.setSelectedTasks(props.record)
        } else {
            setUsers([])
            setCheckboxDeptAssign([])
            setCheckboxStatesAssign([])
            setSearchBar("")
            props.setSelectedTasks(null)
        }
    }

    useEffect(() => {
        if (searchBar) {
            let userList = users.filter((item) => { if (item.email) { return item } })
            let deptList = users.filter((item) => { if (!item.email) { return item } })

            let userCheckList = userList.map((item) => ({
                id: item.id,
                name: `${item?.abv ? item?.abv + " - " : ""}${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
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
                name: `${item?.abv ? item?.abv + " - " : ""}${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
            }))
            let deptCheckList = deptList.map((item) => ({ id: -item.id, name: `All ${item.name}` }))

            const sortedUserList = sortObjectsByAttribute(userCheckList);
            const sortedDeptList = sortObjectsByAttribute(deptCheckList);
            setFilteredData([...sortedDeptList, ...sortedUserList])
        }
    }, [users, searchBar])

    const handleAssignUserDesiredDateChange = (date) => {
        setIsOpen(true)
        setAssignUserDueDate(convertDateFormatTwo(date))
    }

    const disabledDate = (current) => {
        if (current && props?.record?.desired_due_date) {
            // Add one day to the updated task due date
            const nextDate = dayjs(props?.record?.desired_due_date, "MM/DD/YYYY").add(1, 'day');

            // Compare the current date with the next date
            return dayjs(current, "MM/DD/YYYY").isAfter(nextDate);
        }
        return false;
    };

    const closeAssignDropdown = () => {
        setIsOpen(false)
        setAssignUserDueDate(getCurrentDate())
    }

    return (
        <div>
            <Dropdown show={isOpen && (props?.record?.id == props?.selectedTasks?.id)} onToggle={onToggleClickHandler}>
                <Dropdown.Toggle variant="primary" id="dropdown-basic" className="filter-btn">
                    <MyTooltip title="Assign User">
                        <FaUser style={{fontSize:13}}/>
                    </MyTooltip>
                </Dropdown.Toggle>

                <Dropdown.Menu>
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
                                                key={item.id} // Check if task_assigned_user_id is the correct ID
                                                type="checkbox"
                                                data-userid={item.id}
                                                label={item.name}
                                                onChange={(e) => onAssignChangeHandler(e, item)}
                                                checked={checkboxStatesAssign.includes(item.id)}
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
                                    // disabledDate={disabledDate}
                                    value={assignUserDueDate ? dayjs(assignUserDueDate, "MM/DD/YYYY") : ""}
                                    name='desired_due_date'
                                    format="MM/DD/YYYY"
                                    className='myDatePicker'
                                    placeholder="Desired Due Date"
                                    onChange={handleAssignUserDesiredDateChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrap button-style">
                        <a type="button" className="cancel-btn" onClick={closeAssignDropdown}>Cancel</a>
                        <button type="button" className="assign-btn" onClick={() => handleAssignment(props.record)}>Save</button>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default AssignUser;
