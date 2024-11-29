/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import UploadFiles from '../../commonModules/UI/UploadFiles';
import CustForm from './custForm';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import { addCust } from '../../../API/authCurd';
import { customerSchema, validateFormData } from '../../../Utils/validation';
import { convertObject, convertObjectToFormData, isObjectNotEmpty } from '../../../Utils/helpers';
import { IoIosCloseCircle } from "react-icons/io";
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import { paginationInitialPage } from '../../../Utils/pagination';
import { logoImageExt } from '../../../Utils/staticdata';


const AddCust = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [errMessage, setErrMessage] = useState();
    const [isError, setIsError] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [logoUrl, setLogoUrl]= useState(null)

    async function handleSubmit(event) {
        event.preventDefault();
        let data = props.formData
        if (logoUrl) {
            data.customer_logo = logoUrl
            data.add_customer = true
        }else{
            data.customer_logo = ""
            data.add_customer = false
        }

        validateFormData(customerSchema, data).then(async () => {
            let newFormData = convertObjectToFormData(data)
            addCust(newFormData).then((res) => {
                let SuccessfullyMessage = res.data.message;
                props.getCustomersList()
                props.setPaginationData({
                    ...props.paginationData,
                    current_page: paginationInitialPage
                })
                // props.getCustomersListPagination(props.paginationData.per_page, props.paginationData.current_page)
                setIsError(false)
                setErrMessage(SuccessfullyMessage)
                setPopMsg(true)
                setFileList([])
                setLogoUrl(null)
            }).catch((err) => {
                const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                if (isObjectNotEmpty(errFromBackend)) {
                    props.setFormError((prev) => ({ ...prev, ...errFromBackend }))
                } else {
                    let errorMessage = err.response?.data.message || "Something went wrong!"
                    setIsError(true)
                    setErrMessage(errorMessage)
                    setPopMsg(true)
                }
            })
        }).catch((err) => {
            props.setFormError(err)
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    // Logo onchange Handler
    const logoOnChangehandler = (e) => {
        if (e.file.status == "removed") {
            let isConfirm = confirmDelete("logo")
            if (isConfirm) {
                setLogoUrl(null)
                setFileList([])
            }
        } else {
            // const fileExtension = e.file?.name?.split('.').pop().toLowerCase()
            const fileType = e.file?.type
            if (fileType.startsWith("image")) {
                e.file.status = "done"
                setFileList([e.file])
            } else {
                e.file.status = "error"
                e.file.response = ""
                e.file.error = { message: "The customer logo field must be an image" }
                setFileList([e.file])
            }
        }
    }

    const cancelButtnHandler = ()=>{
        setFileList([])
        setLogoUrl(null)
        props.onClick()
    }

    // Logo before upload Handler
    const beforeUploadHandler = (e) => {
        setLogoUrl(e)
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='popups d-flex justify-content-center align-items-center'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Add Customer</div>
                        <div className='myIcon' type='button' onClick={cancelButtnHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <CustForm
                            formData={props.formData}
                            setFormData={props.setFormData}
                            paymentTerms={props.paymentTerms}
                            clientStatus={props.clientStatus}
                            countries={props.countries}
                            states={props.states}
                            cities={props.cities}
                            ibUsers={props.ibUsers}
                            formError={props.formError}
                            setFormError={props.setFormError}
                        />
                        <div>
                            <UploadFiles
                                fileList={fileList}
                                accept='image/*'
                                onChange={logoOnChangehandler}
                                beforeUpload={beforeUploadHandler}
                            />
                        </div>
                    </div>

                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtnHandler}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default AddCust;
