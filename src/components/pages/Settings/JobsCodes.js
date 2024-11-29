/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Form from 'react-bootstrap/Form';
import * as FaIcons from 'react-icons/fa';
import { IoIosCloseCircle } from "react-icons/io";
import { useFormik } from "formik";
import * as BiIcons from 'react-icons/bi'
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import '../../SCSS/popups.scss';
import Button from "../../commonModules/UI/Button";
import { fetchJobCodes, addMasterData, updateMasterData, deleteJobCode } from "../../../API/authCurd";
import { jobCodeMasterSchema } from '../../../Utils/validation';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { confirmDelete } from '../../commonModules/UI/Dialogue';

const initialValues = { name: "" }

const JobsCodes = () => {
  const [popUps, setPopUps] = useState(false);
  const [jobCodes, setJobCodes] = useState([]);
  const [popupType, setPopupType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mySpin, setMySpin] = useState(true);

  // Formik initialization
  const { errors, resetForm, getFieldProps, handleSubmit, touched, isSubmitting, setFieldValue } = useFormik({
    initialValues,
    validationSchema: jobCodeMasterSchema,
    onSubmit: onSaveClickHandler,
  })

  // Get job codes function
  const getJobCodes = () => {
    fetchJobCodes().then((res) => {
      if (res.data?.job_codes) { setJobCodes(res.data?.job_codes) }
    })
      .catch(() => { setJobCodes([]) })
      .finally(() => { setMySpin(true) })
  }

  useEffect(() => {
    setMySpin(false)
    getJobCodes();
  }, [])

  // Save button click handler function
  function onSaveClickHandler(values, { setSubmitting }) {
    let data = { type: "job_codes", name: values.name }
    if (popupType == 'update') {
      setIsSaving(true)
      updateMasterData(data, selectedItem.id).then(() => {
        getJobCodes()
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
        getJobCodes()
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
    setPopUps(true);
  }

  // Cancel button click handler function
  const cancelButtonClickHandler = () => { setPopUps(false) }

  // Job Code delete method
  function deleteJobCodes(item) {
    let isConfirm = confirmDelete("job code")
    if (isConfirm) {
      deleteJobCode(item.id).then(() => {
        getJobCodes()
      }).catch((err) => { console.log("deleteJobCode-err ", err) })
    }
  }

  return (
    <div className="jobscode">
      <div className=''>
            <Button className="headBtn mb-2" onClick={addButtonClickHandler}><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> New Job Code</Button>
          </div>
      <table>
        <tr>
          <th>Name</th>
          <th></th>
        </tr>
        {mySpin ? "" : <LoadingOutlined style={{ fontSize: 50, color: '#2c0036' }} spin />}
        {jobCodes.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className='d-flex gap-2'>
            <CenterTooltip title="Delete ">
              <TableBtn className="website " onclick={() => deleteJobCodes(item)}>< RiDeleteBin6Fill /> </TableBtn>
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
              <div>{popupType == "update" ? "Update" : "Add"} Job Code</div>
              <div className='myIcon' type='button' onClick={cancelButtonClickHandler}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>
            </div>
            <div className='p-4'>
              <FloatingLabel label="Job Code">
                <Form.Control
                  type="text"
                  placeholder="Job Code"
                  name='name'
                  {...getFieldProps("name")}
                />
              </FloatingLabel>
              {(touched.name && errors.name) ? <span className='ms-2 text-danger'>{errors.name}</span> : null}
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
  );
};

export default JobsCodes;
