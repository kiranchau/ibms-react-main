/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useState, useEffect, useContext } from "react";
import SqButton from "../../commonModules/UI/SqButton";
import TableBtn from "../../commonModules/UI/TableBtn";
import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import MyTooltip from "../../commonModules/UI/MyTooltip";
import * as BiIcons from 'react-icons/bi';
import * as HiIcons from 'react-icons/hi'
import * as AiIcons from 'react-icons/ai';
import * as FaIcons from 'react-icons/fa';
import * as RiIcons from "react-icons/ri";
import { DatePicker, Table, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { IoIosCloseCircle } from "react-icons/io";
import Button from '../../commonModules/UI/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import dayjs from "dayjs"
import 'dayjs/locale/en';

import { deleteCustomerBillItems, fetchCustomerBillItems, fetchCustomerBillItemsExport, generateCustomerBill, updateCustomerBill } from "../../../API/authCurd";
import { calculatePageRange, downloadFile, extractFilename, getFilterFromLocal, getUniqueValuesByKey, openPdfInNewTab, removeNullFromArray, saveFilterToLocal, truncateText } from "../../../Utils/helpers";
import { sortByDate, sortByDateTime, sortByNumber, sortByString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { confirmDelete, confirmWindow } from "../../commonModules/UI/Dialogue";
import { billStatus } from "../../../Utils/staticdata"
import { parseDateTimeString } from "../../../Utils/dateFormat";
import { customerBillSchema, validateFormData } from "../../../Utils/validation";
import { paginationInitialPage, paginationPerPage, paginationSizeChanger } from "../../../Utils/pagination";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import PasswordCustomerFilter from "../../FilterDropdown/PasswordCustomerFilter";

const initialValues = { title: "", bill_date: "" }

const CustBill = (props) => {
  const { RangePicker } = DatePicker;
  const [columns, setColumns] = useState([])
  const [showBtn, setShowBtn] = useState(false)
  const [formattedBillItems, setFormattedBillItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [rangePickerValue, setRangePickerValue] = useState([])
  const [filePop, setFilePop] = useState(false);
  const [filter, setFilter] = useState({
    customer_id: [],
    status: [],
    range: [null, null]
  })
  const [filters, setFilters] = useState({
    customer_id: [],
  })
  const [billSelected, setBillSelected] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormValue, setEditFormValue] = useState(initialValues)
  const [editFormError, setEditFormError] = useState({})
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const tableHeaders = document.querySelectorAll('.ant-table-cell');
  const [isLoader, setIsLoader] = useState(false)
  const [sorterValue, setSorterValue] = useState(null)

  // Remove tooltip on hover by setting title to an empty string
  tableHeaders.forEach(th => {
    th.addEventListener('mouseenter', () => {
      th.setAttribute('title', '');
    });
  });
  // Customer bill delete method
  function deleteCustomerBill(id) {
    deleteCustomerBillItems(id).then(() => {
      props.getCustomerBillItemsList(false)
    }).catch((err) => { console.log("deleteCustomerBill-err ", err) })
  }

  // get PDF report function
  function getPDFCustomerBill(id) {
    return generateCustomerBill(id).then((res) => {
      if (res.data) {
        const blob = new Blob([res.data], { type: res.headers['content-type'] })
        const downloadLink = window.URL.createObjectURL(blob)
        return downloadLink
      }
      return
    }).catch(() => {
      return
    })
  }

  // Generate PDF report button handler
  const generatePdfReport = (record) => {
    getPDFCustomerBill(record.customer_bill_id).then((pdfurl) => {
      if (pdfurl) {
        openPdfInNewTab(pdfurl)
      }
    })
  }

  // custom filter check handler
  const customFilterHandler = (key) => {
    resetSearch()
    let fils = filters
    let prevFilter = getFilterFromLocal('customerBill')
    saveFilterToLocal('customerBill', { ...prevFilter, customer_id: fils.customer_id ? fils.customer_id : [] })
    if (key == "customer_id") {
      setFilter((prev) => ({ ...prev, customer_id: fils?.customer_id ? fils?.customer_id : [] }))
    }
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    let prevFilter = getFilterFromLocal('customerBill')
    saveFilterToLocal('customerBill', { ...prevFilter, [key]: [] })
    if (key == "customer_id") {
      setFilter((prev) => ({ ...prev, customer_id: [] }))
    }
  }

  // Column definition
  useEffect(() => {
    const uniqueClient = getUniqueValuesByKey(props.customerbillItems, "customers")
    let clientArr = removeNullFromArray(uniqueClient)
    const clientFilter = sortObjectsByAttribute(clientArr.map((item) => ({ name: item?.name, id: item?.id })), "name")
    const statusFilter = billStatus.map((item) => ({ text: item?.name, value: item?.id }))
    const columnsDef = [
      {
        title: "Bill No.",
        dataIndex: ["customer_bill_id"],
        key: "customer_bill_id",
        sorter: sortByNumber(["customer_bill_id"]),
        width: 100
      },
      {
        title: "Customer(s)",
        dataIndex: ["customers", "name"],
        key: "customers_name",
        filteredValue: filters.customer_id,
        filterDropdown: (props) => { return <PasswordCustomerFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} allOptions={clientFilter} /> },
        sorter: sortByString(["customers", "name"]),
        width: 260
      },
      {
        title: "Title",
        dataIndex: ["title"],
        key: "title",
        sorter: sortByString(["title"]),
        width: 250

      },
      {
        title: "Total",
        dataIndex: "total_amount",
        key: "total_amount",
        sorter: sortByNumber(["total_amount"]),
        width: 120,
        render: (text, record) => {
          return record.total_amount ? "$" + record.total_amount : ""
        },
      },
      {
        title: "Balance",
        dataIndex: "balance_amount",
        key: "balance_amount",
        sorter: sortByNumber(["balance_amount"]),
        width: 120,
        render: (text, record) => {
          return record.balance_amount ? "$" + record.balance_amount : ""
        },
      },
      {
        title: "Status",
        dataIndex: ["status", "status_id"],
        key: "status",
        filters: statusFilter,
        filteredValue: filter.status,
        width: 130,
        onFilter: (value, record) => record.status?.status_id == value,
        sorter: sortByString(["status", 'status']),
        render: (text, record) => {
          return record?.status?.status ? record.status?.status : null
        }
      },
      {
        title: "Bill Date",
        dataIndex: "bill_date",
        key: "bill_date",
        width: 150,
        sorter: sortByDate(["bill_date"]),
        render: (text, record) => {
          return record.bill_date ? parseDateTimeString(record.bill_date, 6) : null
        }
      },
      {
        title: "Created",
        dataIndex: "created_at",
        key: "created_at",
        width: 150,
        sorter: sortByDateTime(["created_at"]),
        render: (text, record) => {
          return record.created_at ? parseDateTimeString(record.created_at, 12) : null
        }
      },
      {
        title: "Updated",
        dataIndex: "updated_at",
        key: "updated_at",
        width: 150,
        sorter: sortByDateTime(["updated_at"]),
        render: (text, record) => {
          return record.updated_at ? parseDateTimeString(record.updated_at, 12) : null
        }
      },
      {
        title: "Action",
        dataIndex: "",
        key: "",
        width: 120,
        render: (text, record) => (
          <div className="action-btn d-flex">
            <CenterTooltip title="Edit Bill" >
              <TableBtn className="activeLog update-task-btn me-2" onclick={() => onEditCustomerBillHandler(record)}>
                <BiIcons.BiSolidEdit />
              </TableBtn>
            </CenterTooltip>
            <CenterTooltip title="Generate Report">
              <TableBtn className="activeLog update-task-btn me-2" onclick={() => generatePdfReport(record)}>
                <FaIcons.FaNewspaper />
              </TableBtn>
            </CenterTooltip>
            <MyTooltip title="Delete Bill">
              <TableBtn className="activeLog update-task-btn" onclick={() => billDeleteButtonHandler(record)}>
                <RiIcons.RiDeleteBin6Fill />
              </TableBtn>
            </MyTooltip>
          </div>
        ),
      },

    ];
    setColumns(columnsDef)
  }, [formattedBillItems, props.customerbillItems, filter, filters])

  // Filter
  useEffect(() => {
    let formattedData = props.customerbillItems

    const startDate = filter.range[0] ? new Date(filter.range[0]) : null
    const endDate = filter.range[1] ? new Date(filter.range[1]) : null

    if (startDate && endDate) {
      endDate.setDate(endDate.getDate() + 1);

      formattedData = formattedData.filter(item => {
        const createdAtDate = new Date(item.bill_date);
        return createdAtDate >= startDate && createdAtDate < endDate;
      });
    } else if (startDate) {
      formattedData = formattedData.filter(item => {
        return new Date(item.bill_date) >= startDate;
      });
    } else if (endDate) {
      endDate.setDate(endDate.getDate() + 1);

      formattedData = formattedData.filter(item => {
        return new Date(item.bill_date) < endDate;
      });
    }

    if (globalSearch) {
      formattedData = formattedData.filter((item) => {
        const bill_date = item.bill_date ? parseDateTimeString(item.bill_date, 6) : ""
        const created_at = item.created_at ? parseDateTimeString(item.created_at, 6) : ""
        const updated_at = item.updated_at ? parseDateTimeString(item.updated_at, 6) : ""
        const idMatch = item?.customer_bill_id?.toString()?.includes(globalSearch?.trim()?.toLowerCase())
        return (item?.title?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.total_amount?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.customers?.name?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (item.balance_amount?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (bill_date?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (created_at?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) ||
          (updated_at?.toLowerCase().includes(globalSearch?.trim()?.toLowerCase())) || idMatch
      })
    } else {
      if (filter.customer_id?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (filter.customer_id?.includes(item.customer_id))
        })
      }
      if (filter.status?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (filter.status?.includes(`${item.status?.status_id}`))
        })
      }
      if (filter.customer_id?.length > 0) {
        formattedData = formattedData.filter((item) => {
          return (filter.customer_id?.includes(item?.customer_id ? item?.customer_id : ""))
        })
      }
    }
    setFormattedBillItems(formattedData)
  }, [filter, props.customerbillItems, globalSearch])

  // Search filter
  useEffect(() => {
    const serchedData = props.customerbillItems.filter(item => {
      const bill_date = item.bill_date ? parseDateTimeString(item.bill_date, 6) : ""
      const created_at = item.created_at ? parseDateTimeString(item.created_at, 6) : ""
      const updated_at = item.updated_at ? parseDateTimeString(item.updated_at, 6) : ""
      const idMatch = item?.customer_bill_id?.toString()?.includes(searchTerm.toLowerCase())
      return (item.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.balance_amount?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.total_amount?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bill_date?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (created_at?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (updated_at?.toLowerCase().includes(searchTerm.toLowerCase())) || idMatch
    });
    setFormattedBillItems(serchedData)
  }, [searchTerm])

  // Date range picker onchange handler
  function onRangePickerChangeHandler(value, datestring) {
    setRangePickerValue(value)
    let fils = { ...filter, range: datestring }
    saveFilterToLocal('customerBill', fils)
    setFilter({ ...filter, range: datestring })
  }

  // Bill delete button handler
  const billDeleteButtonHandler = (record) => {
    let isConfirm = confirmWindow("Are you sure you would like to delete this bill?")
    if (isConfirm) {
      deleteCustomerBill(record.customer_bill_id)
    }
  }

  // Edit customer bill button handler
  const onEditCustomerBillHandler = (record) => {
    setEditFormError({})
    setBillSelected(record)
    setFilePop(true)
    setEditFormValue({
      title: record.title ? record.title : "",
      bill_date: record.bill_date ? parseDateTimeString(record.bill_date, 8) : ""
    })
  }

  // Edit customer bill cancel handler
  const onEditCustomerBillCancelHandler = () => {
    setEditFormError({})
    setBillSelected(null)
    setFilePop(false)
  }

  // on title change handler 
  const onTitleChangeHandler = (e) => {
    let errors = editFormError
    if (errors.hasOwnProperty("title") ) {
      delete errors["title"]
    }
    setEditFormError(errors)
    setEditFormValue({ ...editFormValue, title: e.target.value })
  }

  // on bill date change handler 
  const onBillDateChangeHandler = (values, datestring) => {
    setEditFormValue({ ...editFormValue, bill_date: datestring })
  }

  // update customer method
  function updateCustomerBillData(id, data) {
    updateCustomerBill(id, data).then(() => {
      props.getCustomerBillItemsList()
      onEditCustomerBillCancelHandler()
    }).catch((err) => {
      console.log("updateCustomerBill-err: ", err)
    }).finally(() => {
      setIsSaving(false)
    })
  }

  // on save button click handler 
  const saveButtonClickHandler = () => {
    let data = {
      ...editFormValue,
      title: editFormValue.title ? editFormValue.title : "",
      bill_date: editFormValue.bill_date ? parseDateTimeString(editFormValue.bill_date, 5) : ""
    }
    validateFormData(customerBillSchema, data).then(() => {
      setIsSaving(true)
      updateCustomerBillData(billSelected?.customer_bill_id, data)
    }).catch((err) => {
      setEditFormError(err)
    })
  }
  // table onChange handler function 
  const onTableChangeHandler = (pagination, filters, sorter, extra) => {
    const { currentDataSource } = extra

    if (filters.status) {
      setFilter((prev) => ({ ...prev, status: filters.status }))
      let prevFilter = getFilterFromLocal('customerBill')
      saveFilterToLocal('customerBill', { ...prevFilter, status: filters.status })
    } else {
      setFilter((prev) => ({ ...prev, status: filters.status }))
      let prevFilter = getFilterFromLocal('customerBill')
      saveFilterToLocal('customerBill', { ...prevFilter, status: filters.status })
    }
    if (sorter && Object.keys(sorter).length != 0) {
      setSorterValue(`${sorter.columnKey}-${sorter.order}`)
    } else {
      setSorterValue(null);
    }
    props.setPaginationData({
      ...props.paginationData,
      current_page: pagination.current,
      total: currentDataSource.length
    })
  }

  useEffect(() => {
    if (sorterValue) {
      props.setPaginationData((prev) => ({ ...prev, current_page: 1 }))
    }
  }, [sorterValue])

  useEffect(() => {
    let savedFilters = getFilterFromLocal('customerBill')
    let searchParams = {
      customer_id: savedFilters?.customer_id ? savedFilters.customer_id : [],
      status: savedFilters?.status ? savedFilters.status : [],
      range: savedFilters?.range ? savedFilters.range : [null, null],
    }
    setFilters({ customer_id: savedFilters?.customer_id ? savedFilters.customer_id : [] })
    setFilter(searchParams)
    setRangePickerValue([savedFilters?.range?.[0] ? dayjs(savedFilters?.range?.[0]) : null, savedFilters?.range?.[1] ? dayjs(savedFilters?.range?.[1]) : null])
  }, [])

  useEffect(() => {
    props.setPaginationData({
      ...props.paginationData,
      per_page: paginationPerPage,
      total: formattedBillItems.length,
    })
  }, [formattedBillItems])

  // Export excel report
  function exportExcelReport() {
    setIsLoader(true)
    let fils = {
      customer_id: filter?.customer_id ? filter?.customer_id : [],
      status: filter?.status ? filter?.status : [],
      start_date: filter?.range?.[0] ? filter?.range?.[0] : "",
      end_date: filter?.range?.[1] ? filter?.range?.[1] : ""
    }
    let search = JSON.stringify(fils)
    fetchCustomerBillItemsExport(1, search).then((res) => {
      if (res.data) {
        const filename = extractFilename(res)
        const blob = new Blob([res.data], { type: res.headers['content-type'] })
        const downloadLink = window.URL.createObjectURL(blob)
        downloadFile(downloadLink, filename)
      }
      setIsLoader(false)
    }).catch(err => {
      setIsLoader(false)
    })
  }

  //  export excel button handler
  const onGenerateExcelButtonHandler = () => {
    exportExcelReport()
  }

  return (<>
    <div className="py-0 px-0 main-container custbill-tab-wrap">
      <div className="d-flex  flex-wrap p-2 align-items-center billSubHead">
        <SqButton onClick={onGenerateExcelButtonHandler} className="py-2"><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Excel Report {isLoader && <Spin indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</SqButton>
        <div className="d-flex px-5">
        </div>
        <div className="d-flex align-items-center billdatepicker">
          <RangePicker format={'MM/DD/YYYY'} value={rangePickerValue} onCalendarChange={onRangePickerChangeHandler} />
          {showBtn ? <> <button className="BillClearBtn ms-3">
            <HiIcons.HiSearch />
          </button>
            <button className="BillClearBtn ms-3">
              <AiIcons.AiOutlineClear />
            </button></> : ""}
        </div>
      </div>
      <div className="w-100">
        <Table
          columns={columns}
          sticky={{
            offsetHeader: 0,
          }}
          loading={{
            indicator:
              <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />,
            spinning: props.custBillIsLoading
          }}
          scroll={{ y: `calc(100vh - 300px)` }}
          dataSource={formattedBillItems}
          rowKey="id"
          onChange={onTableChangeHandler}
          pagination={{
            position: ['bottomRight'],
            pageSize: props.paginationData.per_page,
            current: props.paginationData.current_page,
            showSizeChanger: paginationSizeChanger
          }}
          footer={() => {
            return props.paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
              <p className="mb-0">{calculatePageRange(props.paginationData.current_page, props.paginationData.per_page, props.paginationData.total)}</p>
            </div> : null
          }}
        />
      </div>

    </div>
    {/* //file popup */}
    <div className={`${filePop ? "centerpopups bill-modal" : "nocenterpopups"}`}>
      <div className='centerpopups'>
        <div className='popups d-flex justify-content-center align-items-center w-100'>
          <div className='addpopups customer-doc-popup'>
            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
              <div>{billSelected?.customer_bill_id ? `Editing... - ${billSelected?.customer_bill_id}` : ""}</div>
              <div className='myIcon' type='button' onClick={onEditCustomerBillCancelHandler}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>
            </div>
            <div className='popBody p-3 customer-body'>
              <div className="edit-vlaue-wrap">
                <div className="label-value">
                  <label>
                    BILL NO
                  </label>
                  <p className="value">{billSelected?.customer_bill_id ? billSelected?.customer_bill_id : ""}</p>
                </div>
                <div className="label-value">
                  <label>
                    TOTAL
                  </label>
                  <p className="value">{billSelected?.total_amount ? `$${billSelected?.total_amount}` : ""}</p>
                </div>
                <div className="label-value">
                  <label>
                    STATUS
                  </label>
                  <p className="value">
                    {billSelected?.status ? billSelected?.status.status : "Unpaid"}
                  </p>
                </div>
                <div className="label-value">
                  <label>
                    ADDED
                  </label>
                  <p className="value">{billSelected?.created_at ? parseDateTimeString(billSelected?.created_at, 7) : ""}</p>
                </div>

                <div className="label-value">
                  <label>
                    UPDATED
                  </label>
                  <p className="value">{billSelected?.updated_at ? parseDateTimeString(billSelected?.updated_at, 7) : ""}</p>
                </div>
              </div>
              <div className="edit-field">
                <div className='input-wrap'>
                  <FloatingLabel label="TITLE">
                    <Form.Control
                      type="text"
                      placeholder="TITLE"
                      name='title'
                      value={editFormValue.title}
                      onChange={onTitleChangeHandler}
                    />
                  </FloatingLabel>
                  {editFormError?.title ? <span className='ms-2 text-danger'>{editFormError?.title}</span> : null}
                </div>
                <div className='myInputBox'>
                  <label style={{ display: "block" }}>DATE BILLED</label>
                  <DatePicker
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    name='bill_date'
                    value={editFormValue?.bill_date ? dayjs(editFormValue?.bill_date, "MM/DD/YYYY") : ""}
                    onChange={onBillDateChangeHandler}
                  />
                </div>
              </div>
              <div className="edit-table">
                <p className="title">PAYMENTS</p>
                <div className="rowstyle">
                  <div className="column">
                    <p className="header">Date Paid</p>
                  </div>
                  <div className="column">
                    <p className="header">Amount	Reference</p>
                  </div>
                </div>
                <div className="rowstyle">
                  <div className="column">
                    <p className="header">{billSelected?.customer_bill_payments?.bill_date ? parseDateTimeString(billSelected?.customer_bill_payments?.bill_date, 6) : ""}</p>
                  </div>
                  <div className="column">
                    <p className="header">{billSelected?.customer_bill_payments?.amount_paid ? `$${billSelected?.customer_bill_payments?.amount_paid}` : ""}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-auto popfoot w-100 p-2'>
              <div className='d-flex align-items-center justify-content-center'>
                <Button className="mx-4 cclBtn" onClick={onEditCustomerBillCancelHandler}>Cancel</Button>
                <Button disabled={isSaving} type="button" onClick={saveButtonClickHandler}>Save {isSaving && <Spin className="ms-2 text-white" indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="blurBg"></div>
      </div>
    </div>
  </>
  );
};

export default CustBill;
