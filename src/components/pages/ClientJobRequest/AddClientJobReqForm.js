/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useContext } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import '../../SCSS/popups.scss';
import { convertDateFormatTwo } from '../../../Utils/dateFormat';
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';

const AddClientJobReqForm = ({ formValues, setFormValues, customerList, formError, setFormError }) => {
    const mandatoryFields = ['name', 'customer'];
    let userCustomerId = localStorage.getItem("customerId")
    let userType = localStorage.getItem("usertype")
    const { companies } = useContext(GlobalSearch)

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    const onChangeHandler = (e) => {
        let errors = formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        setFormError(errors)

        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }

    // Handler function to update due date
    const handleDueDateChange = (date) => {
        setFormValues({ ...formValues, desired_due_date: convertDateFormatTwo(date) })
    };

    return (
        <>
            <div className='d-flex flex-wrap w-100'>
                <div className={`addCust w-50 ${isFieldMandatory('customer') ? 'mandatory-field' : ''} pe-4`}>
                    <FloatingLabel label={`Company ${isFieldMandatory('customer') ? ' *' : ''}`} className='custom-select'>
                        <Form.Select
                            aria-label="Client"
                            name='customer'
                            value={formValues?.customer ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value="">Select Company</option>
                            {(userType == "3" && companies?.length > 0) ? sortObjectsByAttribute(companies).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            }) : sortObjectsByAttribute(customerList).map((item) => {
                                return <option key={item.id} value={item.id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.customer ? <span className='ms-2 text-danger'>{formError?.customer}</span> : null}
                </div>

                <div className={`addCust w-50  pe-4 ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Job Name ${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type="text" placeholder="Job Name" name='name' value={formValues?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name ? <span className='ms-2 text-danger'>{formError?.name}</span> : null}
                </div>

                <div className='w-50 addCust pe-4'>
                    <FloatingLabel label="Job Description" className='textarea-label'>
                        <Form.Control
                            as="textarea" value={formValues?.description ?? ""} onChange={onChangeHandler}
                            placeholder="Leave a comment here"
                            style={{ minHeight: '45px', marginTop: "0px" }}
                            name='description' />
                    </FloatingLabel>
                </div>

                <div className='w-50 addCust'>
                    <div className='w-50'>
                        <div className='myInputBox'>
                            <label styl={{ display: "block" }}>Desired Due Date</label>
                            <DatePicker
                                value={formValues?.desired_due_date ? dayjs(formValues?.desired_due_date, "MM/DD/YYYY") : ""}
                                onChange={handleDueDateChange}
                                name='desired_due_date'
                                format="MM/DD/YYYY"
                                placeholder="MM/DD/YYYY"
                                className='myDatePicker'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddClientJobReqForm;