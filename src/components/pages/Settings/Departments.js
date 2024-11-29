/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as BiIcons from 'react-icons/bi'
import { useFormik } from "formik";
import * as FaIcons from 'react-icons/fa';
import { IoIosCloseCircle } from "react-icons/io";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import '../../SCSS/popups.scss';
import Button from "../../commonModules/UI/Button";
import { fetchDepartments, addMasterData, updateMasterData, deleteDepartment } from '../../../API/authCurd';
import { departmentMasterSchema } from '../../../Utils/validation';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const initialValues = { name: "", abbreviation: "" }

const Departments = () => {
  const [popUps, setPopUps] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [popupType, setPopupType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mySpin, setMySpin] = useState(true);

  // Formik initialization
  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting, setFieldValue } = useFormik({
    initialValues,
    validationSchema: departmentMasterSchema,
    onSubmit: onSaveClickHandler,
  })

  // Get Departments function
  const getDepartments = () => {
    fetchDepartments().then((res) => {
      if (res.data?.departments) { setDepartments(res.data?.departments) }
    })
      .catch(() => { setDepartments([]) })
      .finally(() => { setMySpin(true) })
  }

  useEffect(() => {
    getDepartments();
  }, [])

  // Save button click handler function
  function onSaveClickHandler(values, { setSubmitting }) {
    let data = { type: "departments", name: values.name, abbreviation: values.abbreviation }
    if (popupType == 'update') {
      setIsSaving(true)
      updateMasterData(data, selectedItem.id).then(() => {
        getDepartments()
        setPopUps(false);
      }).catch((err) => {
        setPopUps(false);
      }).finally(() => {
        setIsSaving(false)
        setSubmitting(false)
      })
    } else if (popupType == 'add') {
      setIsSaving(true)
      addMasterData(data).then(() => {
        getDepartments()
        setPopUps(false);
      }).catch((err) => {
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
    setFieldValue("abbreviation", item.abbreviation)
    setPopUps(true);
  }

  // Cancel button click handler function
  const cancelButtonClickHandler = () => { setPopUps(false); }

  // Department delete method
  function deleteDepartments(item) {
    let isConfirm = confirmDelete("department")
    if (isConfirm) {
      deleteDepartment(item.id).then(() => {
        getDepartments()
      }).catch((err) => { console.log("deleteDepartment-err ", err) })
    }
  }

  return (
    <div className="jobscode">
            <Button className="headBtn mb-2" onClick={addButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> New Department</Button>
      <table>
        <tr>
          <th>Name</th>
          <th>Abbreviation</th>
          <th>
          </th>
        </tr>
        {mySpin ? "" : <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />}
        {departments.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.abbreviation}</td>
            <td className='d-flex gap-2'>
            <CenterTooltip title="Delete ">
              <TableBtn className="website " onclick={() => deleteDepartments(item)}>< RiDeleteBin6Fill /> </TableBtn>
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
          <div className='addpopups'>
            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
              <div>{popupType == "update" ? "Update" : "Add"} Department</div>
              <div className='myIcon' type='button' onClick={cancelButtonClickHandler}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>

            </div>
            <div className='d-flex p-4 setting-tab-popup-content flex-wrap'>
              <div className='pe-0 pe-lg-4 input-width'>
                <FloatingLabel label="Department Name">
                  <Form.Control
                    type="text"
                    placeholder="Department Name"
                    name='name'
                    {...getFieldProps("name")}
                  />
                </FloatingLabel>
                {(touched.name && errors.name) ? <span className='ms-2 text-danger'>{errors.name}</span> : null}
              </div>
              <div className='input-width'>
                <FloatingLabel label="Abbreviation">
                  <Form.Control
                    type="text"
                    placeholder="Abbreviation"
                    name='abbreviation'
                    {...getFieldProps("abbreviation")}
                  />
                </FloatingLabel>
                {(touched.abbreviation && errors.abbreviation) ? <span className='ms-2 text-danger'>{errors.abbreviation}</span> : null}
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

export default Departments
