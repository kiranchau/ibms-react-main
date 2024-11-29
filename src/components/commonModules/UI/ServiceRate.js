/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import * as FaIcons from "react-icons/fa6";
import { MdEdit, MdOutlineSave, MdOutlineClose } from "react-icons/md";
import CenterTooltip from "./CenterTooltip";
import TableBtn from "./TableBtn";
import Form from 'react-bootstrap/Form';
import { addCustomerServiceType, fetchCustomerServiceRates, updateCustomerServiceType } from '../../../API/authCurd';
import { sortByString } from '../../../Utils/sortFunctions';
import { serviceRateSchema, validateFormData } from '../../../Utils/validation';
import { numCheck } from '../../../Utils/helpers';
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

const ServiceRate = ({ selectedCustomer }) => {
  const [serviceRates, setServiceRates] = useState([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState({})
  const [formValue, setFormvalue] = useState({ 
    service_name: "", 
    default_rate: "" 
  })
  const [formError, setFormError] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [popupMessageShow, setPopupMessageShow] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  function getCustomerServiceRates(id) {
    fetchCustomerServiceRates(id).then((res) => {
      if (res.data?.service_types) { setServiceRates(res.data?.service_types) }
    }).catch(() => { setServiceRates([]) })
  }

  // Add customer service rates method
  function addCustomerServiceData(data, customerId) {
    setIsLoading(true)
    addCustomerServiceType(data).then((res) => {
      setPopupMessageShow(true)
      setPopupMessage("Service Rates Updated Successfully")
      setIsLoading(false)
      setFormError({})
      setIsEditMode(false)
      setSelectedForEdit({})
      setFormvalue({ 
        default_rate: "" 
      })
      getCustomerServiceRates(customerId)
    }).catch((err) => { 
      setPopupMessageShow(false)
      setPopupMessage("")
      setIsLoading(false)
      console.log("addCustomerServiceData", err) 
    })
  }

  // Update customer service rates method
  function updateCustomerServiceData(id, data, customerId) {
    setIsLoading(true)
    updateCustomerServiceType(id, data).then((res) => {
      setPopupMessageShow(true)
      setPopupMessage("Service Rates Updated Successfully")
      setIsLoading(false)
      setFormError({})
      setIsEditMode(false)
      setSelectedForEdit({})
      setFormvalue({ 
        service_name: "", 
        default_rate: "" 
      })
      getCustomerServiceRates(customerId)
    }).catch((err) => { 
      setPopupMessageShow(false)
      setPopupMessage("")
      setIsLoading(false)
      console.log("updateCustomerServiceData", err) 
    })
  }

  useEffect(() => {
    if (selectedCustomer) {
      setIsEditMode(false)
      getCustomerServiceRates(selectedCustomer.id)
    }
  }, [selectedCustomer])

  // Form inputs onChange handler method
  const onChangeHandler = (e) => {
    let errors = formError
    if (errors.hasOwnProperty(e.target.name)) {
      delete errors[e.target.name]
    }
    setFormError(errors)
    setFormvalue({ ...formValue, [e.target.name]: e.target.value })
  }

  // Edit button Handler method
  const editBtnHandler = (record) => {
    setFormError({})
    setIsEditMode(true)
    setSelectedForEdit(record)
    setFormvalue({ 
      service_name: record.service_type_name ? record.service_type_name : record.name, 
      default_rate: record.customer_default_rate ? record?.customer_default_rate : record?.default_rate 
    })
  }

  // Cancel button handler method
  const cancelBtnHandler = (record) => {
    setFormError({})
    setIsEditMode(false)
    setSelectedForEdit({})
    setFormvalue({ 
      service_name: "", 
      default_rate: "" 
    })
  }

  // Save button handler method
  // If customer_service_type_id is present then call Update api else call Post api
  const saveBtnHandler = (record) => {
    if (record?.customer_service_type_id) {
      let data = {
        customer_id: selectedCustomer.id,
        service_type_id: record.id,
        service_name: formValue.service_name,
        default_rate: formValue.default_rate
      }
      validateFormData(serviceRateSchema, data).then(() => {
        updateCustomerServiceData(record?.customer_service_type_id, data, selectedCustomer.id)
      }).catch((err) => {
        setFormError(err)
      })
    } else {
      let data = {
        customer_id: selectedCustomer.id,
        service_type_id: record.id,
        service_name: formValue.service_name,
        default_rate: formValue.default_rate
      }
      validateFormData(serviceRateSchema, data).then(() => {
        addCustomerServiceData(data, selectedCustomer.id)
      }).catch((err) => {
        setFormError(err)
      })
    }
  }

  // Column definition
    const columnDef = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: sortByString(["name"]),
        width:120,
        render: (text, record) => {
          return record.name ? record.name : ""
        }
      },
      {
        title: 'Rate',
        dataIndex: 'default_rate',
        sorter: sortByString(["default_rate"]),
        width:120,
        render: (text, record) => {
          return (isEditMode && record.id == selectedForEdit.id) ? <div className='input-wrap'>
            <Form.Control
              placeholder="Rate"
              label="Rate"
              name='default_rate'
              type='number'
              step={0.01}
              onKeyDown={(e) => numCheck(e)}
              value={formValue?.default_rate ?? ""}
              onChange={(e) => { onChangeHandler(e) }}
            />
            {formError?.default_rate ? <span className='ms-2 text-danger'>{formError?.default_rate}</span> : null}
          </div> : record.customer_default_rate ? `$${record.customer_default_rate}` : record.default_rate ? `$${record.default_rate}` : ""
        }
      },
      {
        title: 'Actions',
        dataIndex: '',
        width: 200,
        render: (text, record) => {
          return (isEditMode && record.id == selectedForEdit.id) ? <div className="d-flex">
            <CenterTooltip title="Save">
              <TableBtn className="website me-2" onclick={() => { saveBtnHandler(record) }}>{((record.id == selectedForEdit.id) && isLoading) ? <Spin className="text-white" indicator={<LoadingOutlined style={{ fontSize: 13, color: '#2c0036' }} spin />} /> : <MdOutlineSave />}</TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Delete  ">
              <TableBtn className="website me-2" onclick={() => { cancelBtnHandler(record) }}><MdOutlineClose /></TableBtn>
            </CenterTooltip>
          </div> : <CenterTooltip title="Edit  ">
            <TableBtn className="website me-2" onclick={() => { editBtnHandler(record) }} ><MdEdit /></TableBtn>
          </CenterTooltip>
        }
      },
    ];

  const errorPopupOnClick = () => {
    setPopupMessageShow(false)
    setPopupMessage("")
  }

  return (
    <div>
      <div className='credit-card-wrapper service-rate-wrap'>
        <div className="header px-3 py-1 d-flex justify-content-between">
          <div>
            <span className='pe-2'>
              <FaIcons.FaBriefcase />
            </span>
            Service Rates </div>
        </div>
        <Table scroll={{ x: `calc(100vh - 250px)` }} columns={columnDef} dataSource={serviceRates} rowKey="id" pagination={false} 
         
        />
      </div>
      {popupMessageShow && <div className={`centerpopups`}>
        <div className='popups quickpopup d-flex justify-content-center align-items-center w-100'>
          <div className='addpopups quickpopupDesign successfully-popup'>
            <div className='text-center'>
              <h3>{popupMessage}</h3>
            </div>
            <div className='mt-auto popfoot w-100 p-2'>
              <div className='d-flex align-items-center justify-content-center'>
                <button className="OkBtn rounded" type="button" onClick={errorPopupOnClick}>Ok</button>
              </div>
            </div>
          </div>
        </div>
        <div className="blurBg"></div>
      </div>}
    </div>
  )
}

export default ServiceRate;