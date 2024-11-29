/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import '../../SCSS/popups.scss';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import SqButton from "../../commonModules/UI/SqButton";
import Button from "../../commonModules/UI/Button";
import * as BiIcons from 'react-icons/bi';
import { fetchPaymentTerms, addMasterData, updateMasterData } from '../../../API/authCurd';
import { LoadingOutlined } from '@ant-design/icons';

const initialData = { name: "", no_of_days: "" }

const PaymentTerms = () => {
  const [popUps, setPopUps] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [popupType, setPopupType] = useState('add');
  const [formData, setFormData] = useState(initialData);
  const [mySpin, setMySpin] = useState();

  useEffect(()=>{
    if(paymentTerms.length === 0){
      setMySpin(false);
    }
    else{
      setMySpin(true);
    }
  }, [paymentTerms])

  const getPaymentTerms = () => {
    fetchPaymentTerms().then((res) => {
      if (res.data?.payment_terms) { setPaymentTerms(res.data?.payment_terms) }
    }).catch(() => { setPaymentTerms([]) })
  }

  useEffect(() => {
    getPaymentTerms();
  }, [])

  const addButtonClickHandler = () => {
    setFormData(initialData)
    setPopupType('add');
    setPopUps(!popUps);
  }

  const updateButtonClickHandler = (item) => {
    setFormData(item)
    setPopupType('update');
    setPopUps(!popUps);
  }

  const cancelButtonClickHandler = () => {
    setPopUps(false);
  }

  const saveButtonHandler = () => {
    console.log("saveButtonHandler-payment_terms", formData)

    let data = { type: "payment_terms", name: formData.name, no_of_days: formData.no_of_days }

    if (popupType == 'update') {
      updateMasterData(data, formData.id).then(() => {
        getPaymentTerms()
        setPopUps(false);
      }).catch((err) => {
        setPopUps(false);
      })
    } else if (popupType == 'add') {
      addMasterData(data).then(() => {
        getPaymentTerms()
        setPopUps(false);
      }).catch((err) => {
        setPopUps(false);
      })
    }
  }

  const inputOnChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="jobscode">
      <table>
        <tr>
          <th>Name</th>
          <th>Number of Days</th>
          <th>
            <Button className="headBtn" onClick={addButtonClickHandler}><FaIcons.FaPlus  style={{marginTop: "-3px"}} /> New Term</Button>
          </th>
        </tr>
        {mySpin ? "" : <LoadingOutlined
                style={{
                  fontSize: 50,
                  color: '#2c0036',
                }}
                spin
              /> }
        {paymentTerms.map((item) => (
          <tr>
            <td>{item.name}</td>
            <td>{item.no_of_days}</td>
            <td className='d-flex'>
            <SqButton className="jobcodeBtn">< BiIcons.BiEdit /> Delete</SqButton>
              <SqButton className="jobcodeBtn" onClick={() => updateButtonClickHandler(item)}>< BiIcons.BiEdit /> Edit</SqButton>
            </td>
          </tr>
        ))}
      </table>
      <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
        <div className='popups d-flex justify-content-center align-items-center w-100'>
          <div className='addpopups setting-tab-popup'>
            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
              <div>{popupType == "update" ? "Update" : "Add"} Payment Term</div>
              <div className='myIcon' onClick={() => setPopUps(!popUps)} type="button"><MdIcons.MdOutlineClose /></div>
            </div>
            <div className='d-flex p-4'>
              <div className='w-75 pe-4'>
                <FloatingLabel label="Payment Term">
                  <Form.Control
                    type="text"
                    placeholder="Payment Term"
                    name='name'
                    value={formData.name ?? ""}
                    onChange={inputOnChangeHandler}
                  />
                </FloatingLabel>
              </div>
              <div className='w-25'>
                <FloatingLabel label="Number of Days">
                  <Form.Control
                    type="number"
                    placeholder="Number of Days"
                    name='no_of_days'
                    value={formData.no_of_days ?? ""}
                    onChange={inputOnChangeHandler}
                  />
                </FloatingLabel>
              </div>
            </div>
            <div className='mt-auto popfoot w-100 p-2'>
              <div className='d-flex align-items-center justify-content-center'>
                <Button className="mx-4 cclBtn" onClick={cancelButtonClickHandler}>Cancel</Button>
                <Button type="submit" onClick={saveButtonHandler}>Save</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="blurBg"></div>
      </div>
    </div>
  )
}

export default PaymentTerms
