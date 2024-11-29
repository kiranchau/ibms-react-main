/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import * as BiIcons from 'react-icons/bi';
import * as FaIcons from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { IoIosCloseCircle } from "react-icons/io";
import { Spin } from 'antd';
import { useFormik } from "formik";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import '../../SCSS/popups.scss';
import Button from "../../commonModules/UI/Button";
import { fetchServiceTypes, addMasterData, updateMasterData, deleteServiceType } from '../../../API/authCurd';
import { serviceTypeMasterSchema } from '../../../Utils/validation';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const initialValues = { name: "", default_rate: "" }

const ServiceType = () => {
  const [popUps, setPopUps] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [popupType, setPopupType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mySpin, setMySpin] = useState(true);

  // Formik initialization
  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting, setFieldValue } = useFormik({
    initialValues,
    validationSchema: serviceTypeMasterSchema,
    onSubmit: onSaveClickHandler,
  })

  // Get Service types function
  const getServiceTypes = () => {
    fetchServiceTypes().then((res) => {
      if (res.data?.service_types) { setServiceTypes(res.data?.service_types) }
    })
      .catch(() => { setServiceTypes([]) })
      .finally(() => { setMySpin(true) })
  }

  useEffect(() => {
    getServiceTypes();
  }, [])

  // Save button click handler function
  function onSaveClickHandler(values, { setSubmitting }) {
    let data = { type: "service_types", name: values.name, default_rate: values.default_rate }
    if (popupType == 'update') {
      setIsSaving(true)
      updateMasterData(data, selectedItem.id).then(() => {
        getServiceTypes()
        setPopUps(false);
      }).catch(() => {
        setPopUps(false);
      }).finally(() => {
        setIsSaving(false)
        setSubmitting(false)
      })
    } else if (popupType == 'add') {
      setIsSaving(true)
      addMasterData(data).then(() => {
        getServiceTypes()
        setPopUps(false);
      }).catch(() => {
        setPopUps(false);
      }).finally(() => {
        setIsSaving(false)
        setSubmitting(false)
      })
    }
  }

  // Add button click handler function
  const addButtonClickHandler = () => {
    setPopupType('add');
    setPopUps(true);
    resetForm()
  }

  // Update button click handler function
  const updateButtonClickHandler = (item) => {
    resetForm()
    setSelectedItem(item)
    setPopupType('update');
    setFieldValue("name", item.name)
    setFieldValue("default_rate", item.default_rate)
    setPopUps(true);
  }

  // Cancel button click handler function
  const cancelButtonClickHandler = () => { setPopUps(false); }

  // Service type delete method
  function deleteServiceTypes(item) {
    let isConfirm = confirmDelete("service type")
    if (isConfirm) {
      deleteServiceType(item.id).then(() => {
        getServiceTypes()
      }).catch((err) => { console.log("deleteServiceType-err ", err) })
    }
  }

  return (
    <div className="jobscode">
            <Button className="headBtn mb-2" onClick={addButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> New Service Type</Button>
      <table>
        <tr>
          <th>Name</th>
          <th>Rate</th>
          <th>
          </th>
        </tr>
        {mySpin ? "" : <LoadingOutlined style={{ fontSize: 50, color: '#2c0036' }} spin />}
        {serviceTypes.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.default_rate ? `$${item.default_rate}` : ""}</td>
            <td className='d-flex gap-2'>
            <CenterTooltip title="Delete ">
              <TableBtn className="website " onclick={() => deleteServiceTypes(item)}>< RiDeleteBin6Fill /> </TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Edit ">
              <TableBtn className="website " onclick={() => updateButtonClickHandler(item)}>< BiIcons.BiEdit /> </TableBtn>
            </CenterTooltip>
            </td>
          </tr>
        ))}
      </table>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <div className='popups d-flex justify-content-center align-items-center w-100'>
          <div className='addpopups setting-tab-popup'>
            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
              <div>{popupType == "update" ? "Update" : "Add"} Service Type</div>
              <div className='myIcon' type='button' onClick={() => setPopUps(!popUps)}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>

            </div>
            <div className='d-flex p-4 setting-tab-popup-content flex-wrap'>
              <div className='pe-0 pe-lg-4 input-width'>
                <FloatingLabel label="Service Type">
                  <Form.Control
                    type="text"
                    placeholder="Service Type"
                    name='name'
                    {...getFieldProps("name")}
                  />
                </FloatingLabel>
                {(touched.name && errors.name) ? <span className='ms-2 text-danger'>{errors.name}</span> : null}
              </div>
              <div className='input-width'>
                <FloatingLabel label="Default rate">
                  <Form.Control
                    // type="number"
                    placeholder="Default rate"
                    name='default_rate'
                    {...getFieldProps("default_rate")}
                  />
                </FloatingLabel>
                {(touched.default_rate && errors.default_rate) ? <span className='ms-2 text-danger'>{errors.default_rate}</span> : null}
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
  )
}

export default ServiceType
