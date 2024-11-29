/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import dayjs from "dayjs"
import 'dayjs/locale/en';
import { IoIosCloseCircle } from "react-icons/io";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { DatePicker } from 'antd';
import Button from '../../commonModules/UI/Button';
import { cardTypes } from '../../../Utils/staticdata';
import { sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { fetchCities, fetchCountries, fetchStates } from '../../../API/authCurd';

function numCheck(e) {
    const characters = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', ')', '(', '-', '=', '_', '+',
        '>', '<', '?', '/', ':', ';', '|', '\\', ']', '}', '[', '{', "'", '"', ' ', '.', ","
    ];
    if (characters.includes(e.key)) e.preventDefault();
}

const CreditCardForm = ({ onCancel, values, setValues, onSubmit, formType = "Add", formErrors, setFormErrors }) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);

    const getCountries = () => {
        fetchCountries().then((res) => {
            if (res.data?.countries) { setCountries(res.data?.countries) }
        }).catch(() => { setCountries([]) })
    }

    const getStates = () => {
        return fetchStates().then((res) => {
            if (formType == "Add") { setValues((prev) => ({ ...prev, country: "1" })) }
            if (res.data?.states) { setStates(res.data?.states) }
        }).catch(() => { setStates([]) })
    }

    const getCities = () => {
        fetchCities().then((res) => {
            if (res.data?.cities) { setCities(res.data?.cities) }
        }).catch(() => { setCities([]) })
    }

    useEffect(() => {
        getCountries()
        getStates()
        getCities()
    }, [])

    useEffect(() => {
        if (values?.country) {
            let filteredStates = states.filter((state) => values.country == state.country_id)
            setStateList(filteredStates)
        } else {
            setStateList([])
            setCityList([])
        }
        if (values?.state) {
            let filteredCities = cities.filter((city) => values.state == city.state_id)
            setCityList(filteredCities)
        } else {
            setCityList([])
        }
    }, [values, cities, states, countries]);

    useEffect(() => {
        if (values?.country == "") {
            setValues({ ...values, state: "", city: "" })
        }
    }, [values?.country])

    useEffect(() => {
        if (values?.state == "") {
            setValues({ ...values, city: "" })
        }
    }, [values?.state])

    const disabledDate = (current) => {
        const currentDate = dayjs();
        if (current) {
            const parsedCurrent = dayjs(current, 'MM/YY');
            const startOfMonth = parsedCurrent.startOf('month');
            return currentDate.isAfter(startOfMonth) && !parsedCurrent.isSame(currentDate, 'month');
        }

        return false;
    };

    const onChangeHandler = (e) => {
        let errors = formErrors
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        setFormErrors(errors)
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const creditCardExpDateOnChangeHandler = (value, datestring) => {
        let errors = formErrors
        if (errors.hasOwnProperty("exp_month_year")) {
            delete errors["exp_month_year"]
        }
        setFormErrors(errors)
        setValues((prev) => ({ ...prev, exp_month_year: datestring }))
    }

    useEffect(() => {

    }, [])

    return (
        <div className={`centerpopups`}>
            <form>
                <div className='popups d-flex justify-content-center align-items-center'>
                    <div className='addpopups add-creditcard-modal'>
                        <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                            <div>{formType} Credit Card</div>
                            <div className='myIcon' type='button' onClick={onCancel}>
                                <IoIosCloseCircle style={{ width: '28px' }} />
                            </div>
                        </div>
                        <div className='popBody p-3'>
                            <div className='d-flex flex-wrap w-100'>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="Card Number *" className='flex-item'>
                                        <Form.Control
                                            type="text"
                                            name='credit_card_no'
                                            value={values?.credit_card_no ?? ""}
                                            onKeyDown={(e) => numCheck(e)}
                                            maxLength={16}
                                            onChange={onChangeHandler}
                                        />
                                    </FloatingLabel>
                                    {formErrors?.credit_card_no ? <span className='ms-2 text-danger'>{formErrors?.credit_card_no}</span> : null}
                                </div>
                                <div className='flex-item date-cvc addCust pe-4'>
                                    <div className='w-50'>
                                        <div className='myInputBox flex-item'>
                                            <label style={{ display: "block" }}>Expiration Date *</label>
                                            <DatePicker
                                                format="MM/YY"
                                                picker="month"
                                                value={values?.exp_month_year ? dayjs(values?.exp_month_year, "MM/YY") : ""}
                                                placeholder='MM/YY'
                                                name='exp_month_year'
                                                onChange={creditCardExpDateOnChangeHandler}
                                                disabledDate={disabledDate}
                                                className='myDatePicker'
                                            />
                                        </div>
                                        {formErrors?.exp_month_year ? <span className='ms-2 text-danger'>{formErrors?.exp_month_year}</span> : null}
                                    </div>
                                    <div className='w-50'>
                                        <FloatingLabel label="CVC *" className='flex-item'>
                                            <Form.Control
                                                type="text"
                                                name='cvv'
                                                maxLength={4}
                                                value={values?.cvv ?? ""}
                                                onChange={onChangeHandler}
                                            />
                                        </FloatingLabel>
                                        {formErrors?.cvv ? <span className='ms-2 text-danger'>{formErrors?.cvv}</span> : null}
                                    </div>
                                </div>
                                <div className='addCust'>
                                    <FloatingLabel label="Type" className='flex-item'>
                                        <Form.Select
                                            name='card_type'
                                            value={values?.card_type ?? ""}
                                            onChange={onChangeHandler}
                                        >
                                            <option key={0} value="">Select Type </option>
                                            {cardTypes.map((item) => {
                                                return <option key={item.id} value={item.name}>{item.name}</option>
                                            })}
                                        </Form.Select>
                                    </FloatingLabel>
                                </div>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="Name on Card *" className='flex-item'>
                                        <Form.Control
                                            name='name_on_card'
                                            value={values?.name_on_card ?? ""}
                                            onChange={onChangeHandler}
                                        />
                                        {formErrors?.name_on_card ? <span className='ms-2 text-danger'>{formErrors?.name_on_card}</span> : null}
                                    </FloatingLabel>
                                </div>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="Country *" className='flex-item'>
                                        <Form.Select
                                            name='country'
                                            value={values?.country ?? ""}
                                            onChange={onChangeHandler}
                                        >
                                            <option key={0} value="">Select country </option>
                                            {countries?.length > 0 && sortObjectsByAttribute(countries).map((item) => {
                                                return <option key={item.country_id} value={item.country_id}>{item.name}</option>
                                            })}
                                        </Form.Select>
                                    </FloatingLabel>
                                    {formErrors?.country ? <span className='ms-2 text-danger'>{formErrors?.country}</span> : null}
                                </div>
                                <div className='addCust'>
                                    <FloatingLabel label="Street *" className='flex-item'>
                                        <Form.Control
                                            name='address'
                                            value={values?.address ?? ""}
                                            onChange={onChangeHandler}
                                        />
                                    </FloatingLabel>
                                    {formErrors?.address ? <span className='ms-2 text-danger'>{formErrors?.address}</span> : null}
                                </div>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="State *" className='flex-item'>
                                        <Form.Select
                                            name='state'
                                            value={values?.state ?? ""}
                                            onChange={onChangeHandler}
                                        >
                                            <option key={0} value="">Select State</option>
                                            {stateList?.length > 0 && sortObjectsByAttribute(stateList).map((item) => {
                                                return <option key={item.state_id} value={item.state_id}>{item.name}</option>
                                            })}
                                        </Form.Select>
                                    </FloatingLabel>
                                    {formErrors?.state ? <span className='ms-2 text-danger'>{formErrors?.state}</span> : null}
                                </div>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="City *" className='flex-item'>
                                        <Form.Select
                                            name='city'
                                            value={values?.city ?? ""}
                                            onChange={onChangeHandler}
                                        >
                                            <option key={0} value="">Select city</option>
                                            {cityList?.length > 0 && sortObjectsByAttribute(cityList).map((item) => {
                                                return <option key={item.city_id} value={item.city_id}>{item.name}</option>
                                            })}
                                        </Form.Select>
                                    </FloatingLabel>
                                    {formErrors?.city ? <span className='ms-2 text-danger'>{formErrors?.city}</span> : null}
                                </div>
                                <div className='addCust'>
                                    <FloatingLabel label="Zipcode *" className='flex-item'>
                                        <Form.Control
                                            type="text"
                                            name='zip_code'
                                            maxLength={10}
                                            value={values?.zip_code ?? ""}
                                            onChange={onChangeHandler}
                                        />
                                    </FloatingLabel>
                                    {formErrors?.zip_code ? <span className='ms-2 text-danger'>{formErrors?.zip_code}</span> : null}
                                </div>
                                <div className='addCust pe-4'>
                                    <FloatingLabel label="Notes" className='textarea-label flex-item'>
                                        <Form.Control
                                            as="textarea"
                                            style={{ height: '100px', margin: 0 }}
                                            name='card_notes'
                                            value={values?.card_notes ?? ""}
                                            onChange={onChangeHandler}
                                        />
                                    </FloatingLabel>
                                </div>
                            </div>
                        </div>
                        <div className='mt-auto popfoot w-100 p-2'>
                            <div className='d-flex align-items-center justify-content-center'>
                                <Button className="mx-4 cclBtn" onClick={onCancel}>Cancel</Button>
                                <Button type="button" onClick={onSubmit}>Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div className="blurBg"></div>
        </div>
    )
}

export default CreditCardForm