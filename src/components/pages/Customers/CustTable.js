/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import TableBtn from "../../commonModules/UI/TableBtn";
import * as TfiIcons from "react-icons/tfi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import UpdateCust from "../../popups/custpops/UpdateCust";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import { sortByNumber, sortByString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { useLocation } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import { IoMdMore } from "react-icons/io";
import Dropdown from 'react-bootstrap/Dropdown';
import { TiContacts } from "react-icons/ti";
import { IoIosCloseCircle } from "react-icons/io";
import { MdEdit, MdOutlineSave, MdOutlineClose } from "react-icons/md";
import Form from 'react-bootstrap/Form';
import { MdDelete } from "react-icons/md";
import { BsFillFileEarmarkPersonFill } from "react-icons/bs";
import { addCustomerContact, deleteCustomerContact, deleteDocument, fetchCustomerContacts, fetchCustomerUsers, fetchDocument, getSingleCustomer, updateCustomerContact, uploadDocument } from "../../../API/authCurd";
import { contactSchema, validateFormData } from "../../../Utils/validation";
import { FaRegFileAlt } from "react-icons/fa";
import { confirmDelete } from "../../commonModules/UI/Dialogue";
import CustomerDocUpload from "../../commonModules/UI/CustomerDocUpload";
import { BiSolidEdit } from "react-icons/bi";
import { calculatePageRange, convertObject, getFilterFromLocal, isObjectNotEmpty, saveFilterToLocal, updateStateByCondition } from "../../../Utils/helpers";
import ErrorPopup from "../../commonModules/UI/ErrorPopup";
import { paginationPerPage, paginationSizeChanger } from "../../../Utils/pagination";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import { custDocExtentions } from "../../../Utils/staticdata";
import { CustomerFilter } from "../../FilterDropdown";

const initialContactValues = { customer_id: "", first_name: "", last_name: "", email: "", title: "", phone: "", primary_contact: 0 }

const CustTable = ({ getClientStatus, getCountries, getStates, getCities, userDetail, getCustomersList, paymentTerms, clientStatus, countries, states, cities, getIbUsers, ibUsers, paginationData, setPaginationData, getCustomersListPagination, setUserDetail, isLoading }) => {
  const [popUps, setPopUps] = useState(false);
  const [customerpopUps, setCustomerpopUps] = useState(false);
  const [columns, setColumns] = useState([]);
  const [filePop, setFilePop] = useState(false);
  const [data, setData] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null); // customer selected to update
  const Navigation = useNavigate();
  const [mySpin, setMySpin] = useState();
  const [formError, setFormError] = useState({})
  const [customerUsers, setCustomerUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedCustomerForContacts, setSelectedCustomerContacts] = useState(null)
  const [selectedCustomerUsers, setSelectedCustomerUsers] = useState(null)
  const [customerContactValues, setCustomerContactValues] = useState(initialContactValues)
  const [addContactFormError, setAddContactFormError] = useState({})
  const [contactColumns, setContactColumns] = useState([])
  const [isContactEditMode, setIsContactEdit] = useState(false)
  const [contactSelectedForEdit, setContactSelectedForEdit] = useState({})
  const [editContactData, setEditContactData] = useState({})
  const [editFormError, setEditFormError] = useState({})
  const [isSelectedFromUsers, setIsSelectedFormUsers] = useState(false)
  const [isSelectedForDoc, setIsSelectedForDoc] = useState(null)
  const [fileList, setFileList] = useState([]);

  const [creditFormError, setCreditFormError] = useState({})
  const [creditEditFormError, setCreditEditFormError] = useState({})
  const [creditAddFormValue, setCreditAddFormValue] = useState({
    customer_id: "", credit_card_no: "", exp_month_year: "", cvv: "", card_type: "", name_on_card: "", address: ""
  })
  const [creditEditFormValue, setCreditEditFormValue] = useState({})
  const [creditIsEditMode, setCreditIsEditMode] = useState(false)
  const [updatedData, setUpdatedData] = useState(null)
  const [popupMessageShow, setPopupMessageShow] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [statusFilterValue, setStatusFilterValue] = useState([1])
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const [isMoreOpenSelected, setIsMoreOpenSelected] = useState(null)
  const tableHeaders = document.querySelectorAll('.ant-table-cell');
  let usertype = localStorage.getItem("usertype")
  const [filters, setFilters] = useState({
    customer_id: [],
  })
  const [filter, setFilter] = useState({
    customer_id: [],
  })
  const [contactSearch, setContactSearch] = useState("")
  const [formattedContacts, setFormattedContacts] = useState([])
  // Remove tooltip on hover by setting title to an empty string
  tableHeaders.forEach(th => {
    th.addEventListener('mouseenter', () => {
      th.setAttribute('title', '');
    });
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get('id');

  const updatePopUps = (data) => {
    setIsMoreOpenSelected(null)
    setFormError({})
    setSelectedCustomer(data)
    setPopUps(true);
    getCountries();
    getStates();
    getCities();
    getIbUsers();
    setCreditFormError({})
    setCreditEditFormError({})
    setCreditAddFormValue({
      customer_id: "", credit_card_no: "", exp_month_year: "", cvv: "", card_type: "", name_on_card: "", address: ""
    })
    setCreditEditFormValue({})
    setCreditIsEditMode(false)
  }

  useEffect(() => {
    if (id) {
      let filterData = userDetail.filter(item => item.customer == id)
      if (filterData.length === 0) {
        setData([]);
      } else {
        setData(userDetail);
      }

    } else {
      setData(userDetail)
    }
    if (userDetail.length === 0) {
      setMySpin(false);
    }
    else {
      setMySpin(true);
    }
  }, [userDetail])

  useEffect(() => {
    getClientStatus()
  }, [])

  const handleTaskButtonClick = (e, id) => {
    e.preventDefault()
    setIsMoreOpenSelected(null)
    Navigation(`/tasks?id=${id}`)
  }
  const handleJobsButtonClick = (e, id) => {
    e.preventDefault()
    setIsMoreOpenSelected(null)
    try {
      Navigation(`/jobs?id=${id}`);
    } catch (error) {
      console.error("Error during navigation:", error);
    }
  }

  const handleWebButtonClick = (websitePath) => {
    setIsMoreOpenSelected(null)
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

  function getDocument(id) {
    fetchDocument(id).then((res) => {
      const doc = res.data?.documents?.map((doc) => { return { uid: doc.customer_document_id, name: doc.document_name, status: 'done', url: doc.document_url } })
      setFileList(doc)
    }).catch(err => {
      setFileList([])
    })
  }

  function removeDocument(id, custId) {
    deleteDocument(id).then((res) => {
      let docs = fileList.filter(f => f.uid != id)
      setFileList(docs)
    }).catch(err => { })
  }

  // Upload Multiple files
  const onFileUploadPopupHandler = (record) => {
    setIsMoreOpenSelected(null)
    setFilePop(true)
    setIsSelectedForDoc(record)
    getDocument(record.id)
  }

  const onFileUploadPopupCloseHandler = () => {
    setIsMoreOpenSelected(null)
    setFilePop(false)
    setIsSelectedForDoc(null)
    setFileList([])
  }

  const documentUploadCustomRequest = (data) => {
    const { onSuccess, onError, onProgress } = data
    // const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
    // if (custDocExtentions.includes(fileExtension)) {
      const formData = new FormData()
      formData.append('document', data.file)
      formData.append('customer_id', isSelectedForDoc.id)

      const config = {
        onUploadProgress: (e) => {
          onProgress({ percent: (e.loaded / e.total) * 100 })
        }
      }
      uploadDocument(formData, config).then((res) => {
        setPopupMessage(res.data.message || "Customer document added successfully!")
        setPopupMessageShow(true)
        onSuccess(res.data)
      }).catch(err => {
        onError({ message: err.response?.data.message || "Failed to upload document" })
      })
    // } else {
    //   let exts = custDocExtentions.join(", ")
    //   onError({ message: "Document must be a file of type: " + exts })
    // }
  }

  // Document onchange Handler
  const handleRemove = (e) => {
    let isConfirm = confirmDelete("document")
    if (isConfirm) {
      if (e.status == "error") {
        let docs = fileList.filter(f => f.uid != e.uid)
        setFileList(docs)
      } else {
        removeDocument(e.uid, isSelectedForDoc.id)
      }
    }
  }

  const downloadFile = (url, filename) => {
    const link_ = document.createElement("a")
    link_.href = url
    link_.download = filename || "document";
    link_.target = "_blank"
    document.body.appendChild(link_)
    setTimeout(() => {
      link_.click()
      document.body.removeChild(link_)
    }, 500);
  }

  // Document onchange Handler
  const handleDownload = (e) => {
    downloadFile(e.url, e.name)
  }

  // Document onchange Handler
  const docOnChangehandler = (e) => {
    if (e.file.status == "done") {
      let items = [...fileList]
      let newArr = items.map((item) => {
        if (item.uid == e.file.uid) {
          let name = e.file.response.customer_document_name
          return { uid: e.file.response.customer_document_id, name: name ? name : "Document", status: 'done', url: e.file?.response?.customer_documents_path }
        }
        return item
      })
      setFileList(newArr)
    } else {
      setFileList(e.fileList)
    }
  }

  // On cell handler
  const onCellHandler = () => {
    return { onClick: (event) => { event.stopPropagation() } }
  }

  // custom filter check handler
  const customFilterHandler = () => {
    resetSearch()
    let fils = filters
    let prevFilter = getFilterFromLocal('customers')
    saveFilterToLocal('customers', { ...prevFilter, customer_id: fils.customer_id ? fils.customer_id : [] })
    setFilter((prev) => ({ ...prev, customer_id: fils.customer_id ? fils.customer_id : [] }))
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let prevFilter = getFilterFromLocal('customers')
    saveFilterToLocal('customers', { ...prevFilter, [key]: [] })
    setFilter((prev) => ({ ...prev, [key]: [] }))
  }

  const onToggleClickHandler = (data, record) => {
    setIsMoreOpenSelected((prev) => record.id == prev ? null : record.id)
  }

  useEffect(() => {
    const cliStatus = clientStatus.map((item) => ({ text: item.name, value: item.id }))
    const columnsDef = [
      {
        title: '#',
        dataIndex: "id",
        key: "clientname",
        sorter: sortByNumber(["id"]),
        width: 60,

      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: "CustName",
        render: (text, record) => {
          return (
            <div>{text}</div>
          )
        },
        sorter: sortByString(["name"]),
        width: 160,
        filteredValue: filters.customer_id,
        filterDropdown: (props) => { return <CustomerFilter {...props} subsection={'customer'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
      },
      {
        title: 'Email',
        dataIndex: "email",
        key: "CustEmail",
        width: 180,
        sorter: sortByString(["email"]),
        onCell: onCellHandler,
        render: (text, record) => {
          return record.email ? <a href={`mailto:${record.email}`}>{record.email}</a> : null
        }
      },
      {
        title: 'Address',
        dataIndex: "address1",
        key: "custAddress",
        width: 200,
        sorter: sortByString(["address1"]),
        render: (text, record) => {
          let address = (record.address1 && record.address2) ? `${record.address1}, ${record.address2}` : record.address1 ? record.address1 : record.address2
          return address
        }
      },
      {
        title: 'Phone No',
        dataIndex: "phone",
        key: "custPhone",
        sorter: sortByString(["phone"]),
        width: 120
      },
      {
        title: 'Status',
        dataIndex: ["status", "value"],
        key: "custStatus",
        filters: cliStatus,
        width: 100,
        filteredValue: statusFilterValue,
        onFilter: (value, record) => record.status.status_id == value,
        render: (text, record) => {
          return (
            <div>{text}</div>
          )
        },
        sorter: sortByString(["status", "value"]),
      },
      {
        title: 'Actions',
        key: "actions",
        width: 130,
        onCell: onCellHandler,
        render: (text, record) => (
          <div className="d-flex gap-2 actions-column">
            {(usertype != 3) && <CenterTooltip title="Edit Customer">
              <TableBtn className="website " onclick={() => updatePopUps(record)} ><BiSolidEdit /></TableBtn>
            </CenterTooltip>}
            <CenterTooltip title="Documents">
              <TableBtn className="website " onclick={() => onFileUploadPopupHandler(record)} ><FaRegFileAlt /></TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Website">
              <TableBtn className="website " onclick={() => handleWebButtonClick(record.website)} ><TfiIcons.TfiWorld /></TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Contacts">
              <TableBtn className="task " onclick={() => customerContactButtonClick(record)}>
                <TiContacts />
              </TableBtn>
            </CenterTooltip>
            <CenterTooltip title="More" >
              <TableBtn className="bill more-option-wrap">
                <div className='more-option'>
                  <Dropdown show>
                    <Dropdown.Toggle id="dropdown-basic" onClick={(data) => {onToggleClickHandler(data, record)}}>
                      <IoMdMore />
                    </Dropdown.Toggle>

                    {(isMoreOpenSelected == record.id) && <Dropdown.Menu>
                      <Dropdown.Item onClick={(e) => handleJobsButtonClick(e, record.id)}><MdIcons.MdFactory />Jobs</Dropdown.Item>
                      <Dropdown.Item onClick={(e) => handleTaskButtonClick(e, record.id)}><FaIcons.FaClipboardList />Tasks</Dropdown.Item>
                    </Dropdown.Menu>}
                  </Dropdown>
                </div>
              </TableBtn>
            </CenterTooltip>
          </div>
        )
      },
    ];
    setColumns(columnsDef);

  }, [userDetail, statusFilterValue, filters, isMoreOpenSelected])

  const onRowClick = (e, record) => {
    const target = e.target
    if (!target.className.includes('actions-column') && (usertype != 3)) {
      updatePopUps(record)
    }
  }

  function getCustomerUsers() {
    fetchCustomerUsers(1).then((res) => {
      if (res.data?.users) { setCustomerUsers(res.data?.users) }
    }).catch(() => { setCustomerUsers([]) })
  }

  function getCustomerContacts(id) {
    fetchCustomerContacts(id).then((res) => {
      if (res.data?.contacts) {
        setContacts(res.data?.contacts)
        updateStateByCondition(
          setUserDetail,
          detail => detail?.id == id,
          ["customer_contacts"],
          res.data?.contacts ? res.data?.contacts : [])
      }
    }).catch(() => { setContacts([]) })
  }

  function addCustomerContactData(id, data) {
    addCustomerContact(data).then((res) => {
      getCustomerContacts(id)
      setCustomerContactValues({
        customer_id: "", first_name: "", last_name: "", email: "", title: "", phone: "", primary_contact: 0,
      })
      setSelectedCustomerUsers(null)
      setIsSelectedFormUsers(false)
      setAddContactFormError({})
    }).catch((err) => {
      const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
      if (isObjectNotEmpty(errFromBackend)) {
        setAddContactFormError((prev) => ({ ...prev, ...errFromBackend }))
      }
    })
  }

  function deleteContactData(id, customerId) {
    deleteCustomerContact(id).then((res) => {
      getCustomerContacts(customerId)
    }).catch((err) => { console.log("deleteContactData: ", err) })
  }

  function updateCustomerContactData(id, data, customerId) {
    updateCustomerContact(id, data).then((res) => {
      setEditFormError({})
      setIsContactEdit(false)
      setContactSelectedForEdit({})
      setEditContactData({})
      getCustomerContacts(customerId)
    }).catch((err) => {
      const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
      if (isObjectNotEmpty(errFromBackend)) {
        setEditFormError((prev) => ({ ...prev, ...errFromBackend }))
      }
    })
  }

  const customerContactButtonClick = (record) => {
    setIsMoreOpenSelected(null)
    setAddContactFormError({})
    setEditContactData({})
    setEditFormError({})
    setIsContactEdit(false)
    setCustomerContactValues(initialContactValues)
    setCustomerpopUps(true)
    setContactSearch("")
    setSelectedCustomerUsers(null)
    setSelectedCustomerContacts(record)
    setContacts(record.customer_contacts)
    getCustomerUsers()
  }

  const customerAddContactOnChangeHandler = (e) => {
    let errors = addContactFormError
    if (errors.hasOwnProperty(e.target.name)) {
      delete errors[e.target.name]
    }
    setAddContactFormError(errors)
    if (e.target.name == "primary_contact") {
      setCustomerContactValues({ ...customerContactValues, primary_contact: customerContactValues.primary_contact == 1 ? 0 : 1 })
    } else {
      setCustomerContactValues({ ...customerContactValues, [e.target.name]: e.target.value })
    }
  }

  const customerUserOnChangeHandler = (e) => {
    if (e.target.value == "") {
      setCustomerContactValues({})
      setSelectedCustomerUsers(null)
      setAddContactFormError({})
    } else {
      setAddContactFormError({})
      let custUser = customerUsers.find((u) => e.target.value == u.id)
      setSelectedCustomerUsers(custUser)
    }
  }

  useEffect(() => {
    if (selectedCustomerUsers) {
      setIsSelectedFormUsers(true)
      setCustomerContactValues({
        first_name: selectedCustomerUsers?.first_name ? selectedCustomerUsers?.first_name : "",
        last_name: selectedCustomerUsers?.last_name ? selectedCustomerUsers?.last_name : "",
        email: selectedCustomerUsers?.email ? selectedCustomerUsers?.email : "",
        title: selectedCustomerUsers?.title ? selectedCustomerUsers?.title : "",
        phone: selectedCustomerUsers?.phone_no,
        primary_contact: selectedCustomerUsers?.primary_contact == 1 ? 1 : 0,
      })
    } else {
      setIsSelectedFormUsers(false)
    }
  }, [selectedCustomerUsers])

  const contactSaveButtonHandler = () => {
    const data = customerContactValues
    data.customer_id = selectedCustomerForContacts?.id
    data.user_id = selectedCustomerUsers?.id ? selectedCustomerUsers?.id : null
    validateFormData(contactSchema, data).then(() => {
      addCustomerContactData(selectedCustomerForContacts?.id, data)
    }).catch((err) => {
      setAddContactFormError(err)
    })
  }

  const editContactBtnHandler = (record) => {
    setEditFormError({})
    setIsContactEdit(true)
    setContactSelectedForEdit(record)
    setEditContactData(record)
  }

  const editContactCancelBtnHandler = () => {
    setEditFormError({})
    setIsContactEdit(false)
    setContactSelectedForEdit({})
    setEditContactData({})
  }

  const editOnChangeHandler = (e) => {
    let errors = editFormError
    if (errors.hasOwnProperty(e.target.name)) {
      delete errors[e.target.name]
    }
    setEditFormError(errors)
    if (e.target.name == "primary_contact") {
      setEditContactData({ ...editContactData, primary_contact: editContactData.primary_contact == 1 ? 0 : 1 })
    } else {
      setEditContactData({ ...editContactData, [e.target.name]: e.target.value })
    }
  }

  const editContactSaveBtnHandler = (record) => {
    let data = editContactData;
    data.customer_id = record?.customer_id
    validateFormData(contactSchema, data).then(() => {
      updateCustomerContactData(record?.customer_contact_id, data, record?.customer_id)
    }).catch((err) => {
      setEditFormError(err)
    })
  }

  const contactDeleteBtnHandler = (record) => {
    let isConfirm = confirmDelete("contact")
    if (isConfirm) {
      deleteContactData(record.customer_contact_id, record.customer_id)
    }
  }

  // useEffect(() => {
    const conatactColumnDef = [{
      title: 'First Name',
      dataIndex: 'first_name',
      sorter: sortByString(["first_name"]),
      width: 130,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Control
            type="text"
            placeholder="First Name"
            name='first_name'
            value={editContactData?.first_name ?? ""}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
          {editFormError?.first_name ? <span className='ms-2 text-danger'>{editFormError?.first_name}</span> : null}
        </div> : text
      }
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      sorter: sortByString(["last_name"]),
      width: 180,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Control
            type="text"
            placeholder="Last Name"
            name='last_name'
            value={editContactData?.last_name ?? ""}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
          {editFormError?.last_name ? <span className='ms-2 text-danger'>{editFormError?.last_name}</span> : null}
        </div> : text
      }
    },
    {
      title: 'Title',
      dataIndex: 'title',
      sorter: sortByString(["title"]),
      width: 130,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Control
            type="text"
            placeholder="Title"
            name='title'
            value={editContactData?.title ?? ""}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
          {editFormError?.title ? <span className='ms-2 text-danger'>{editFormError?.title}</span> : null}
        </div> : text
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: sortByString(["email"]),
      width: 275,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Control
            type="text"
            placeholder="Email"
            name='email'
            value={editContactData?.email ?? ""}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
          {editFormError?.email ? <span className='ms-2 text-danger'>{editFormError?.email}</span> : null}
        </div> : text
      }
    },
    {
      title: 'Primary Phone',
      dataIndex: 'phone',
      sorter: sortByString(["phone"]),
      width: 170,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Control
            type="text"
            placeholder="Primary Phone"
            name='phone'
            value={editContactData?.phone ?? ""}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
          {editFormError?.phone ? <span className='ms-2 text-danger'>{editFormError?.phone}</span> : null}
        </div> : text
      }
    },
    {
      title: 'Primary Contact',
      dataIndex: 'primary_contact',
      sorter: sortByString(["primary_contact"]),
      width: 180,
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className='input-wrap'>
          <Form.Check
            placeholder="Primary Contact"
            label="Primary Contact"
            name='primary_contact'
            checked={editContactData?.primary_contact == 1 ? true : false}
            onChange={(e) => { editOnChangeHandler(e) }}
          />
        </div> : record?.primary_contact == 1 ? "Yes" : "No"
      }
    },
    {
      title: 'Actions',
      width: 180,
      dataIndex: '',
      render: (text, record) => {
        return (isContactEditMode && record.customer_contact_id == contactSelectedForEdit.customer_contact_id) ? <div className="d-flex">
          <CenterTooltip title="Save">
            <TableBtn className="website me-2" onclick={() => { editContactSaveBtnHandler(record) }}><MdOutlineSave /></TableBtn>
          </CenterTooltip>
          <CenterTooltip title="Cancel">
            <TableBtn className="website me-2" onclick={() => { editContactCancelBtnHandler(record) }}><MdOutlineClose /></TableBtn>
          </CenterTooltip>
        </div> : <div className="d-flex">
          <CenterTooltip title="Edit  ">
            <TableBtn className="website me-2" onclick={() => { editContactBtnHandler(record) }}><MdEdit /></TableBtn>
          </CenterTooltip>
          <CenterTooltip title="Delete  ">
            <TableBtn className="website me-2" onclick={() => { contactDeleteBtnHandler(record) }}><MdDelete /></TableBtn>
          </CenterTooltip>
        </div>
      }
    },
    ];
  // }, [contacts, isContactEditMode, contactSelectedForEdit, editContactData, editFormError, formattedContacts])

  const handleOnPageChange = (pageNumber) => {
    getCustomersListPagination(20, pageNumber)
  }

  const updatePopupCancelBtnClickHandler = () => {
    setPopUps(false)
    setSelectedCustomer(null)
    setUpdatedData(null)
  }

  const errorPopupOnClick = () => {
    setPopupMessageShow(false)
    setPopupMessage("")
  }

  // table onChange handler function 
  const onTableChangeHandler = (pagination, filters, sorter, extra) => {
    const { currentDataSource } = extra
    if (filters.custStatus) {
      let prevFilter = getFilterFromLocal('customers')
      saveFilterToLocal('customers', { ...prevFilter, customer_status: filters.custStatus })
      setStatusFilterValue(filters.custStatus)
    } else {
      let prevFilter = getFilterFromLocal('customers')
      saveFilterToLocal('customers', { ...prevFilter, customer_status: [] })
      setStatusFilterValue([])
    }
    setPaginationData({
      ...paginationData,
      current_page: pagination.current,
      total: currentDataSource.length
    })
  }

  useEffect(() => {
    let d = []
    if (statusFilterValue.length > 0) {
      d = data.filter((item) => {
        if (item.status) {
          return statusFilterValue.includes(item.status.status_id)
        } else {
          return false
        }
      })
    } else {
      d = data
    }
    setPaginationData({
      ...paginationData,
      per_page: paginationPerPage,
      total: d.length,
    })
  }, [data, statusFilterValue])

  useEffect(() => {
    let searchedData = userDetail
    if (globalSearch) {
      setFilters((prev) => ({ ...prev, customer_id: [] }))
      setStatusFilterValue([])
      searchedData = searchedData.filter((item) => {
        return (item.name.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.email?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.phone?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.address1?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.address2?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase()))
      })
    } else {
      if (filter.customer_id.length > 0) {
        searchedData = searchedData.filter((item) => {
          return (filter.customer_id.includes(item.id))
        })
      }
    }
    setData(searchedData)
  }, [globalSearch, userDetail, filter])

  useEffect(() => {
    let savedFilters = getFilterFromLocal('customers')
    setFilters((prev) => ({ ...prev, customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [] }))
    setFilter((prev) => ({ ...prev, customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [] }))
    setStatusFilterValue(savedFilters?.customer_status ? savedFilters.customer_status : [1])
  }, [])

  useEffect(() => {
    const customerId = queryParams.get('id');
    const isEmailLink = queryParams.get('isEmailLink');
    const userId = queryParams.get('user_id');
    let token = localStorage.getItem("token")
    let localUserId = localStorage.getItem("id")
    if (isEmailLink == "true") {
      if (token && (userId == localUserId)) {
        if (customerId) {
          getSingleCustomer(customerId).then((res) => {
            let record = res.data.customer
            updatePopUps(record)
          }).catch((err) => {
            Navigation("/")
          })
        } else {
          Navigation("/")
        }
      } else {
        Navigation("/")
      }
    }
  }, [])

  const contactSearchOnChangeHandler = (e) => { setContactSearch(e.target.value) }

  useEffect(() => {
    let data = contacts
    if (contactSearch) {
      data = data.filter((item) => {
        const searchLower = contactSearch?.trim().toLowerCase();
        const isYes = searchLower == 'yes';
        const isNo = searchLower == 'no';
        return (item.first_name?.toLowerCase()?.includes(contactSearch?.trim()?.toLowerCase())) ||
          (item.last_name?.toLowerCase()?.includes(contactSearch?.trim()?.toLowerCase())) ||
          (item.email?.toLowerCase()?.includes(contactSearch?.trim()?.toLowerCase())) ||
          (item.title?.toLowerCase()?.includes(contactSearch?.trim()?.toLowerCase())) ||
          (item.phone?.toLowerCase().includes(contactSearch?.trim()?.toLowerCase())) ||
          (isYes && item.primary_contact === 1) ||
          (isNo && item.primary_contact === 0);
      })
    }
    setFormattedContacts(data)
  }, [contactSearch, contacts])

  return (
    <>
      <div className="custTable">
        <Table
          sticky={{
            offsetHeader: 0,
          }}
          columns={columns}
          dataSource={data}
          scroll={{ y: `calc(100vh - 250px)` }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => { onRowClick(e, record) }
          })}
          onChange={onTableChangeHandler}
          rowKey="id"
          loading={{
            indicator:
              <LoadingOutlined
                style={{
                  fontSize: 50,
                  color: '#2c0036',
                }}
                spin
              />,
            spinning: isLoading
          }}
          pagination={{
            position: ['bottomRight'],
            pageSize: paginationData.per_page,
            showSizeChanger: paginationSizeChanger
          }}
          footer={() => {
            return paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
              <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
            </div> : null
          }}
        />
      </div>
      <div className={`${popUps ? "mainpopups" : "nomainpopups"}`}>
        <UpdateCust
          paymentTerms={paymentTerms}
          clientStatus={clientStatus}
          countries={countries}
          states={states}
          cities={cities}
          getCustomersList={getCustomersList}
          selectedCustomer={selectedCustomer}
          onClick={updatePopupCancelBtnClickHandler}
          ibUsers={ibUsers}
          formError={formError}
          setFormError={setFormError}
          paginationData={paginationData}
          getCustomersListPagination={getCustomersListPagination}
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
          updatedData={updatedData}
          setUpdatedData={setUpdatedData}
          isFromCustomer={true}
        />
        <div className="blurBg"></div>
      </div>
      <div className={`${customerpopUps ? "centerpopups" : "nocenterpopups"}`}>
        <div className='centerpopups'>
          <div className='popups d-flex justify-content-center align-items-center w-100'>
            <div className='addpopups customer-popup'>
              <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                <div>Contacts</div>
                <div className='myIcon' type='button' onClick={() => { setCustomerpopUps(!customerpopUps); setContactSearch("") }}>
                  <IoIosCloseCircle style={{ width: '28px' }} />
                </div>
              </div>
              <div className='popBody p-3 customer-body'>
                <div>
                  <div className='add-row-wrap'>
                    <div className='input-wrap'>
                      <Form.Select
                        aria-label="Default select example"
                        name="customer_user"
                        value={selectedCustomerUsers?.id ? `${selectedCustomerUsers?.id}` : ""}
                        onChange={customerUserOnChangeHandler}
                      >
                        <option value="" key={0}>Select Existing User</option>
                        {customerUsers?.length > 0 && sortObjectsByAttribute(customerUsers, "first_name")?.map((cu) => {
                          return <option value={cu.id} key={cu.id}>{cu?.first_name ? cu?.first_name : ""} {cu?.last_name ? cu?.last_name : ""}</option>
                        })}
                      </Form.Select>
                    </div>
                    <div className='input-wrap'>
                      <Form.Control
                        readOnly={isSelectedFromUsers}
                        type="text"
                        placeholder="First Name"
                        name="first_name"
                        value={customerContactValues?.first_name ?? ""}
                        onChange={customerAddContactOnChangeHandler}
                      />
                      {addContactFormError?.first_name ? <span className='ms-2 text-danger'>{addContactFormError?.first_name}</span> : null}
                    </div>
                    <div className='input-wrap'>
                      <Form.Control
                        readOnly={isSelectedFromUsers}
                        type="text"
                        placeholder="Last Name"
                        name="last_name"
                        value={customerContactValues?.last_name ?? ""}
                        onChange={customerAddContactOnChangeHandler}
                      />
                      {addContactFormError?.last_name ? <span className='ms-2 text-danger'>{addContactFormError?.last_name}</span> : null}
                    </div>
                    <div className='input-wrap'>
                      <Form.Control
                        readOnly={isSelectedFromUsers}
                        type="text"
                        placeholder="Title"
                        name="title"
                        value={customerContactValues?.title ?? ""}
                        onChange={customerAddContactOnChangeHandler}
                      />
                      {addContactFormError?.title ? <span className='ms-2 text-danger'>{addContactFormError?.title}</span> : null}
                    </div>
                    <div className='input-wrap'>
                      <Form.Control
                        readOnly={isSelectedFromUsers}
                        type="text"
                        placeholder="Email"
                        name="email"
                        value={customerContactValues?.email ?? ""}
                        onChange={customerAddContactOnChangeHandler}
                      />
                      {addContactFormError?.email ? <span className='ms-2 text-danger'>{addContactFormError?.email}</span> : null}
                    </div>
                    <div className='input-wrap'>
                      <Form.Control
                        readOnly={isSelectedFromUsers}
                        type="text"
                        placeholder="Phone"
                        name="phone"
                        value={customerContactValues?.phone ?? ""}
                        onChange={customerAddContactOnChangeHandler}
                      />
                      {addContactFormError?.phone ? <span className='ms-2 text-danger'>{addContactFormError?.phone}</span> : null}
                    </div>
                    <div className='input-wrap'>
                      <Form.Check
                        disabled={isSelectedFromUsers}
                        placeholder="Primary Contact"
                        label="Primary Contact"
                        name="primary_contact"
                        checked={customerContactValues?.primary_contact == 1 ? true : false}
                        onChange={customerAddContactOnChangeHandler}
                      />
                    </div>
                    <div className="add-card-btn">
                      <button className="" type="button" onClick={contactSaveButtonHandler}>Save </button>
                    </div>
                  </div>
                  <div className='credit-card-wrapper'>
                    <div className="header px-3 py-2 d-flex justify-content-between">
                      <div>
                        <span className='pe-2'>
                          <BsFillFileEarmarkPersonFill />
                        </span>
                        Customer Details </div>
                      <div>
                        <div className='input-wrap'>
                          <Form.Control
                            type="text"
                            placeholder="Search..."
                            name="search_contact"
                            value={contactSearch}
                            onChange={contactSearchOnChangeHandler}
                          />
                        </div>
                      </div>
                    </div>
                    <Table columns={conatactColumnDef} dataSource={formattedContacts} rowKey="customer_contact_id" scroll={{ y: `calc(100vh - 250px)` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="blurBg"></div>
        </div>
      </div>
      {/* //file popup */}
      <div className={`${filePop ? "centerpopups" : "nocenterpopups"}`}>
        {(popupMessageShow && popupMessage) && <ErrorPopup title={popupMessage} onClick={errorPopupOnClick} />}
        <div className='centerpopups'>
          <div className='popups d-flex justify-content-center align-items-center w-100'>
            <div className='addpopups customer-doc-popup'>
              <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                <div>Customer Documents</div>
                <div className='myIcon' type='button' onClick={onFileUploadPopupCloseHandler}>
                  <IoIosCloseCircle style={{ width: '28px' }} />
                </div>
              </div>
              <div className='popBody p-3 customer-body'>
                <CustomerDocUpload
                  customRequest={documentUploadCustomRequest}
                  fileList={fileList}
                  onChange={docOnChangehandler}
                  handleDownload={handleDownload}
                  handleRemove={handleRemove}
                />
              </div>
            </div>
          </div>
          <div className="blurBg"></div>
        </div>
      </div>
    </>
  );
};

export default CustTable;
