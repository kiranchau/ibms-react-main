/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import UpdateFrom from '../../popups/userpops/UpdateFrom';
import { convertObject, downloadFile, isObjectNotEmpty } from '../../../Utils/helpers';
import { userSchema, validateFormData } from '../../../Utils/validation';
import { deleteUserDocument, getUserDocument, updateUsers, uploadUserDocument } from '../../../API/authCurd';
import ErrorPopup from '../../commonModules/UI/ErrorPopup';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const UpdateUser = (props) => {
    const [popMsg, setPopMsg] = useState(false);
    const [isError, setIsError] = useState(false)
    const [errMessage, setErrMessage] = useState();
    const [fileList, setFileList] = useState([]);
    // initital form load
    useEffect(() => {
        if (props?.selectedUser) {
            const { first_name, last_name, customer_id, phone_no, status, email, department_id, user_permissions } = props?.selectedUser
            let data = {
                first_name: first_name ?? (first_name === "" ? "" : first_name),
                last_name: last_name ?? (last_name === "" ? "" : last_name),
                customer_id: customer_id ?? (customer_id === "" ? "" : customer_id),
                phone_no: phone_no ?? (phone_no === "" ? "" : phone_no),
                status: status ?? (status === "" ? "" : status),
                email: email ?? (email === "" ? "" : email),
                department_id: department_id ?? (department_id === "" ? "" : department_id),
            }
            props.setPermissionsArr(user_permissions ? JSON.parse(user_permissions.permission_ids) : [])
            props.setToggle(props?.selectedUser.user_type == 2 ? 2 : 1)
            props.setUserType(props?.selectedUser.user_type)
            props.setEditFormData(data)
        }
    }, [props?.selectedUser])

    function handleSubmit(event) {
        event.preventDefault();
        let selectedUserType = ""
        if (props.userType == 1) {
            selectedUserType = 1;
        } else {
            selectedUserType = props.toggle == 1 ? "3" : "2";
        }

        // Add the selected user_type directly to the form data
        const formDataWithUserType = {
            ...props.editFormData,
            user_type: selectedUserType,
            permissions: selectedUserType == "2" ? props.permissionArr : []
        };
        validateFormData(userSchema, formDataWithUserType).then(() => {
            updateUsers(formDataWithUserType, props.selectedUser.id)
                .then((res) => {
                    let SuccessfullyMessage = res.data.message;
                    props.getUsersList()
                    // props.getUsersListPagination(props.paginationData.per_page, props.paginationData.current_page)
                    setIsError(false)
                    setErrMessage(SuccessfullyMessage)
                    setPopMsg(true)
                })
                .catch((err) => {
                    const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
                    if (isObjectNotEmpty(errFromBackend)) {
                        props.setEditFormError((prev) => ({ ...prev, ...errFromBackend }))
                    } else {
                        let errorMessage = err.response?.data.message || "Something went wrong!"
                        setIsError(true)
                        setErrMessage(errorMessage)
                        setPopMsg(true)
                    }
                })
        }).catch((err) => {
            props.setEditFormError(err)
        })
    }

    function errorPopupOnClick() {
        setPopMsg(false)
        if (!isError) {
            props.onClick()
        }
    }

    const cancelButtonHandler = () => {
        setFileList([])
        props.onClick()
    }

    useEffect(() => {
        if (props?.selectedUser?.id) {
            getUserDocument(props?.selectedUser?.id).then((res) => {
                if (res.data?.documents) {
                    const doc = res.data?.documents?.map((doc) => {
                        let name = doc.user_document_name
                        return { uid: doc.id, name: name ? name : "Document", status: 'done', url: doc.user_documents_path }
                    })
                    setFileList(doc)
                } else {
                    setFileList([])
                }
            })
        }
    }, [props.selectedUser])

    // Document upload handler
    const documentUploadCustomRequest = (data) => {
        const formData = new FormData()
        formData.append('documents[]', data.file)
        formData.append('user_id', props?.selectedUser?.id)
        const { onSuccess, onError, onProgress } = data

        const config = {
            onUploadProgress: (e) => {
                onProgress({ percent: (e.loaded / e.total) * 100 })
            }
        }
        uploadUserDocument(formData, config).then((res) => {
            onSuccess(res.data)
        }).catch(err => {
            onError({ message: err.response?.data.message || "Failed to upload document" })
        })
    }

    // Document remove function
    function removeDocument(id) {
        deleteUserDocument(id).then(() => {
            setFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteUserDocument-err", err)
        })
    }

    // Document remove Handler
    const handleRemove = (e) => {
        let isConfirm = confirmDelete("document")
        if (isConfirm) {
            if (e.status == "error") {
                setFileList((prev) => { return prev.filter((item) => item.uid != e.uid) })
            } else {
                removeDocument(e.uid)
            }
        }
    }

    // Document download Handler
    const handleDownload = (e) => {
        downloadFile(e.url, e.name)
    }

    // Document onchange Handler
    const docOnChangehandler = (e) => {
        if (e.file.status == "done") {
            let items = [...fileList]
            let newArr = items.map((item) => {
                if (item.uid == e.file.uid) {
                    let name =  e.file.response.user_document_name
                    return { uid: e.file.response.document_id, name: name ? name : "Document", status: 'done', url: e.file?.response?.user_documents_path }
                }
                return item
            })
            setFileList(newArr)
        } else {
            setFileList(e.fileList)
        }
    }

    if (popMsg) {
        return (
            <ErrorPopup title={errMessage} onClick={errorPopupOnClick} />
        )
    }

    return (
        <form onSubmit={handleSubmit} >
            <div className='popups d-flex justify-content-center align-items-center w-100'>
                <div className='addpopups' style={{ width: "50%" }}>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Update User</div>
                        <div className='myIcon' type='button' onClick={cancelButtonHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <UpdateFrom
                            toggle={props.toggle}
                            setToggle={props.setToggle}
                            editFormData={props.editFormData}
                            setEditFormData={props.setEditFormData}
                            editFormError={props.editFormError}
                            setEditFormError={props.setEditFormError}
                            customerList={props.customerList}
                            clientStatus={props.clientStatus}
                            departments={props.departments}
                            permissions={props.permissions}
                            permissionArr={props.permissionArr}
                            setPermissionsArr={props.setPermissionsArr}
                            userType={props.userType} 
                            setUserType={props.setUserType}
                        />
                        <CustomerDocUpload
                            multiple={true}
                            customRequest={documentUploadCustomRequest}
                            fileList={fileList}
                            onChange={docOnChangehandler}
                            handleDownload={handleDownload}
                            handleRemove={handleRemove}
                        />
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</Button>
                            <Button type="submit">Update</Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default UpdateUser;
