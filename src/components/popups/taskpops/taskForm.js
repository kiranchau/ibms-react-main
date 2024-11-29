import React from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchJobs } from '../../../API/authCurd';
import dayjs from "dayjs"
import 'dayjs/locale/en';

import '../../SCSS/popups.scss';
import { generateNumberArray } from '../../../Utils/helpers';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import AddAssignedUser from './AddAssignedUser';

const TaskForm = ({ serviceTypes, customerList, formError, setFormError, formValue, setFormValue, jobs, setJobs, desiredDueDate, setDesiredDueDate, deadlineDate, setDeadlineDate, isFromJob, assignedUsers, setAssignedUsers, assignedDueDate, setAssignedDueDate, isOpen, setIsOpen }) => {
    const getJobsData = (id) => {
        fetchJobs(id).then((res) => {
            if (res.data?.jobs) {
                setJobs(res.data?.jobs);
            }
        }).catch(() => {
            setJobs([]);
        });
    };

    const handleDesiredDateChange = (date) => {
        setDesiredDueDate(date);
    };
    const handleDeadlineDateChange = (date) => {
        setDeadlineDate(date);
    };

    const handleChange = (e) => {
        let err = formError;
        if (err.hasOwnProperty(e.target.name)) {
            delete err[e.target.name];
        }
        setFormError(err);
        setFormValue({ ...formValue, [e.target.name]: e.target.value });
        if (e.target.name === 'customer') {
            getJobsData(e.target.value);
        }
    };

    // Function to check if a field is mandatory
    const isFieldMandatory = (fieldName) => ['name', 'customer', 'project', 'service_type'].includes(fieldName);

    return (
        <div>
            <div className='d-flex flex-wrap w-100'>
                <div className={`addCust pe-4 ${isFieldMandatory('customer') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Customer${isFieldMandatory('customer') ? ' *' : ''}`}>
                        <Form.Select aria-label="Client" name='customer' value={formValue?.customer ?? ""} onChange={handleChange} disabled={isFromJob}>
                            <option key={0} value="">Select Customer</option>
                            {customerList?.length > 0 && sortObjectsByAttribute(customerList).map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>

                <div className={`addCust pe-4 ${isFieldMandatory('project') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Job${isFieldMandatory('project') ? ' *' : ''}`}>
                        <Form.Select aria-label="Job" name='project' value={formValue?.project ?? ""} onChange={handleChange} disabled={isFromJob}>
                            <option key={0} value="">Select Job</option>
                            {jobs?.length > 0 && sortObjectsByAttribute(jobs).map((item) => {
                                    return <option key={item.id} value={item.id}>{item.name}</option>
                                })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.project ? <span className='ms-2 text-danger'>{formError?.project}</span> : null}
                </div>

                <div className={`addCust  ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Task Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' value={formValue?.name ?? ""} onChange={handleChange} />
                    </FloatingLabel>
                    {formError?.name ? <span className='ms-2 text-danger'>{formError?.name}</span> : null}
                </div>

                <div className={`w-50 addCust pe-4 ${isFieldMandatory('description') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Task Details${isFieldMandatory('description') ? ' *' : ''}`} className='textarea-label'>
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '30px', margin: 0 }}
                            name='description'
                            value={formValue?.description ?? ""} 
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                </div>

                <div className={`w-50 addCust ${isFieldMandatory('service_type') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Service Type${isFieldMandatory('service_type') ? ' *' : ''}`}>
                        <Form.Select aria-label="SERVICE TYPE *" name='service_type' value={formValue?.service_type ?? ""} onChange={handleChange}>
                            <option key={0} value="">Select Service Type</option>
                            {serviceTypes?.length > 0 && sortObjectsByAttribute(serviceTypes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.service_type ? <span className='ms-2 text-danger'>{formError?.service_type}</span> : null}
                </div>

                <div className={`w-50 addCust pe-4 ${isFieldMandatory('desired_due_date') ? 'mandatory-field' : ''}`}>
                    <div className='myInputBox'>
                        <label style={{ display: "block" }}>Desired Due Date</label>
                        <DatePicker
                            value={desiredDueDate ? dayjs(desiredDueDate, "MM/DD/YYYY") : ""}
                            onChange={handleDesiredDateChange}
                            name='desired_due_date'
                            format="MM/DD/YYYY"
                            placeholder="MM/DD/YYYY"
                            className='myDatePicker'
                        />
                    </div>
                </div>

                <div className='w-50 addCust'>
                    <div className='myInputBox'>
                        <label style={{ display: "block" }}>Date Completed</label>
                        <DatePicker
                            value={deadlineDate ? dayjs(deadlineDate, "MM/DD/YYYY") : ""}
                            placeholder="MM/DD/YYYY"
                            format="MM/DD/YYYY"
                            name='completion_date'
                            onChange={handleDeadlineDateChange}
                            className='myDatePicker'

                        />
                    </div>
                </div>

                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label="Priority *">
                        <Form.Select
                            aria-label="Priority" name='priority'
                            value={formValue?.priority ?? "1"}
                            onChange={handleChange}
                        >
                            <option value="">Select Priority</option>
                            <option value="2">High</option>
                            <option value="1">Normal</option>
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.priority ? <span className='ms-2 text-danger'>{formError?.priority}</span> : null}
                </div>

                <div className={`w-50 addCust`}>
                    <div className='d-flex gap-4'>
                        <div className='w-50 custom-h-t'>
                            <FloatingLabel label="Estimated Duration">
                                <Form.Select
                                    aria-label="estimated_duration_hrs"
                                    name='estimated_duration_hrs'
                                    value={formValue?.estimated_duration_hrs ?? ""}
                                    onChange={handleChange}
                                >
                                    <option value="" key={0}>Hours</option>
                                    {generateNumberArray(0, 48, 1).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel >
                                <Form.Select
                                    aria-label="estimated_duration_mins"
                                    name='estimated_duration_mins'
                                    value={formValue?.estimated_duration_mins ?? ""}
                                    onChange={handleChange}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>

                        <div className='w-50 custom-h-t'>
                            <FloatingLabel label="Actual Duration">
                                <Form.Select
                                    aria-label="actual_duration_hrs"
                                    name='actual_duration_hrs'
                                    value={formValue?.actual_duration_hrs ?? ""}
                                    onChange={handleChange}
                                >
                                    <option value="" key={0}>Hours</option>
                                    {generateNumberArray(0, 48, 1).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                            <FloatingLabel >
                                <Form.Select
                                    aria-label="actual_duration_mins"
                                    name='actual_duration_mins'
                                    value={formValue?.actual_duration_mins ?? ""}
                                    onChange={handleChange}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                    </div>
                </div>
                <AddAssignedUser
                    assignedUsers={assignedUsers}
                    setAssignedUsers={setAssignedUsers}
                    assignedDueDate={assignedDueDate}
                    setAssignedDueDate={setAssignedDueDate}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
            </div>
        </div>
    );
}

export default TaskForm;
