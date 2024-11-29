/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import '../../SCSS/popups.scss';
import { convertDateFormatTwo } from '../../../Utils/dateFormat';
import { billingFrequency, billingTypes, billingTypesTwo, clientJobRequestStatus } from '../../../Utils/staticdata';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
import { deleteJobDocument, uploadJobDocument } from '../../../API/authCurd';
import { convertToHHMM, downloadFile, generateNumberArray, hoursRemaining, numCheck } from '../../../Utils/helpers';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';

const ConvertToJobForm = ({ formValues, setFormValues, customerList, formError, setFormError, jobCodes }) => {
    const onChangeHandler = (e) => {
        let errors = formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        if(e.target.name == "projected_hours_hrs" || e.target.name == "projected_hours_mins"){
            delete errors["projected_hours"];
        }
        setFormError(errors)

        if (e.target.name == "number_of_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), formValues.hours_used)
            setFormValues({ ...formValues, number_of_hours: e.target.value, hours_remaining: hrsRemaining });
        } else if (e.target.name == "max_hours") {
            let hrsRemaining = hoursRemaining(convertToHHMM(e.target.value), formValues.hours_used)
            setFormValues({ ...formValues, max_hours: e.target.value, hours_remaining: hrsRemaining });
        } else {
            setFormValues({ ...formValues, [e.target.name]: e.target.value })
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

    return (
        <>
            <div className='d-flex flex-wrap w-100'>
                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label={`Job Code *`}>
                        <Form.Select aria-label="Job Code" name='type' value={formValues?.type ?? ""} onChange={onChangeHandler}>
                            <option key={0} value="">Assign Code</option>
                            {jobCodes?.length > 0 && sortObjectsByAttribute(jobCodes).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.type ? <span className='ms-2 text-danger'>{formError?.type}</span> : null}
                </div>

                <div className={`addCust w-50`}>
                    <FloatingLabel label={`Billing Type *`}>
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

                <div className='d-flex w-100 hours-time-wrap flex-wrap flex-sm-nowrap'>
                    {((formValues?.billing_type == 3 || formValues?.billing_type == 4) && (formValues?.type != 6) ) && <div className='pe-4 w-50'>
                        <div className='custom-h-t'>
                            <FloatingLabel label="Projected Hours *">
                                <Form.Select
                                    aria-label="actual_duration_hrs"
                                    name='projected_hours_hrs'
                                    value={formValues?.projected_hours_hrs ?? ""}
                                    onChange={onChangeHandler}
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
                                    value={formValues?.projected_hours_mins ?? ""}
                                    onChange={onChangeHandler}
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
                    {/* show if 'Lump Sum / Non Hourly Billing' is selected */}
                    {formValues?.billing_type == 3 && <div className='w-50'>
                        <FloatingLabel label="Dollar Amount *">
                            <Form.Control
                                type='number'
                                aria-label="dollar ammount"
                                name='job_amount'
                                min={0}
                                value={formValues?.job_amount ?? ""} onChange={onChangeHandler}
                                step={0.01}
                                onKeyDown={(e) => numCheck(e)}
                            />
                        </FloatingLabel>
                        {formError?.job_amount ? <span className='ms-2 text-danger'>{formError?.job_amount}</span> : null}
                    </div>}

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
            </div>
        </>
    );
}

export default ConvertToJobForm;