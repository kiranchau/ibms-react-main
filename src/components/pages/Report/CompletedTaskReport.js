/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Spin, DatePicker } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from "dayjs"
import 'dayjs/locale/en';

import Button from "../../commonModules/UI/Button";
import { fetchDepartments, generateReport } from '../../../API/authCurd';
import { downloadFile, extractFilename } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { completedTaskReportSchema, validateFormData } from '../../../Utils/validation';

const CompletedTaskReport = (props) => {
    const [usersList, setUserList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formValues, setFormValues] = useState({ user_ids: [], start_date: "", end_date: "" })
    const [selectedDepartment, setSelectedDepartment] = useState("")
    const [formError, setFormError] = useState({})

    // Get all department list function
    const getDepartments = () => {
        fetchDepartments().then((res) => {
            if (res.data?.departments) { setDepartments(sortObjectsByAttribute(res.data?.departments)) }
        }).catch(() => { setDepartments([]) })
    }

    // Checkbox on change handler function
    const checkBoxChangeHandler = (e, item) => {
        let users = formValues.user_ids
        if (users.includes(item.id)) {
            users = users.filter((u) => { return u != item.id })
        } else {
            users.push(item.id)
        }
        setFormValues({ ...formValues, user_ids: users })
    }

    // Start Date on change handler function
    const startdateOnChangeHandler = (value, datestring) => {
        let errors = formError
        if (errors.hasOwnProperty("start_date")) {
            delete errors["start_date"]
        }
        setFormError(errors)
        setFormValues({ ...formValues, start_date: datestring })
    }

    // End Date on change handler function
    const enddateOnChangeHandler = (value, datestring) => {
        let errors = formError
        if (errors.hasOwnProperty("end_date")) {
            delete errors["end_date"]
        }
        setFormError(errors)
        setFormValues({ ...formValues, end_date: datestring })
    }

    // Department dropdown on change handler function
    const departmentOnChangeHandler = (e) => {
        setSelectedDepartment(e.target.value)
    }

    // Generate report button click handler function
    const genrateReportBtnClickHandler = () => {
        let data = {
            ...formValues,
            start_date: formValues.start_date ? parseDateTimeString(formValues.start_date, 5) : "",
            end_date: formValues.end_date ? parseDateTimeString(formValues.end_date, 5) : ""
        }
        validateFormData(completedTaskReportSchema, data).then(() => {
            setIsGenerating(true)
            generateReport("completedTaskByUser", data).then((res) => {
                try {
                    const filename = extractFilename(res)
                    const blob = new Blob([res.data], { type: res.headers['content-type'] })
                    const downloadLink = window.URL.createObjectURL(blob)
                    downloadFile(downloadLink, filename)
                    setFormError({})
                    setFormValues({ user_ids: [], start_date: "", end_date: "" })
                } catch (error) {
                    console.log("completedTaskByUser-error: ", error)
                }
            }).catch((err) => {
                console.log("completedTaskByUser-err-2: ", err)
            }).finally(() => {
                setIsGenerating(false)
            })
        }).catch((err) => {
            setFormError(err)
        })
    }

    useEffect(() => {
        getDepartments()
    }, []);

    useEffect(() => {
        if (props?.users) {
            setUserList(selectedDepartment ? props.users.filter(u => u.department_id == selectedDepartment) : props.users);
        } else {
            setUserList([]);
        }
    }, [props?.users, selectedDepartment]);

    useEffect(() => {
        setFormError({})
        setSelectedDepartment("")
        setFormValues({ user_ids: [], start_date: "", end_date: "" })
    }, [props.toggleState])

    return (
        <div className="jobscode">
            <table>
                <tr>
                    <th>Completed Tasks by User Report</th>
                </tr>
            </table>
            <div className='py-2 ps-3'>
                <div className='d-flex report-filter-wrap'>
                    <div className='pe-5 date-rage'>
                        <div className='py-2'>
                            <b>Task Date Range </b>
                        </div>

                        <div className='d-flex align-items-start py-2'>
                            <div className='d-flex flex-column'>
                                <DatePicker
                                    format="MM/DD/YYYY"
                                    placeholder='Start Date'
                                    name='start_date'
                                    onChange={startdateOnChangeHandler}
                                    value={formValues.start_date ? dayjs(formValues.start_date, "MM/DD/YYYY") : ""}
                                />
                                {formError?.start_date ? <span className='ms-1 text-danger'>{formError?.start_date}</span> : null}
                            </div>
                            <span className='px-3 pt-2'><b>-</b></span>
                            <div className='d-flex flex-column'>
                                <DatePicker
                                    format="MM/DD/YYYY"
                                    placeholder='End Date'
                                    name='end_date'
                                    onChange={enddateOnChangeHandler}
                                    value={formValues.end_date ? dayjs(formValues.end_date, "MM/DD/YYYY") : ""}
                                />
                                {formError?.end_date ? <span className='ms-1 text-danger'>{formError?.end_date}</span> : null}
                            </div>
                        </div>
                    </div>
                    <div className='w-50'>
                        <div className='py-2'><b>Department </b></div>
                        <div className='py-2'>
                            <FloatingLabel label="Department">
                                <Form.Select
                                    aria-label="Department"
                                    name='department'
                                    value={selectedDepartment ?? ""}
                                    onChange={departmentOnChangeHandler}
                                >
                                    <option key={0} value="">All Department</option>
                                    {departments.length > 0 && departments.map((item) => {
                                        return <option key={item.id} value={item.id}>{item.name}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                    </div>
                </div>
                <div className='py-2'>
                    <b> User(s) </b><span className='fw-lighter' style={{ fontSize: '0.9em' }}>(Leave Blank to generate a report for all users.)</span>
                </div>
                <div className='ListHieght'>
                    {usersList.map((item) => (
                        <Form.Check
                            key={item.id}
                            type="checkbox"
                            label={`${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`}
                            checked={formValues.user_ids.includes(item.id)}
                            onChange={(e) => checkBoxChangeHandler(e, item)}
                        />
                    ))}
                </div>
            </div>
            <div className='d-flex align-items-center justify-content-center my-2  w-100' style={{ bottom: "60px" }}>
                <Button onClick={genrateReportBtnClickHandler}>Generate Report {isGenerating && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
            </div>
        </div>
    );
}

export default CompletedTaskReport;
