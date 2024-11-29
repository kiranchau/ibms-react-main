/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import * as FaIcons from "react-icons/fa6";
import Button from '../../commonModules/UI/Button';
import { MdEdit, MdDelete } from "react-icons/md";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import { addCustomerCreditCard, deleteCustomerCreditCard, fetchCustomerCreditCards, updateCustomerCreditCard } from '../../../API/authCurd';
import { creditCardSchema, validateFormData } from '../../../Utils/validation';
import { sortByString } from '../../../Utils/sortFunctions';
import { convertObject, hideText, isObjectNotEmpty } from '../../../Utils/helpers';
import { confirmDelete } from './Dialogue';
import CreditCardForm from './CreditCardForm';

const CreditCardTable = ({ selectedCustomer, setUserDetail }) => {
  const [creditCards, setCreditCards] = useState([]);
  const [addCardPopUps, setAddCardPopUps] = useState(false);
  const [editEditCardPopups, setEditCardPopUps] = useState(false);
  const [values, setValues] = useState({})
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (selectedCustomer) {
      setCreditCards(selectedCustomer.customer_credit_cards)
    }
  }, [selectedCustomer])

  // Column Definition
  const columnsDef = [
    {
      title: 'Card Number ',
      dataIndex: 'credit_card_no',
      sorter: sortByString(["credit_card_no"]),
      ellipsis: true,
      width: 160,
      render: (text, record) => {
        return text
      }
    },
    {
      title: 'CVC ',
      dataIndex: 'cvv',
      sorter: sortByString(["cvv"]),
      ellipsis: true,
      width: 100,
      render: (text, record) => {
        return text ? hideText(text) : ""
      }
    },
    {
      title: 'Type',
      dataIndex: 'card_type',
      sorter: sortByString(["card_type"]),
      ellipsis: true,
      width: 150,
      render: (text, record) => {
        return text
      }
    },
    {
      title: 'Name on card ',
      dataIndex: 'name_on_card',
      sorter: sortByString(["name_on_card"]),
      ellipsis: true,
      width: 180,
      render: (text, record) => {
        return text
      }
    },
    {
      title: 'Expiration Date ',
      dataIndex: 'exp_month_year',
      sorter: sortByString(["exp_month_year"]),
      ellipsis: true,
      width: 150,
      render: (text, record) => {
        return text
      }
    },
    {
      title: 'Address ',
      dataIndex: 'address',
      sorter: sortByString(["address"]),
      ellipsis: true,
      width: 300,
      render: (text, record) => {
        let addressStr = record?.address ? `${record?.address}` : ""
        let cityStr = record?.cities?.name ? `, ${record?.cities?.name}` : ""
        let stateStr = record?.states?.name ? `, ${record?.states?.name}` : ""
        let countryStr = record?.countries?.name ? `, ${record?.countries?.name}` : ""
        let zipcodeStr = record?.zip_code ? `, ${record?.zip_code}` : ""
        let fullAddress = `${addressStr}${cityStr}${stateStr}${countryStr}${zipcodeStr}`
        return fullAddress
      }
    },
    {
      title: 'Actions',
      dataIndex: '',
      width: 90,
      render: (text, record) => (
        <div className='action-btn-wrap'>
          <div className='action-btn'>
            <CenterTooltip title="Edit">
              <TableBtn className="website me-2" onclick={() => editCreditCardBtnHandle(record)} ><MdEdit /></TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Delete  ">
              <TableBtn className="website me-2" onclick={() => { deleteCreditCardBtnHandler(record) }}><MdDelete /></TableBtn>
            </CenterTooltip>
          </div>
        </div>
      )
    },
  ];

  // Get customer credit card list method
  function getCustomerCreditCards(id) {
    fetchCustomerCreditCards(id).then((res) => {
      setCreditCards(res.data?.customer_credit_cards)
      setUserDetail((prev) => {
        return prev.map(item => {
          if (item.id == id) {
            item.customer_credit_cards = res.data?.customer_credit_cards
          }
          return item
        })
      })
    }).catch((err) => { setCreditCards([]) })
  }

  // Delete customer credit card method
  function deleteCustomerCreditCardData(id, customerId) {
    deleteCustomerCreditCard(id).then((res) => {
      getCustomerCreditCards(customerId)
    }).catch((err) => { console.log("deleteCustomerCreditCardData-err: ", err) })
  }

  // Add cutomer credit card method
  function addCustomerCreditCardData(id, data) {
    addCustomerCreditCard(data).then((res) => {
      setValues({})
      setFormErrors({})
      setAddCardPopUps(false);
      getCustomerCreditCards(id)
    }).catch((err) => {
      const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
      if (isObjectNotEmpty(errFromBackend)) {
        setFormErrors((prev) => ({ ...prev, ...errFromBackend }))
      }
    })
  }

  // Update credit card edit button handler method
  const editCreditCardBtnHandle = (record) => {
    setValues({
      customer_credit_card_id: record?.customer_credit_card_id,
      credit_card_no: record?.credit_card_no ?? "",
      exp_month_year: record?.exp_month_year ?? "",
      cvv: record?.cvv ?? "",
      card_type: record?.card_type ?? "",
      name_on_card: record?.name_on_card ?? "",
      country: record?.country ?? "",
      address: record?.address ?? "",
      city: record?.city ?? "",
      state: record?.state ?? "",
      zip_code: record?.zip_code ?? "",
      card_notes: record?.card_notes ?? ""
    })
    setFormErrors({})
    setEditCardPopUps(true);
  }

  // Update credit card cancel button handler method
  const editCreditCardCancelBtnHandle = () => {
    setValues({})
    setFormErrors({})
    setEditCardPopUps(false);
  }

  // Delete credit card button handler method
  const deleteCreditCardBtnHandler = (record) => {
    let isConfirm = confirmDelete("credit card")
    if (isConfirm) {
      deleteCustomerCreditCardData(record?.customer_credit_card_id, record?.customer_id)
    }
  }

  // Update credit card method
  function updateCustomerCreditCardData(id, data, customerId) {
    updateCustomerCreditCard(id, data).then((res) => {
      setValues({})
      setFormErrors({})
      setEditCardPopUps(false);
      getCustomerCreditCards(customerId)
    }).catch((err) => {
      const errFromBackend = convertObject(err.response?.data?.errors ? err.response?.data?.errors : {})
      if (isObjectNotEmpty(errFromBackend)) {
        setFormErrors((prev) => ({ ...prev, ...errFromBackend }))
      }
    })
  }

  // Update credit card save button handler method
  const editCreditCardSaveBtnHandle = () => {
    let data = { ...values }
    data.customer_id = selectedCustomer?.id ? selectedCustomer?.id : null
    validateFormData(creditCardSchema, data).then(() => {
      updateCustomerCreditCardData(values?.customer_credit_card_id, data, selectedCustomer?.id)
    }).catch((err) => {
      setFormErrors(err)
    })
  }

  const onAddSubmitHandler = () => {
    let data = { ...values };
    data.customer_id = selectedCustomer?.id ? selectedCustomer?.id : null 
    validateFormData(creditCardSchema, data).then(() => {
      addCustomerCreditCardData(selectedCustomer?.id, data)
    }).catch((err) => {
      setFormErrors(err)
    })
  }

  const addCreditCardClickHandler = () => {
    setValues({})
    setFormErrors({})
    setAddCardPopUps(true);
  }

  const addCancelButtonHandler = () => {
    setValues({})
    setFormErrors({})
    setAddCardPopUps(false);
  }

  return (
    <div>
      <div className='credit-card-wrapper'>
        <div className="header px-3 py-1 d-flex justify-content-between">
          <div>
            <span className='pe-2'>
              <FaIcons.FaBriefcase />
            </span>
            Credit Cards Details </div>
          <Button className="headBtn" onClick={addCreditCardClickHandler}><FaIcons.FaPlus />Add Credit Card</Button>
        </div>
        <Table columns={columnsDef} dataSource={creditCards} rowKey="id"
          scroll={{ y: `calc(100vh - 700px)` }}
          sticky={{
            offsetHeader: 0,
          }}
        />
      </div>
      {addCardPopUps && <CreditCardForm
        onCancel={addCancelButtonHandler}
        onSubmit={onAddSubmitHandler}
        values={values}
        setValues={setValues}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />}
      {editEditCardPopups && <CreditCardForm
        onCancel={editCreditCardCancelBtnHandle}
        onSubmit={editCreditCardSaveBtnHandle}
        values={values}
        setValues={setValues}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        formType={"Update"}
      />}
    </div>
  )
}
export default CreditCardTable;
