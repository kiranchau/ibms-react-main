/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */

import React, { useContext, useEffect, useState } from 'react'
import * as FaIcons from "react-icons/fa6";
import { Table, Spin, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as PiIcons from 'react-icons/pi'
import { BiSolidEdit } from "react-icons/bi";
import { IoIosCloseCircle } from "react-icons/io";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

import { addCustomerPassword, deleteCustomerPassword, getCust, getCustomerPasswordPagination, getCustomerPasswords, updateCustomerPassword } from "../../../API/authCurd";
import { calculatePageCount, calculatePageRange, checkPermission, getFilterFromLocal, getUniqueValuesByKey, saveFilterToLocal, truncateText } from "../../../Utils/helpers";
import { sortByDate, sortByString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { parseDateTimeString } from "../../../Utils/dateFormat";
import TableBtn from "../../commonModules/UI/TableBtn";
import Button from '../../commonModules/UI/Button';
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import { customerPasswordSchema } from '../../../Utils/validation';
import PasswordField from './PasswordField';
import { paginationInitialPage, paginationPerPage, paginationSizeChanger } from '../../../Utils/pagination';
import { GlobalSearch } from '../../contexts/GlobalSearchContext';
import { CustomerContext } from '../../contexts/CustomerContext';
import UpdateCust from '../../popups/custpops/UpdateCust';
import { FaSquareArrowUpRight } from "react-icons/fa6";
import Instructions from './Instructions';
import PasswordCustomerFilter from '../../FilterDropdown/PasswordCustomerFilter';
import * as RiIcons from "react-icons/ri";
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const initialValues = {
    customer_id: "", url: "", username: "", password: "", medium: "", email: "", instruction: ""
}

export const Password = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [passwords, setPasswords] = useState([])
    const [columns, setColumns] = useState([])
    const [paginationData, setPaginationData] = useState({
        current_page: 1,
        prev_page_url: "",
        next_page_url: "",
        per_page: "",
        total: "",
        pages: 0
    })
    const [customerList, setCustomerList] = useState([]);
    const [filePop, setFilePop] = useState(false);
    const [popupType, setPopupType] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate()
    const [formattedPass, setFormattedPass] = useState([]);
    const { globalSearch, resetSearch } = useContext(GlobalSearch)
    const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
        selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
        setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
        setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
        setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
        updateCustomerPopupOpen } = useContext(CustomerContext)
    const [filters, setFilters] = useState({
        customer_id: [],
    })
    const [filter, setFilter] = useState({
        customer_id: [],
    })

    useEffect(() => {
        let permission = checkPermission("Passwords")
        if (!permission) {
            navigate("/dashboard")
        }
    }, [])

    // Formik initialization
    const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting, setFieldValue } = useFormik({
        initialValues,
        validationSchema: customerPasswordSchema,
        onSubmit: onSaveClickHandler,
    })

    // Get customer list function
    function getCustomersList() {
        getCust().then((res) => {
            setCustomerList(res.data.customers)
        }).catch(err => {
            setCustomerList([])
        })
    }

    // Get Customer password pagination
    function getPasswordListPagination(perPage, pageNum, isLoader = true) {
        if (isLoader) {
            setIsLoading(true)
        }
        getCustomerPasswordPagination(perPage, pageNum).then((res) => {
            setIsLoading(false)
            setPasswords(res.data?.customer_password?.data)
            let pageCount = calculatePageCount(res.data?.customer_password.total, res.data?.customer_password.per_page)
            setPaginationData({
                current_page: res.data?.customer_password.current_page,
                prev_page_url: res.data?.customer_password.prev_page_url,
                next_page_url: res.data?.customer_password.next_page_url,
                per_page: res.data?.customer_password.per_page,
                total: res.data?.customer_password.total,
                pagesCount: pageCount
            })
        }).catch(err => {
            setIsLoading(false)
            setPasswords([])
        })
    }

    // Get Customer password
    function getPasswordList(isLoader = true) {
        if (isLoader) {
            setIsLoading(true)
        }
        getCustomerPasswords().then((res) => {
            setIsLoading(false)
            setPasswords(res.data?.customer_password)
        }).catch(err => {
            setIsLoading(false)
            setPasswords([])
        })
    }

    // Save button click handler function
    function onSaveClickHandler(values, { setSubmitting }) {
        if (popupType == 'update') {
            setIsSaving(true)
            updateCustomerPassword(selectedItem.customer_password_id, values).then(() => {
                // getPasswordListPagination(paginationData.per_page, paginationData.current_page)
                getPasswordList(false)
                setFilePop(false);
            }).catch(() => {
                setFilePop(false);
            }).finally(() => {
                setIsSaving(false)
                setSubmitting(false)
            })
        } else if (popupType == 'add') {
            setIsSaving(true)
            addCustomerPassword(values).then(() => {
                // getPasswordListPagination(paginationData.per_page, paginationData.current_page)
                getPasswordList(false)
                setFilePop(false);
            }).catch(() => {
                setFilePop(false);
            }).finally(() => {
                setIsSaving(false)
                setSubmitting(false)
            })
        }
    }

    // On cell handler
    const onCellHandler = () => {
        return { onClick: (event) => { event.stopPropagation() } }
    }

    // On cell handler
    const onCustomerNameClickcHandler = (e, record) => {
        e.stopPropagation()
        updateCustomerPopupOpen(record?.customer_id)
    }

    const handleWebButtonClick = (e, websitePath) => {
        e.preventDefault()
        if (websitePath) {
            if (!websitePath.startsWith("http://") && !websitePath.startsWith("https://")) {
                websitePath = `http://${websitePath}`;
            }
            const websiteUrl = new URL(websitePath);
            window.open(websiteUrl.href, '_blank');
        } else {
            console.error("Invalid website URL");
        }
    }

    // custom filter check handler
    const customFilterHandler = () => {
        resetSearch()
        let fils = filters
        let prevFilter = getFilterFromLocal('passwords')
        saveFilterToLocal('passwords', { ...prevFilter, customer_id: fils.customer_id ? fils.customer_id : [] })
        setFilter((prev) => ({ ...prev, customer_id: fils.customer_id ? fils.customer_id : [] }))
    }

    // custom filter reset handler
    const customFilterResetHandler = (key) => {
        let prevFilter = getFilterFromLocal('passwords')
        saveFilterToLocal('passwords', { ...prevFilter, [key]: [] })
        setFilter((prev) => ({ ...prev, [key]: [] }))
    }

    const deletePasswordData = async (record) => {
        let isConfirm = confirmDelete("password")
        if (isConfirm) {
            deleteCustomerPassword(record.customer_password_id).then(() => {
                getPasswordList(false);
            })
        }
    };

    // Column definition
    useEffect(() => {
        const uniqueClient = getUniqueValuesByKey(passwords, "customer_details")
        const clientFilter = sortObjectsByAttribute(uniqueClient.map((item) => ({ name: item?.name, id: item?.id })), "name")
        const columnDef = [
            {
                title: 'Customer',
                dataIndex: ["customer_details", 'name'],
                key: "clientname",
                sorter: sortByString(["customer_details", "name"]),
                filteredValue: filters.customer_id,
                filterDropdown: (props) => { return <PasswordCustomerFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} allOptions={clientFilter} /> },
                width: 200,
                render: (text, record, index) => ({
                    children: text ? <div id={`customer_name`}>
                        <Tooltip placement="top" title={"Go To Customer"}>
                            <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onCustomerNameClickcHandler(e, record)} />
                            <span onClick={(e) => onCustomerNameClickcHandler(e, record)} className='ms-1 redirect-cusor'>{text}</span>
                        </Tooltip>
                    </div> : "",
                }),
            },
            {
                title: 'Medium',
                dataIndex: 'medium',
                key: "medium",
                width: 130,
                sorter: sortByString(["medium"]),
            },
            {
                title: 'URL',
                dataIndex: 'url',
                key: "url",
                sorter: sortByString(["url"]),
                width: 150,
                render: (text, record) => (
                    // <a href={record.url} target='_blank'>{record.url}</a>
                    <a href={"#"} onClick={(e) => { handleWebButtonClick(e, record.url) }}>{record.url}</a>
                ),
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: sortByString(["username"]),
                width: 150
            },
            {
                title: 'Password',
                dataIndex: 'password',
                key: 'password',
                sorter: sortByString(["password"]),
                width: 180,
                render: (text, record) => { return <PasswordField record={record} /> }
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                sorter: sortByString(["email"]),
                width: 260,
                render: (text, record) => {
                    return record.email ? <a href={`mailto:${record.email}`}>{record.email}</a> : null
                }
            },
            {
                title: 'Instructions',
                dataIndex: 'instruction',
                key: 'instruction',
                sorter: sortByString(["instruction"]),
                width: 260,
                render: (text, record) => {
                    return <Instructions record={record} />
                }
            },
            {
                title: 'Updated',
                dataIndex: 'updated_at',
                key: 'updated_at',
                sorter: sortByDate(["updated_at"]),
                render: (text, record) => { return record.updated_at ? parseDateTimeString(record.updated_at, 7) : null },
                width: 200,
            },
            {
                title: 'Actions',
                key: "",
                width: 80,
                render: (text, record) => (
                    <div className="d-flex justify-content-around actions-column">
                        <CenterTooltip title="Edit Password">
                            <TableBtn className="website me-2" onclick={() => { updateButtonClickHandler(record) }} ><BiSolidEdit /></TableBtn>
                        </CenterTooltip>
                        <CenterTooltip title="Delete Password">
                            <TableBtn className="website me-2" onclick={() => { deletePasswordData(record) }} ><RiIcons.RiDeleteBin6Fill /></TableBtn>
                        </CenterTooltip>
                    </div>
                )
            }
        ];
        setColumns(columnDef)
    }, [passwords, formattedPass, filters])

    useEffect(() => {
        getPasswordList()
        getCustomersList()
    }, [])

    // Add button click handler function
    const addButtonClickHandler = () => {
        setPopupType('add');
        setFilePop(true);
        resetForm()
    }

    const seeMoreButtonClick = (e, item) => {
        e.stopPropagation()
        updateButtonClickHandler(item)
    }

    // Update button click handler function
    const updateButtonClickHandler = (item) => {
        resetForm()
        setSelectedItem(item)
        setPopupType('update');
        Object.keys(initialValues).map((field) => {
            setFieldValue(field, item?.[field] ? item?.[field] : "")
        })
        setFilePop(true);
    }

    // Cancel button click handler function
    const cancelButtonClickHandler = () => { setFilePop(false) }

    // table onChange handler function 
    const onTableChangeHandler = (pagination, filters, sorter, extra) => {
        const { currentDataSource } = extra
        setPaginationData({
            ...paginationData,
            current_page: pagination.current,
            total: currentDataSource.length
        })
    }

    useEffect(() => {
        setPaginationData({
            current_page: paginationInitialPage,
            per_page: paginationPerPage,
            total: formattedPass.length,
        })
    }, [formattedPass])

    useEffect(() => {
        let formattedData = passwords
        if (globalSearch) {
            setFilters((prev) => ({ ...prev, customer_id: [] }))
            formattedData = formattedData.filter((item) => {
                const updatedAtFormatted = item.updated_at ? parseDateTimeString(item.updated_at, 7) : null;
                return (item?.customer_details?.name?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (item.email?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (item.instruction?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (item.url?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (item.username?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (item.medium?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
                    (updatedAtFormatted?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase()))
            })
        } else {
            if (filter.customer_id.length > 0) {
                formattedData = formattedData.filter((item) => {
                    return (filter.customer_id.includes(item.customer_id))
                })
            }
        }
        setFormattedPass(formattedData)
    }, [passwords, globalSearch, filter])

    useEffect(() => {
        let savedFilters = getFilterFromLocal('passwords')
        setFilters((prev) => ({ ...prev, customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [] }))
        setFilter((prev) => ({ ...prev, customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [] }))
    }, [])

    return (
        <div className="PageContent">
            <div className='mx-3 mt-2 settingPage password-page'>
                <div className="header px-3 py-1 d-flex justify-content-between">
                    <div><span className='pe-2'>
                        <PiIcons.PiLockKeyFill />
                    </span>
                        Passwords </div>
                    <Button className="headBtn" onClick={addButtonClickHandler} ><FaIcons.FaPlus style={{ marginTop: "-3px" }} onClick={() => setFilePop(!filePop)} /> Add Password</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={formattedPass}
                    sticky={{
                        offsetHeader: 0,
                    }}
                    scroll={{ y: `calc(100vh - 250px)` }}
                    onChange={onTableChangeHandler}
                    pagination={{
                        position: ['bottomRight'],
                        pageSize: paginationData.per_page,
                        current: paginationData.current_page,
                        showSizeChanger: paginationSizeChanger
                    }}
                    loading={{
                        indicator: <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />,
                        spinning: isLoading
                    }}
                    footer={() => {
                        return paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
                            <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
                        </div> : null
                    }}
                />
            </div>
            {/* //file popup */}
            <div className={`${filePop ? "centerpopups" : "nocenterpopups"}`}>
                <div className='centerpopups add-pass-modal'>
                    <div className='popups d-flex justify-content-center align-items-center w-100'>
                        <div className='addpopups user-form-wrap'>
                            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                                <div>{popupType == "update" ? "Update" : "Add"} Password</div>
                                <div className='myIcon' type='button' >
                                    <IoIosCloseCircle onClick={cancelButtonClickHandler} style={{ width: '28px' }} />
                                </div>
                            </div>
                            <div className='popBody p-3 customer-body'>
                                <div className="input-row">
                                    <div className=' addCust'>
                                        <FloatingLabel label="Customer *">
                                            <Form.Select
                                                aria-label="Customer"
                                                name='customer_id'
                                                {...getFieldProps("customer_id")}
                                            >
                                                <option key={0} value="">Select Customer</option>
                                                {customerList?.length > 0 && sortObjectsByAttribute(customerList).map((item) => {
                                                    return <option key={item.id} value={item.id}>{item.name}</option>
                                                })}
                                            </Form.Select>
                                        </FloatingLabel>
                                        {(touched.customer_id && errors.customer_id) ? <span className='ms-2 text-danger'>{errors.customer_id}</span> : null}
                                    </div>
                                    <div className="addCust">
                                        <FloatingLabel label="URL *">
                                            <Form.Control
                                                type="text"
                                                placeholder="URL"
                                                name="url"
                                                {...getFieldProps("url")}
                                            />
                                        </FloatingLabel>
                                        {(touched.url && errors.url) ? <span className='ms-2 text-danger'>{errors.url}</span> : null}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <div className="addCust">
                                        <FloatingLabel label="User Name">
                                            <Form.Control
                                                type="text"
                                                placeholder="User Name"
                                                name="username"
                                                {...getFieldProps("username")}
                                            />
                                        </FloatingLabel>
                                        {(touched.username && errors.username) ? <span className='ms-2 text-danger'>{errors.username}</span> : null}
                                    </div>
                                    <div className="addCust">
                                        <FloatingLabel label="Password *">
                                            <Form.Control
                                                type="password"
                                                placeholder="Password"
                                                name="password"
                                                {...getFieldProps("password")}
                                            />
                                        </FloatingLabel>
                                        {(touched.password && errors.password) ? <span className='ms-2 text-danger'>{errors.password}</span> : null}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <div className="addCust">
                                        <FloatingLabel label="Medium">
                                            <Form.Control
                                                type="text"
                                                placeholder="Medium"
                                                name="medium"
                                                {...getFieldProps("medium")}
                                            />
                                        </FloatingLabel>
                                    </div>
                                    <div className="addCust">
                                        <FloatingLabel label="Email *">
                                            <Form.Control
                                                type="text"
                                                placeholder="Email"
                                                name="email"
                                                {...getFieldProps("email")}
                                            />
                                        </FloatingLabel>
                                        {(touched.email && errors.email) ? <span className='ms-2 text-danger'>{errors.email}</span> : null}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <div className="addCust">
                                        <FloatingLabel label="Instructions" className='textarea-label'>
                                            <Form.Control
                                                as="textarea"
                                                style={{ height: '100px', margin: 0 }}
                                                name='instruction'
                                                {...getFieldProps("instruction")}
                                            />
                                        </FloatingLabel>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-auto popfoot w-100 p-2'>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <Button className="mx-4 cclBtn" onClick={cancelButtonClickHandler}>Cancel</Button>
                                    <Button disabled={isSubmitting} type="submit" onClick={handleSubmit}>Save {isSaving && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="blurBg"></div>
                </div>
            </div>

            {openCustomerPopup && <div className={`mainpopups`}>
                <UpdateCust
                    paymentTerms={customerPaymentTerms}
                    clientStatus={customerStatus}
                    countries={customerCountries}
                    states={customerStates}
                    cities={customerCities}
                    getCustomersList={getPasswordList}
                    selectedCustomer={selectedCustomer}
                    onClick={updateCustomerCancelClickHandler}
                    ibUsers={customerIbUsers}
                    formError={customerFormError}
                    setFormError={setCustomerFormError}
                    paginationData={paginationData}
                    getCustomersListPagination={getPasswordList}
                    setUserDetail={setCustomerUserDetail}
                    creditFormError={customerCreditFormError}
                    setCreditFormError={setCustomerCreditFormError}
                    creditEditFormError={customerCreditEditFormError}
                    setCreditEditFormError={setCustomerCreditEditFormError}
                    creditAddFormValue={customerCreditAddFormValue}
                    setCreditAddFormValue={setCustomerCreditAddFormValue}
                    creditEditFormValue={customerCreditEditFormValue}
                    setCreditEditFormValue={setCustomerCreditEditFormValue}
                    creditIsEditMode={customerCreditIsEditMode}
                    setCreditIsEditMode={setCustomerCreditIsEditMode}
                    updatedData={customerUpdatedData}
                    setUpdatedData={setCustomerUpdatedData}
                    isFromCustomer={true}
                />
                <div className="blurBg"></div>
            </div>}
        </div>
    )
}