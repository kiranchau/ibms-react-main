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
import { fetchJobs, generateReport } from '../../../API/authCurd';
import { downloadFile, extractFilename } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { projectHourlyReportSchema, validateFormData } from '../../../Utils/validation';

const ProjectHourlyReport = (props) => {
    const [customerList, setCustomerList] = useState([]);
    const [jobsList, setJobsList] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formValues, setFormValues] = useState({ job_ids: [], start_date: "", end_date: "" })
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [formError, setFormError] = useState({})

    // Get Jobs List by customer id
    const getJobsListByCustomerId = (id) => {
        fetchJobs(id).then((res) => {
            if (res.data?.jobs) { setJobsList(sortObjectsByAttribute(res.data?.jobs)); }
        }).catch(() => {
            setJobsList([]);
        });
    };

    // Checkbox on change handler function
    const checkBoxChangeHandler = (e, item) => {
        let jobs = formValues.job_ids
        if (jobs.includes(item.id)) {
            jobs = jobs.filter((j) => { return j != item.id })
        } else {
            jobs.push(item.id)
        }
        setFormValues({ ...formValues, job_ids: jobs })
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

    // Customer dropdown on change handler function
    const customerOnChangeHandler = (e) => {
        setSelectedCustomer(e.target.value)
    }

    // Generate report button click handler function
    const genrateReportBtnClickHandler = () => {
        let data = {
            ...formValues,
            customer_id: selectedCustomer,
            start_date: formValues.start_date ? parseDateTimeString(formValues.start_date, 5) : "",
            end_date: formValues.end_date ? parseDateTimeString(formValues.end_date, 5) : ""
        }
        validateFormData(projectHourlyReportSchema, data).then(() => {
            setIsGenerating(true)
            generateReport("ProjectHourlyReport", data).then((res) => {
                try {
                    const filename = extractFilename(res)
                    const blob = new Blob([res.data], { type: res.headers['content-type'] })
                    const downloadLink = window.URL.createObjectURL(blob)
                    downloadFile(downloadLink, filename)
                    setFormError({})
                    setFormValues({ job_ids: [], start_date: "", end_date: "" })
                } catch (error) {
                    console.log("ProjectHourlyReport-error: ", error)
                }
            }).catch((err) => {
                console.log("ProjectHourlyReport-err-2: ", err)
            }).finally(() => {
                setIsGenerating(false)
            })
        }).catch((err) => {
            setFormError(err)
        })
    }

    useEffect(() => {
        if (selectedCustomer) {
            setFormValues((prev) => ({ ...prev, job_ids: [] }))
            getJobsListByCustomerId(selectedCustomer)
        } else {
            setJobsList([])
        }
    }, [selectedCustomer]);

    useEffect(() => {
        if (props?.customers) {
            setCustomerList(sortObjectsByAttribute(props?.customers));
        } else {
            setCustomerList([]);
        }
    }, [props?.customers]);

    useEffect(() => {
        setFormError({})
        setSelectedCustomer("")
        setJobsList([])
        setFormValues({ job_ids: [], start_date: "", end_date: "" })
    }, [props.toggleState])

    return (
        <div className="jobscode">
            <table>
                <tr>
                    <th>Project Hourly Report</th>
                </tr>
            </table>
            <div className='py-2 ps-3'>
                <div className='d-flex report-filter-wrap'>
                    <div className='pe-5 date-range'>
                        <div className='py-2'>
                            <b>Date Range </b>
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
                        <div className='py-2'><b>Customers </b></div>
                        <div className='py-2'>
                            <FloatingLabel label="Customers">
                                <Form.Select
                                    aria-label="Customers"
                                    name='customer'
                                    value={selectedCustomer ?? ""}
                                    onChange={customerOnChangeHandler}
                                >
                                    <option key={0} value="">Select Customer</option>
                                    {customerList.length > 0 && customerList.map((item) => {
                                        return <option key={item.id} value={item.id}>{item.name}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                    </div>
                </div>
                <div className='py-2'>
                    <b> Job(s) </b><span className='fw-lighter' style={{ fontSize: '0.9em' }}>(Leave Blank to generate a report for all jobs.)</span>
                </div>
                <div className='ListHieght'>
                    {jobsList.map((item) => (
                        <Form.Check
                            key={item.id}
                            type="checkbox"
                            label={`${item?.name}`}
                            checked={formValues.job_ids.includes(item.id)}
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

export default ProjectHourlyReport;
