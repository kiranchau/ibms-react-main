/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import { sortByConcatenatedString, sortObjectsByAttribute } from '../../../Utils/sortFunctions';

const CustForm = (props) => {
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const mandatoryFields = ['name', 'status', 'email'];

    // Function to check if a field is mandatory
    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    useEffect(() => {
        if (props.formData?.country) {
            let states = props.states.filter((state) => props.formData.country == state.country_id)
            setStateList(states)
        } else {
            setStateList([])
            setCityList([])
        }

        if (props.formData?.state) {
            let cities = props.cities.filter((city) => props.formData.state == city.state_id)
            setCityList(cities)
        } else {
            setCityList([])
        }
    }, [props.formData])

    useEffect(() => {
        if (props.formData?.country == "") {
            props.setFormData({ ...props.formData, state: "", city: "" })
        }
    }, [props.formData.country])

    useEffect(() => {
        if (props.formData?.state == "") {
            props.setFormData({ ...props.formData, city: "" })
        }
    }, [props.formData.state])

    const onChangeHandler = (e) => {
        let errors = props.formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        props.setFormError(errors)

        props.setFormData({ ...props.formData, [e.target.name]: e.target.value })
    }

    return (
        <div className='d-flex flex-wrap w-100'>
            <div className={`addCust pe-4 ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                <FloatingLabel label={`Name${isFieldMandatory('name') ? ' *' : ''}`}>
                    <Form.Control
                        type="text" placeholder="Name" name='name'
                        value={props.formData?.name ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
                {props.formError?.name && <span className='ms-2 text-danger'>{props.formError?.name}</span>}
            </div>
            <div className={`addCust pe-4 ${isFieldMandatory('status') ? 'mandatory-field' : ''}`}>
                <FloatingLabel label={`Status${isFieldMandatory('status') ? ' *' : ''}`}>
                    <Form.Select aria-label="Floating label select example" name='status'
                        value={props.formData?.status ?? ""}
                        onChange={onChangeHandler}
                    >
                        <option key={0}>Select Status</option>
                        {props?.clientStatus?.length > 0 && sortObjectsByAttribute(props?.clientStatus)?.map((item) => {
                            return <option key={item.id} value={item.id}>{item.name}</option>
                        })}
                    </Form.Select>
                </FloatingLabel>
                {props.formError?.status && <span className='ms-2 text-danger'>{props.formError?.status}</span>}
            </div>
            <div className={`addCust ${isFieldMandatory('email') ? 'mandatory-field' : ''}`}>
                <FloatingLabel label={`Email${isFieldMandatory('email') ? ' *' : ''}`}>
                    <Form.Control
                        type="text" placeholder="Email" name='email'
                        value={props.formData?.email ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
                {props.formError?.email && <span className='ms-2 text-danger'>{props.formError?.email}</span>}
            </div>
            <div className='addCust pe-4'>
                <FloatingLabel label="Website">
                    <Form.Control
                        type="text" placeholder="Website" name='website'
                        value={props.formData?.website ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
                {props.formError?.website && <span className='ms-2 text-danger'>{props.formError?.website}</span>}
            </div>

          
            <div className='d-flex addCust pe-4 gap-3'>
                <div className={` w-100 ${isFieldMandatory('phone') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Phone Number${isFieldMandatory('phone') ? ' *' : ''}`}>
                        <Form.Control
                            type="tel" placeholder="Phone Number" name='phone'
                            value={props.formData?.phone ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                    {props.formError?.phone && <span className='ms-2 text-danger'>{props.formError?.phone}</span>}
                </div>
                <div className='addcust w-100'>
                    <FloatingLabel label="Phone Type">
                        <Form.Select
                            aria-label="Floating label select example" name='type'
                            value={props.formData?.type ?? ""}
                            onChange={onChangeHandler}
                            className="phone-select w-100"
                        >
                            <option value="">Phone Type</option>
                            <option value="4">Fax</option>
                            <option value="3">Home</option>
                            <option value="1">Mobile</option>
                            <option value="2">Office</option>
                        </Form.Select>
                    </FloatingLabel>
                    {props.formError?.type ? <span className='ms-2 text-danger'>{props.formError?.type}</span> : null}
                </div>
            </div>
 
            <div className='addCust '>
                <FloatingLabel label={`Country${isFieldMandatory('country') ? ' *' : ''}`}>
                    <Form.Select
                        name='country'
                        value={props.formData?.country ?? ""}
                        onChange={onChangeHandler}
                    >
                        <option key={0} value="">Select country</option>
                        {props?.countries?.length > 0 && sortObjectsByAttribute(props?.countries).map((item) => {
                            return <option key={item.country_id} value={item.country_id}>{item.name}</option>
                        })}
                    </Form.Select>
                </FloatingLabel>
                {props.formError?.country ? <span className='ms-2 text-danger'>{props.formError?.country}</span> : null}
            </div>
            <div className='addCust pe-4'>
                <FloatingLabel label={`State${isFieldMandatory('state') ? ' *' : ''}`}>
                    <Form.Select
                        name='state'
                        value={props.formData?.state ?? ""}
                        onChange={onChangeHandler}
                    >
                        <option key={0} value="">Select State</option>
                        {stateList?.length > 0 && sortObjectsByAttribute(stateList).map((item) => {
                            return <option key={item.state_id} value={item.state_id}>{item.name}</option>
                        })}
                    </Form.Select>
                </FloatingLabel>
                {props.formError?.state ? <span className='ms-2 text-danger'>{props.formError?.state}</span> : null}
            </div>
            <div className='addCust pe-4'>
                <FloatingLabel label={`City${isFieldMandatory('city') ? ' *' : ''}`}>
                    <Form.Select
                        name='city'
                        value={props.formData?.city ?? ""}
                        onChange={onChangeHandler}
                    >
                        <option key={0} value="">Select city</option>
                        {cityList?.length > 0 && sortObjectsByAttribute(cityList).map((item) => {
                            return <option key={item.city_id} value={item.city_id}>{item.name}</option>
                        })}
                    </Form.Select>
                </FloatingLabel>
                {props.formError?.city ? <span className='ms-2 text-danger'>{props.formError?.city}</span> : null}
            </div>
            <div className='addCust'>
                <FloatingLabel label="Addresss line 1">
                    <Form.Control
                        type="text" placeholder="Address" name='address1'
                        value={props.formData?.address1 ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
            </div>
            <div className='addCust pe-4'>
                <FloatingLabel label="Address line 2">
                    <Form.Control
                        type="text" placeholder="Address Line 2" name='address2'
                        value={props.formData?.address2 ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
            </div>
            <div className='addCust pe-4'>
                <FloatingLabel label="Customer Relationship Manager">
                    <Form.Select
                        name='customer_relationship_manager_id'
                        value={props.formData?.customer_relationship_manager_id ?? ""}
                        onChange={onChangeHandler}
                    >
                        <option key={0} value="">Select Relationship Manager</option>
                        {props?.ibUsers?.length > 0 && sortByConcatenatedString(props?.ibUsers, ['first_name', 'last_name']).map((item) => {
                            return <option key={item.id} value={item.id}>{item.first_name ? item.first_name : ""} {item.last_name ? item.last_name : ""}</option>
                        })}
                    </Form.Select>
                </FloatingLabel>
            </div>
            <div className='w-50 pe-4 text-area-wrap pb-sm-3 pb-3'>
                <FloatingLabel label="Management Comments" className='textarea-label'>
                    <Form.Control
                        as="textarea"
                        placeholder="Leave a comment here"
                        style={{ height: '100px',margin:0 }}
                        name='management_comment'
                        value={props.formData?.management_comment ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
            </div>
            <div className='w-50 addCust text-area-wrap'>
                <FloatingLabel label="Contract Terms" className='textarea-label'>
                    <Form.Control
                        as="textarea"
                        placeholder="Leave a comment here"
                        style={{ height: '100px',margin:0 }}
                        name='contract_term'
                        value={props.formData?.contract_term ?? ""}
                        onChange={onChangeHandler}
                    />
                </FloatingLabel>
            </div>
        </div>
    );
}

export default CustForm;
