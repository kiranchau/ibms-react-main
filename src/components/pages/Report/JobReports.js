/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Spin, DatePicker } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from "dayjs"
import 'dayjs/locale/en';

import Button from "../../commonModules/UI/Button";
import { generateReport } from '../../../API/authCurd';
import { downloadFile, extractFilename } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { timeTrackingReportSchema, validateFormData } from '../../../Utils/validation';

const JobReports = (props) => {
    const [usersList, setUserList] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formValues, setFormValues] = useState({ customer_ids: [], start_date: "", end_date: "" })
    const [formError, setFormError] = useState({})

    // Checkbox on change handler function
    const checkBoxChangeHandler = (e, item) => {
        let users = formValues.customer_ids
        if (users.includes(item.id)) {
            users = users.filter((u) => { return u != item.id })
        } else {
            users.push(item.id)
        }
        setFormValues({ ...formValues, customer_ids: users })
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

    // Generate report button click handler function
    const genrateReportBtnClickHandler = () => {
        let data = {
            ...formValues,
            start_date: formValues.start_date ? parseDateTimeString(formValues.start_date, 5) : "",
            end_date: formValues.end_date ? parseDateTimeString(formValues.end_date, 5) : ""
        }
        validateFormData(timeTrackingReportSchema, data).then(() => {
            setIsGenerating(true)
            generateReport("jobTimeTrackingReport", data).then((res) => {
                try {
                    const filename = extractFilename(res)
                    const blob = new Blob([res.data], { type: res.headers['content-type'] })
                    const downloadLink = window.URL.createObjectURL(blob)
                    downloadFile(downloadLink, filename)
                    setFormValues({ customer_ids: [], start_date: "", end_date: "" })
                    setFormError({})
                } catch (error) {
                    console.log("jobTimeTrackingReport-error: ", error)
                }
            }).catch((err) => {
                console.log("jobTimeTrackingReport-err-2: ", err)
            }).finally(() => {
                setIsGenerating(false)
            })
        }).catch((err) => {
            setFormError(err)
        })
    }

    useEffect(() => {
        if (props?.users) {
            setUserList(sortObjectsByAttribute(props.users))
        } else {
            setUserList([])
        }
    }, [props?.users]);

    useEffect(() => {
        setFormError({})
        setFormValues({ customer_ids: [], start_date: "", end_date: "" })
    }, [props.toggleState])

    return (
        <div className="jobscode">
            <table>
                <tr>
                    <th>IB-RECRUIT Job Time Tracking Report</th>
                </tr>
            </table>
            <div className='py-2 ps-3'>
                <div className='py-2'>
                    <b>Study Date Range </b><span className='fw-lighter' style={{ fontSize: '0.9em' }}>(Leave Blank to generate a report for the last 30 days.)</span>
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
                <div className='py-2'>
                    <b> Customer(s) </b><span className='fw-lighter' style={{ fontSize: '0.9em' }}>(Leave Blank to generate a report with all customers.)</span>
                </div>
                <div className='ListHieght'>
                    {usersList.map((item) => (
                        <Form.Check
                            key={item.id}
                            type="checkbox"
                            label={`${item?.name ? item?.name : ""}`}
                            checked={formValues.customer_ids.includes(item.id)}
                            onChange={(e) => checkBoxChangeHandler(e, item)}
                        />
                    ))}
                </div>
            </div>
            <div className='d-flex align-items-center justify-content-center my-2 w-100' style={{ bottom: "60px" }}>
                <Button onClick={genrateReportBtnClickHandler}>Generate Report {isGenerating && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
            </div>
        </div>
    );
}

export default JobReports;
