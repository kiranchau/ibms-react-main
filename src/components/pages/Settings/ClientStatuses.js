/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Spin } from 'antd';
import * as FaIcons from 'react-icons/fa';
import { useFormik } from "formik";
import * as BiIcons from 'react-icons/bi';
import { LoadingOutlined } from '@ant-design/icons';
import { IoIosCloseCircle } from "react-icons/io";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import '../../SCSS/popups.scss';
import Button from "../../commonModules/UI/Button";
import { fetchClientStatus, addMasterData, updateMasterData, deleteClientStatus } from '../../../API/authCurd';
import { clientStatusMasterSchema } from '../../../Utils/validation';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const initialValues = { name: "" }

const ClientStatuses = () => {
  const [popUps, setPopUps] = useState(false);
  const [clientStatus, setClientStatus] = useState([]);
  const [popupType, setPopupType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mySpin, setMySpin] = useState(true);

  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting, setFieldValue } = useFormik({
    initialValues,
    validationSchema: clientStatusMasterSchema,
    onSubmit: onSaveClickHandler,
  })

  // Get client statuses function
  const getClientStatus = () => {
    fetchClientStatus().then((res) => {
      if (res.data?.client_status) { setClientStatus(res.data?.client_status) }
    })
      .catch(() => { setClientStatus([]) })
      .finally(() => { setMySpin(true) })
  }

  // Save button click handler function
  function onSaveClickHandler(values, { setSubmitting }) {
    let data = { type: "client_status", name: values.name }
    if (popupType == 'update') {
      setIsSaving(true)
      updateMasterData(data, selectedItem.id).then(() => {
        getClientStatus()
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
        getClientStatus()
        setPopUps(false);
      }).catch(() => {
        setPopUps(false);
      }).finally(() => {
        setIsSaving(false)
        setSubmitting(false)
      })
    }
  }

  useEffect(() => {
    setMySpin(false)
    getClientStatus();
  }, [])

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
    setPopUps(true);
  }

  // Cancel button click handler function
  const cancelButtonClickHandler = () => { setPopUps(false); }

  // Client Status delete method
  function deleteClientStatuses(item) {
    let isConfirm = confirmDelete("client status")
    if (isConfirm) {
      deleteClientStatus(item.id).then(() => {
        getClientStatus()
      }).catch((err) => { console.log("deleteClientStatus-err ", err) })
    }
  }

  return (
    <div className="jobscode">
       <Button className="headBtn mb-2" onClick={addButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> New Client Status</Button>
      <table>
        <tr>
          <th>Name</th>
          <th>
           
          </th>
        </tr>
        {mySpin ? "" : <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />}
        {clientStatus.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className='d-flex gap-2'>
            <CenterTooltip title="Delete ">
              <TableBtn className="website " onclick={() => deleteClientStatuses(item)}>< RiDeleteBin6Fill /> </TableBtn>
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
              <div>{popupType == "update" ? "Update" : "Add"} Client Status</div>
              <div className='myIcon' type='button' onClick={cancelButtonClickHandler}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>
            </div>
            <div className='p-4'>
              <FloatingLabel label="Client Status">
                <Form.Control
                  type="text"
                  placeholder="Client Status"
                  name='name'
                  {...getFieldProps("name")}
                />
              </FloatingLabel>
              {(touched.name && errors.name) ? <span className='ms-2 text-danger'>{errors.name}</span> : null}
            </div>
            <div className='mt-auto popfoot w-100 p-2'>
              <div className='d-flex align-items-center justify-content-center'>
                <Button className="mx-4 cclBtn" onClick={cancelButtonClickHandler}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>Save {isSaving && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="blurBg"></div>
      </div>
    </div>
  );
}

export default ClientStatuses
