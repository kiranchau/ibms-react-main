/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import Accordian from '../../commonModules/UI/Acordian';
import Accordion from 'react-bootstrap/Accordion';
import UploadFiles from '../../commonModules/UI/UploadFiles';
import ServiceRate from '../../commonModules/UI/ServiceRate'
import { removeClientLogo, uploadClientLogo } from '../../../API/authCurd';
import { checkPermission, updateStateByCondition } from '../../../Utils/helpers';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import { sortByConcatenatedString, sortObjectsByAttribute } from '../../../Utils/sortFunctions';
import { logoImageExt } from '../../../Utils/staticdata';

const UpadateForm = ({ updatedData, setUpdatedData, paymentTerms, clientStatus, countries, states, cities, ibUsers, formError, setFormError, selectedCustomer, setUserDetail, creditFormError, setCreditFormError, creditEditFormError, setCreditEditFormError, creditAddFormValue, setCreditAddFormValue, creditEditFormValue, setCreditEditFormValue, creditIsEditMode, setCreditIsEditMode, formRef }) => {
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [showCreditCard, setShowCreditCard]=useState(false)
    const [showServiceRates, setShowServiceRates]=useState(false)

    const mandatoryFields = ['name', 'status', 'email'];

    const isFieldMandatory = (fieldName) => mandatoryFields.includes(fieldName);

    useEffect(() => {
        setShowCreditCard(checkPermission('Customer Credit Cards'))
        setShowServiceRates(checkPermission('Customer Service Rates'))
    }, [])

    useEffect(() => {
        if (updatedData?.country) {
            let filteredStates = states.filter((state) => updatedData.country == state.country_id)
            setStateList(filteredStates)
        } else {
            setStateList([])
            setCityList([])
        }
        if (updatedData?.state) {
            let filteredCities = cities.filter((city) => updatedData.state == city.state_id)
            setCityList(filteredCities)
        } else {
            setCityList([])
        }
    }, [updatedData, cities, states, countries]);

    useEffect(() => {
        if (updatedData?.country == "") {
            setUpdatedData({ ...updatedData, state: "", city: "" })
        }
    }, [updatedData?.country])

    useEffect(() => {
        if (updatedData?.state == "") {
            setUpdatedData({ ...updatedData, city: "" })
        }
    }, [updatedData?.state])

    useEffect(() => {
        if (selectedCustomer) {
            if (selectedCustomer.customer_logo) {
                setFileList([{
                    uid: selectedCustomer.id,
                    name: 'Logo',
                    status: 'done',
                    url: selectedCustomer.customer_logo,
                    thumbUrl: selectedCustomer.customer_logo
                }])
            } else {
                setFileList([])
            }
        }
    }, [selectedCustomer])

    const onChangeHandler = (e) => {
        let errors = formError
        if (errors.hasOwnProperty(e.target.name)) {
            delete errors[e.target.name]
        }
        setFormError(errors)
        setUpdatedData({ ...updatedData, [e.target.name]: e.target.value })
    }

    // Logo upload method
    const logoUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        // const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        const fileType = data.file?.type
        if (fileType.startsWith("image")) {
            const formData = new FormData()
            formData.append('customer_logo', data.file)
            formData.append('customer_id', selectedCustomer.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadClientLogo(formData, config).then((res) => {
                updateStateByCondition(setUserDetail,
                    detail => detail.id === selectedCustomer.id,
                    ["customer_logo"],
                    res.data?.customer_logo ? res.data?.customer_logo : ""
                )
                onSuccess("uploaded")
            }).catch(() => {
                onError({ message: "Failed to upload logo" })
            })
        } else {
            onError({ message: "The customer logo field must be an image" })
        }
    }

    // Logo onchange Handler
    const logoOnChangehandler = (e) => {
        setFileList([e.file])
    }

    // Delete logo function
    function deleteLogo(id) {
        removeClientLogo(id).then((res) => {
            updateStateByCondition(
                setUserDetail,
                detail => detail.id === selectedCustomer.id,
                ["customer_logo"],
                "")
            setFileList([])
        }).catch(err => { })
    }

    const onRemoveHandler = (file) => {
        let isConfirm = confirmDelete("logo")
        if (isConfirm) {
            deleteLogo(selectedCustomer.id)
        }
    }

    return (
        <>
            <div className='d-flex flex-wrap w-100' ref={formRef}>
                <div className={`addCust pe-4 ${isFieldMandatory('name') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Name${isFieldMandatory('name') ? ' *' : ''}`}>
                        <Form.Control type='text' name='name' value={updatedData?.name ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.name && <span className='ms-2 text-danger'>{formError?.name}</span>}
                </div>
                <div className={`addCust pe-4 ${isFieldMandatory('status') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Status${isFieldMandatory('status') ? ' *' : ''}`}>
                        <Form.Select
                            aria-label='Floating label select example'
                            name='status'
                            value={updatedData?.status ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value=''>
                                Select Status
                            </option>
                            {clientStatus?.length > 0 &&
                                sortObjectsByAttribute(clientStatus).map((item) => {
                                    return (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    );
                                })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.status && <span className='ms-2 text-danger'>{formError?.status}</span>}
                </div>
                <div className={`addCust ${isFieldMandatory('email') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Email${isFieldMandatory('email') ? ' *' : ''}`}>
                        <Form.Control type='text' name='email' value={updatedData?.email ?? ""} onChange={onChangeHandler} />
                    </FloatingLabel>
                    {formError?.email && <span className='ms-2 text-danger'>{formError?.email}</span>}
                </div>
                <div className='addCust pe-4'>
                    <FloatingLabel label="Website">
                        <Form.Control
                            type="text" name='website'
                            value={updatedData?.website ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                    {formError?.website && <span className='ms-2 text-danger'>{formError?.website}</span>}
                </div>
                <div className='d-flex addCust pe-4 gap-3'>
                    <div className={` pe-md-4 pe-0 w-100 ${isFieldMandatory('phone') ? 'mandatory-field' : ''}`}>
                        <FloatingLabel label={`Phone Number${isFieldMandatory('phone') ? ' *' : ''}`}>
                            <Form.Control type='tel' name='phone' value={updatedData?.phone ?? ""} onChange={onChangeHandler} />
                        </FloatingLabel>
                        {formError?.phone && <span className='ms-2 text-danger'>{formError?.phone}</span>}
                    </div>
                    <div className='addcust w-100'>
                        <FloatingLabel label="Phone Type">
                            <Form.Select
                                aria-label="Floating label select example" name='type'
                                value={updatedData?.type ?? ""}
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
                        {formError?.type ? <span className='ms-2 text-danger'>{formError?.type}</span> : null}
                    </div>
                </div>
                <div className={`addCust  ${isFieldMandatory('country') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`Country${isFieldMandatory('country') ? ' *' : ''}`}>
                        <Form.Select
                            name='country'
                            value={updatedData?.country ?? ""}
                            onChange={onChangeHandler}

                        >
                            <option key={0} value="">Select country</option>
                            {countries?.length > 0 && sortObjectsByAttribute(countries).map((item) => {
                                return <option key={item.country_id} value={item.country_id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.country ? <span className='ms-2 text-danger'>{formError?.country}</span> : null}
                </div>
               

               
                <div className={`addCust pe-4 ${isFieldMandatory('state') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`State${isFieldMandatory('state') ? ' *' : ''}`}>
                        <Form.Select
                            name='state'
                            value={updatedData?.state ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value="">Select State</option>
                            {stateList?.length > 0 && sortObjectsByAttribute(stateList).map((item) => {
                                return <option key={item.state_id} value={item.state_id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.state ? <span className='ms-2 text-danger'>{formError?.state}</span> : null}
                </div>
                <div className={`addCust pe-4  ${isFieldMandatory('city') ? 'mandatory-field' : ''}`}>
                    <FloatingLabel label={`City${isFieldMandatory('city') ? ' *' : ''}`}>
                        <Form.Select
                            name='city'
                            value={updatedData?.city ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value="">Select city</option>
                            {cityList?.length > 0 && sortObjectsByAttribute(cityList).map((item) => {
                                return <option key={item.city_id} value={item.city_id}>{item.name}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                    {formError?.city ? <span className='ms-2 text-danger'>{formError?.city}</span> : null}
                </div>
                <div className='addCust'>
                    <FloatingLabel label="Addresss line 1">
                        <Form.Control
                            type="text" name='address1'
                            value={updatedData?.address1 ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                </div>
                <div className='addCust pe-4'>
                    <FloatingLabel label="Address line 2">
                        <Form.Control
                            type="text" name='address2'
                            value={updatedData?.address2 ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                </div>
                <div className='addCust pe-4'>
                    <FloatingLabel label="Customer Relationship Manager">
                        <Form.Select
                            name='customer_relationship_manager_id'
                            value={updatedData?.customer_relationship_manager_id ?? ""}
                            onChange={onChangeHandler}
                        >
                            <option key={0} value="">Select Relationship Manager</option>
                            {ibUsers?.length > 0 && sortByConcatenatedString(ibUsers, ['first_name', 'last_name']).map((item) => {
                                return <option key={item.id} value={item.id}>{item.first_name ? item.first_name : ""} {item.last_name ? item.last_name : ""}</option>
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </div>
                <div className='w-50 pe-4 addCust text-area-wrap'>
                    <FloatingLabel label="Management Comments" className='textarea-label'>
                        <Form.Control
                            as="textarea"
                            style={{ height: '100px',margin:0 }}
                            name='management_comment'
                            value={updatedData?.management_comment ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                </div>
                <div className='w-50 addCust text-area-wrap'>
                    <FloatingLabel label="Contract Terms" className='textarea-label'>
                        <Form.Control
                            as="textarea"
                            style={{ height: '100px',margin:0 }}
                            name='contract_term'
                            value={updatedData?.contract_term ?? ""}
                            onChange={onChangeHandler}
                        />
                    </FloatingLabel>
                </div>
            </div>
            <div>
                <UploadFiles
                    customRequest={logoUploadCustomRequest}
                    fileList={fileList}
                    accept='image/*'
                    onChange={logoOnChangehandler}
                    onRemove={onRemoveHandler}
                />
            </div>
            {showCreditCard && <div className='mt-3 mb-3'>
                <Accordian
                    selectedCustomer={selectedCustomer}
                    setUserDetail={setUserDetail}
                    creditFormError={creditFormError}
                    setCreditFormError={setCreditFormError}
                    creditEditFormError={creditEditFormError}
                    setCreditEditFormError={setCreditEditFormError}
                    creditAddFormValue={creditAddFormValue}
                    setCreditAddFormValue={setCreditAddFormValue}
                    creditEditFormValue={creditEditFormValue}
                    setCreditEditFormValue={setCreditEditFormValue}
                    creditIsEditMode={creditIsEditMode}
                    setCreditIsEditMode={setCreditIsEditMode}
                />
            </div>}
            {showServiceRates &&  <div>
                <Accordion defaultActiveKey="">

                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Service Rates</Accordion.Header>
                        <Accordion.Body>
                            <ServiceRate selectedCustomer={selectedCustomer} />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>}
        </>
    );
}

export default UpadateForm;
