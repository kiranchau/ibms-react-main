/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import { updateCustomer } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import UpadateForm from './upadateForm';
import { customerSchema, validateFormData } from '../../../Utils/validation';
import { convertObject, isObjectNotEmpty } from '../../../Utils/helpers';
import { IoIosCloseCircle } from "react-icons/io";

const UpdateCust = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [isUpdating, setIsUpdating] = useState(false);
    const formRef = useRef(null)

    useEffect(() => {
        if (props?.selectedCustomer) {
            const { name, email, phone, website, type, address1, address2, city, state, country, management_comment,
                contract_term, crm, status, customer_relationship_manager_id } = props?.selectedCustomer
            let data = {
                name: name ?? (name === "" ? "" : name),
                status: status?.status_id ?? (status?.status_id ? status.status_id : ""),
                email: email ?? (email === "" ? "" : email),
                website: website ?? (website === "" ? "" : website),
                phone: phone ?? (phone === "" ? "" : phone),
                type: type ?? (type === "" ? "" : type),
                address1: address1 ?? (address1 === "" ? "" : address1),
                address2: address2 ?? (address2 === "" ? "" : address2),
                city: city ?? (city === "" ? "" : city),
                state: state ?? (state === "" ? "" : state),
                country: country ?? (country === "" ? "" : country),
                crm: crm ?? (crm === "" ? "" : crm),
                management_comment: management_comment ?? (management_comment === "" ? "" : management_comment),
                contract_term: contract_term ?? (contract_term === "" ? "" : contract_term),
                customer_relationship_manager_id: customer_relationship_manager_id ?? (customer_relationship_manager_id === "" ? "" : customer_relationship_manager_id),
            }
            props.setUpdatedData(data)
        }
    }, [props?.selectedCustomer])

    function handleSubmit(event) {
        event.preventDefault();
        validateFormData(customerSchema, props.updatedData).then(() => {
            setIsUpdating(true)
            updateCustomer(props.updatedData, props.selectedCustomer.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    if (props.isFromCustomer) {
                        props.getCustomersList()
                    } else {
                        props.getCustomersListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
                    }
                    setIsUpdating(false)
                    setIsError(false)
                    setErrMessage(SuccessfullyMessage)
                    setPopMsg(true)
                }).catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!";
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                    setIsUpdating(false)
                    if(formRef.current){
                        formRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                })
        }).catch((err) => {
            props.setFormError(err)
            if(formRef.current){
                formRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='popups d-flex justify-content-center align-items-center'>
                <div className='addpopups update-cust-popup'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Update Customer</div>
                        <div className='myIcon' type='button' onClick={props.onClick}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <UpadateForm
                            paymentTerms={props.paymentTerms}
                            clientStatus={props.clientStatus}
                            countries={props.countries}
                            states={props.states}
                            cities={props.cities}
                            updatedData={props.updatedData}
                            setUpdatedData={props.setUpdatedData}
                            ibUsers={props.ibUsers}
                            formError={props.formError}
                            setFormError={props.setFormError}
                            selectedCustomer={props.selectedCustomer}
                            setUserDetail={props.setUserDetail}
                            creditFormError={props.creditFormError}
                            setCreditFormError={props.setCreditFormError}
                            creditEditFormError={props.creditEditFormError}
                            setCreditEditFormError={props.setCreditEditFormError}
                            creditAddFormValue={props.creditAddFormValue}
                            setCreditAddFormValue={props.setCreditAddFormValue}
                            creditEditFormValue={props.creditEditFormValue}
                            setCreditEditFormValue={props.setCreditEditFormValue}
                            creditIsEditMode={props.creditIsEditMode}
                            setCreditIsEditMode={props.setCreditIsEditMode}
                            formRef={formRef}
                        />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={() => { props.onClick() }} >Cancel</Button>
                            <Button type="submit" disable={isUpdating}>Update</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default UpdateCust;
