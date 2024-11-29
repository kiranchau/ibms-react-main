/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import { DatePicker } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import { billingFrequency, billingTypes, billingTypesTwo, jobStatuses, recurrenceFrequency } from '../../../Utils/staticdata';
import { convertToHHMM, generateNumberArray, hoursRemaining, numCheck } from '../../../Utils/helpers';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { sortByConcatenatedString, sortObjectsByAttribute } from '../../../Utils/sortFunctions';

const JobForm = ({ jobCodes, customerList, responsibleUser, formError, setFormError, formValues, setFormValues, dueDate, setDueDate, deadlineDate, setDeadlineDate, recurringJob, setRecurringJob, desiredStartDate, setDesiredStartDate }) => {
    const mandatoryFields = ['name', 'customer', 'type', 'billing_type', 'assigned_user_id'];

    const onChangeHandler = (e) => {
        let errors = formError;
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name];
        }
        if(e.target.name == "projected_hours_hrs" || e.target.name == "projected_hours_mins"){
            delete errors["projected_hours"];
        }
        setFormError(errors);
        if (e.target.name == "number_of_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), formValues.hours_used)
            setFormValues({ ...formValues, number_of_hours: e.target.value, hours_remaining: hrsRemaining });
        } else if (e.target.name == "max_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), formValues.hours_used)
            setFormValues({ ...formValues, max_hours: e.target.value, hours_remaining: hrsRemaining });
        } else {
            setFormValues({ ...formValues, [e.target.name]: e.target.value });
        }
    }

    const checkBoxChangeHandler = (e, item) => {
        let errors = formError;
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name];
        }
        setFormError(errors);
        setFormValues({ ...formValues, unlimited_hours: !formValues.unlimited_hours })
    }

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    // Handler function to update due date
    const handleDueDateChange = (date) => {
        setDueDate(date);
    };
    // Handler function to update due date
    const handleDeadlineDateChange = (date) => {
        setDeadlineDate(date);
    };
    // Handler function desired start date
    const handleDesiredStartDateChange = (date) => {
        setDesiredStartDate(date);
    };

    const handleRecurringJobChange = () => { setRecurringJob(!recurringJob) }

    return (
        <>
            <div className='d-flex flex-wrap w-100 '>
                <div className='w-50  pe-4 addCust'>
                    <FloatingLabel label={`Customer${isFieldMandatory('customer') ? ' *' : ''}`}>
                        <Form.Select aria-label="Client" name='customer' value={formValues?.customer ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Select Customer</option>
                            {customerList?.length > 0 && sortObjectsByAttribute(customerList).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>
                <div className='w-50  addCust'>
                    <FloatingLabel label={`Job Code${isFieldMandatory('type') ? ' *' : ''}`}>
                        <Form.Select aria-label="Job Code" name='type' value={formValues?.type ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Assign Code</option>
                            {jobCodes?.length > 0 && sortObjectsByAttribute(jobCodes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.type ? <span className='ms-2 text-danger'>{formError?.type}</span> : null}
                </div>

                <div className='w-50  pe-4 addCust'>
                    <FloatingLabel label={`Job Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' value={formValues?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name && <span className='ms-2 text-danger'>{formError?.name}</span>}
                </div>
                <div className='w-50  addCust'>
                    <FloatingLabel label="Job Description (will appear on customer invoice)" className='textarea-label'>
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '45px', marginTop: "0px" }}
                            name='description'
                        />
                    </FloatingLabel>
                </div>
                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label={`Responsible User${isFieldMandatory('assigned_user_id') ? ' *' : ''}`}>
                        <Form.Select aria-label="Responsible User" name='assigned_user_id' value={formValues?.assigned_user_id ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Select responsible user</option>
                            {responsibleUser?.length > 0 && sortByConcatenatedString(responsibleUser, ['abv', 'first_name', 'last_name']).map((item) => {
                                return <option key={item.id} value={item.id}>{item?.abv ? item?.abv + " - " : ""}{item.first_name ? item.first_name : ""} {item.last_name ? item.last_name : ""}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.assigned_user_id ? <span className='ms-2 text-danger'>{formError?.assigned_user_id}</span> : null}
                </div>
                <div className='w-50  addCust'>
                    <div className='d-flex'>
                        <div className='w-50 pe-4'>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Project Deadline</label>
                                <DatePicker
                                    onChange={handleDeadlineDateChange}
                                    value={deadlineDate ? dayjs(deadlineDate, "MM/DD/YYYY") : ""}
                                    name='deadline'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>
                        {(formValues?.type == 6) && <div className='w-50 pe-4'>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Desired Start Date</label>
                                <DatePicker
                                    onChange={handleDesiredStartDateChange}
                                    value={desiredStartDate ? dayjs(desiredStartDate, "MM/DD/YYYY") : ""}
                                    name='desired_start_date'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>}
                        <div className='w-50 '>
                            <div className='myInputBox'>
                                <label style={{ display: "block" }}>Desired Due Date</label>
                                <DatePicker
                                    selected={dueDate}
                                    onChange={handleDueDateChange}
                                    value={dueDate ? dayjs(dueDate, "MM/DD/YYYY") : ""}
                                    name='desired_due_date'
                                    format="MM/DD/YYYY"
                                    placeholder="MM/DD/YYYY"
                                    className='myDatePicker'
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-50 pe-4 addCust'>
                    <FloatingLabel label="Priority *">
                        <Form.Select
                            aria-label="Priority"
                            name='priority'
                            value={formValues?.priority ?? "1"}
                            onChange={onChangeHandler}
                        >
                            <option value="">Select Priority</option>
                            <option value="2">High</option>
                            <option value="1">Normal</option>
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.priority ? <span className='ms-2 text-danger'>{formError?.priority}</span> : null}
                </div>
                <div className='w-50  addCust'>
                    <FloatingLabel label="Status *">
                        <Form.Select
                            aria-label="status"
                            name='status'
                            value={formValues?.status ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option value="">Select Status</option>
                            {jobStatuses?.length > 0 && sortObjectsByAttribute(jobStatuses).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.status ? <span className='ms-2 text-danger'>{formError?.status}</span> : null}
                </div>
                <div className='recurring-job w-100'>
                    <Form.Check // prettier-ignore
                        type='checkbox'
                        label='Recurring Job'
                        name='recurring_job'
                        checked={recurringJob}
                        value={recurringJob}
                        onChange={handleRecurringJobChange}
                    />
                    <div>
                        {recurringJob ?
                        <div className='d-flex flex-wrap'>
                            <div className='w-50 addCust pe-4'>
                                <FloatingLabel label="Recurrence is on">
                                    <Form.Select aria-label="Recurrence is on" name='recurrence_on'>
                                        <option value="">Select day of the month</option>
                                        {generateNumberArray(1, 31, 1).map((item, index) => {
                                            return <option value={item} key={index}>{item}</option>
                                        })}
                                    </Form.Select>
                                </FloatingLabel>
                                </div>
                                <div className='w-50 addCust'>
                                <FloatingLabel label="Recurrence Frequency" className=''>
                                    <Form.Select aria-label="Recurrence Frequency" name='recurrence_frequency'>
                                        <option key={0} value="">Select the frequency</option>
                                        {recurrenceFrequency?.length > 0 && recurrenceFrequency.map((item) => {
                                            return <option key={item.id} value={item.id}>{item.name}</option>
                                        })}
                                    </Form.Select>
                                </FloatingLabel>
                            </div>
                            </div>
                            : null}
                    </div>
                </div>
                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label={`Billing Type${isFieldMandatory('billing_type') ? ' *' : ''}`}>
                        <Form.Select aria-label="Responsible User" name='billing_type' value={formValues?.billing_type ?? ""} onChange={onChangeHandler}>
                            <option value="">Select billing type</option>
                            {formValues?.type == 6 ? sortObjectsByAttribute(billingTypesTwo).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            }) : sortObjectsByAttribute(billingTypes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.billing_type ? <span className='ms-2 text-danger'>{formError?.billing_type}</span> : null}
                </div>
                <div className='d-flex w-50 hours-time-wrap flex-wrap flex-sm-nowrap'>
                    {((formValues?.billing_type == 3 || formValues?.billing_type == 4) && (formValues?.type != 6)) && <div className=' mb-md-0 mb-3 w-sm-50  w-100'>
                        <div className='custom-h-t'>
                            <FloatingLabel label="Projected Hours *">
                                <Form.Select
                                    aria-label="actual_duration_hrs"
                                    name='projected_hours_hrs'
                                    onChange={onChangeHandler}
                                    value={formValues?.projected_hours_hrs ?? ""}
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
                                    name='projected_hours_mins'
                                    onChange={onChangeHandler}
                                    value={formValues?.projected_hours_mins ?? ""}
                                >
                                    <option value="" key={0}>Minutes</option>
                                    {generateNumberArray(0, 45, 15).map((item, index) => {
                                        return <option value={item} key={index}>{item}</option>
                                    })}
                                </Form.Select>
                            </FloatingLabel>
                        </div>
                        {formError?.projected_hours ? <span className='ms-2 text-danger'>{formError?.projected_hours}</span> : null}
                    </div>}

                    {formValues?.billing_type == 3 && <div className='w-sm-50  w-100 ps-sm-4 ps-0'>
                        <FloatingLabel label="Dollar Amount *">
                            <Form.Control
                                type='number'
                                aria-label="dollar amount"
                                name='job_amount' min={0}
                                onChange={onChangeHandler}
                                value={formValues?.job_amount ?? ""}
                                step={0.01}
                                onKeyDown={(e)=>numCheck(e)}
                            />
                        </FloatingLabel>
                        {formError?.job_amount ? <span className='ms-2 text-danger'>{formError?.job_amount}</span> : null}
                    </div>}
                </div>

                {(formValues?.billing_type == 5) && <div className='w-50 pe-4 addCust'>
                    <FloatingLabel label="Number Of Hours">
                        <Form.Control
                            type={formValues.unlimited_hours ? "text" : 'number'}
                            aria-label="number_of_hours"
                            name='number_of_hours'
                            min={0}
                            step={0.01}
                            value={formValues.unlimited_hours ? "Unlimited" : formValues?.number_of_hours ?? "0"}
                            onChange={onChangeHandler}
                            readOnly={formValues.unlimited_hours ? true : false}
                        />
                    </FloatingLabel>
                    <Form.Check
                        type="checkbox"
                        name='unlimited_hours'
                        label={`Unlimited Hours`}
                        checked={formValues.unlimited_hours == 1 ? true : false}
                        value={formValues.unlimited_hours == 1 ? true : false}
                        onChange={checkBoxChangeHandler}
                    />
                </div>}

                {(formValues?.billing_type == 6) && <>
                    <div className='w-50 pe-4 addCust'>
                        <FloatingLabel label="Billing Frequency">
                            <Form.Select
                                aria-label="billing_frequency"
                                name='billing_frequency'
                                value={formValues?.billing_frequency ?? ""}
                                onChange={onChangeHandler}
                            >
                                <option value="">Select frequency type</option>
                                {billingFrequency?.length > 0 && billingFrequency.map((item) => {
                                    return <option key={item.id} value={item.id}>{item.name}</option>
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </div>

                    <div className='w-50 pe-4 addCust'>
                        <FloatingLabel label="Max Hours">
                            <Form.Control
                                type='number'
                                aria-label="max_hours"
                                name='max_hours'
                                min={0}
                                step={0.01}
                                value={formValues?.max_hours ?? ""}
                                onChange={onChangeHandler}
                            />
                        </FloatingLabel>
                    </div>
                </>}

                {(formValues?.billing_type == 5 || formValues?.billing_type == 6) && <>
                    <div className='w-50 pe-4 addCust'>
                        <FloatingLabel label="Hours Used">
                            <Form.Control
                                type='text'
                                aria-label="hours_used"
                                name='hours_used'
                                value={formValues?.hours_used ?? "0:0"}
                                onChange={onChangeHandler}
                                readOnly={true}
                            />
                        </FloatingLabel>
                    </div>

                    <div className='w-50 pe-4 addCust'>
                        <FloatingLabel label="Hours Remaining">
                            <Form.Control
                                type='text'
                                aria-label="hours_remaining"
                                name='hours_remaining'
                                value={formValues.unlimited_hours ? "Unlimited" : formValues?.hours_remaining ?? "0"}
                                onChange={onChangeHandler}
                                readOnly={true}
                            />
                        </FloatingLabel>
                    </div>
                </>}
            </div>
        </>
    );
}

export default JobForm;
