/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
import React, { useState, useEffect, useContext } from "react";
import SqButton from "../../commonModules/UI/SqButton";
import * as AiIcons from 'react-icons/ai'
import * as HiIcons from 'react-icons/hi'
import * as FaIcons from 'react-icons/fa'
import { LoadingOutlined } from '@ant-design/icons';
import { DatePicker, Table, Spin, Tooltip } from 'antd';
import { IoIosCloseCircle } from "react-icons/io";
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import Button from '../../commonModules/UI/Button';
import { addCustomerBillItems, fetchBillableItems, fetchBillableItemsPagination, fetchBillableItemsPaginationExport, fetchBillableItemsPaginationTotal, getCust, getSelectedItemsTotal } from "../../../API/authCurd";
import { calculatePageCount, calculatePageRange, calculateTotalCost, downloadFile, extractFilename, getFilterFromLocal, numberWithCommas, removeDuplicatesAndUndefined, saveFilterToLocal } from "../../../Utils/helpers";
import { billingTypes } from "../../../Utils/staticdata"
import { sortByDate, sortByString, sortObjectsByAttribute } from "../../../Utils/sortFunctions";
import { parseDateTimeString } from "../../../Utils/dateFormat";
import { generateBillSchema, validateFormData } from "../../../Utils/validation";
import { paginationInitialPage, paginationSizeChanger } from "../../../Utils/pagination";
import { GlobalSearch } from "../../contexts/GlobalSearchContext";
import { BillTypeFilter, BilledFilter, CustomerFilter, JobFilter, PaidFilter, TaskFilter, UserFilter } from "../../FilterDropdown";
import { CustomerContext } from "../../contexts/CustomerContext";
import UpdateCust from "../../popups/custpops/UpdateCust";
import { JobContext } from "../../contexts/JobContext";
import UpdateForm from "../../popups/jobspopups/updateForm";
import { TaskContext } from "../../contexts/TaskContext";
import TaskUpdate from "../../popups/taskpops/TaskUpdate";
import { FaSquareArrowUpRight } from "react-icons/fa6";
import ErrorPopup from "../../commonModules/UI/ErrorPopup";
import dayjs from "dayjs"
import 'dayjs/locale/en';
import CallEntryPopup from "../../popups/taskpops/CallEntryPopup";
import { CallTimeEntryContext } from "../../contexts/CallTimeEntryContext";
const paginationPerPage = 50

const BillItems = (props) => {
  const { RangePicker } = DatePicker;
  const [columns, setColumns] = useState([])
  const [showBtn, setShowBtn] = useState(false)
  const [billableItems, setBillableItems] = useState([]);
  const [formattedBillableItems, setFormattedBillableItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [paginationData, setPaginationData] = useState({
    current_page: 1,
    prev_page_url: "",
    next_page_url: "",
    per_page: "",
    total: "",
    pages: 0
  })
  const [rangePickerValue, setRangePickerValue] = useState([])
  const [filter, setFilter] = useState({
    range: [null, null]
  })
  const [totalCost, setTotalCost] = useState("")
  const [fiteredTotal, setFilteredTotal] = useState(0)
  const [genLoader, setGenLoader] = useState(false)
  const [isLoader, setIsLoader] = useState(false)
  const [billData, setBillData] = useState(null)
  const [filePop, setFilePop] = useState(false);
  const [formValue, setFormValue] = useState({ title: "" })
  const [formError, setFormError] = useState({})
  const { globalSearch, resetSearch } = useContext(GlobalSearch)
  const tableHeaders = document.querySelectorAll('.ant-table-cell');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    customer_id:  [],
    job_id:  [],
    task_id:  [],
    user_id:  [],
    billing_type:  [],
    is_billed:  ["0"],
    is_paid:  [],
    global_search: "",
    start_date: "",
    end_date: ""
  })
  const [selectedRows, setSelectedRows] = useState([])
  const {
    jobOpenPopup, jobSectionCodes, JobPaymentTerms, JobCustomerList, selectedJobForSection, setSelectedJobForSection,
    JobResponsibleUser, JobFormError, setJobFormError, updateJobCancelClickHandler, updateJobPopupOpen, jobSuccessMessage, setJobSuccessMessage
  } = useContext(JobContext)
  const {
    openTaskPopup, TaskServiceTypes, TaskPaymentTerms, taskCustomerList, taskSectionUpdateDetail, settaskSectionUpdateDetail, taskFormError,
    setTaskFormError, taskUpdatedtaskData, setTaskUpdatetaskdData, taskIsCallEntry, onTaskCancelBtnHandler, updateTaskPopupOpen, 
    taskSuccessMessage, setTaskSuccessMessage
  } = useContext(TaskContext)
  const { openCustomerPopup, customerPaymentTerms, customerStatus, customerCountries, customerStates, customerCities,
    selectedCustomer, customerIbUsers, customerFormError, setCustomerFormError, setCustomerUserDetail, customerCreditFormError,
    setCustomerCreditFormError, customerCreditEditFormError, setCustomerCreditEditFormError, customerCreditAddFormValue,
    setCustomerCreditAddFormValue, customerCreditEditFormValue, setCustomerCreditEditFormValue, customerCreditIsEditMode,
    setCustomerCreditIsEditMode, customerUpdatedData, setCustomerUpdatedData, updateCustomerCancelClickHandler,
    updateCustomerPopupOpen } = useContext(CustomerContext)
    const [selectedCustomers, setSetSelectedCustomers] = useState([]);
    const [successMessage, setSeccessMessage] = useState("");
    const [showMsg, setShowMsg] = useState(false);
    const [selectedTotal, setSelectedTotal] = useState("0");
    const [customerList, setCustomerList] = useState([]);
    const [errMessage, setErrMessage] = useState("")
    const [allSelected, setAllSelected] = useState(false);
    const [pageIds, setPageIds] = useState([]);
    const [singleClick, setSingleClick] = useState(false);
    const [deselectArr, setDeselectArr] = useState([])
  const {
    openCallEntryPopup, callEntryServiceTypes, callEntryPaymentTerms, callEntryCustomerList, callEntryUpdateDetail, setCallEntryUpdateDetail, callEntryFormError, setCallEntryFormError, updatedCallEntryData, setUpdateCallEntryData,
    onCallEntryCancelBtnHandler, updateCallEntryPopupOpen, isCallEntryEdit, callEntryIbUsers, callSuccessMessage, setCallSuccessMessage
  } = useContext(CallTimeEntryContext)

  // Remove tooltip on hover by setting title to an empty string
  tableHeaders.forEach(th => {
    th.addEventListener('mouseenter', () => {
      th.setAttribute('title', '');
    });
  });
  // Get billable items data with pagination 
  function getBillableItemsListPagination(perPage, pageNum, searchParams, isLoader = true, loadSelected = true) {
    let search = JSON.stringify(searchParams)
    if (isLoader) {
      setIsLoading(true)
    }
    fetchBillableItemsPagination(perPage, pageNum, search, 0).then((res) => {
      if (res.data?.customers) {
        setCustomerList(Object.values(res.data?.customers ? res.data?.customers : {}))
      } else {
        getCustomersList()
      }
      if (allSelected && loadSelected) {
        let newIds = res.data.billable_items.data?.map((item) => { if (item.billable_item_id && item.is_billed != 1) { return item.billable_item_id } })
        let newKeys = removeDuplicatesAndUndefined(newIds)
        setSelectedRows((prev) => {
          let arr = removeDuplicatesAndUndefined([...prev, ...newKeys])
          return arr.filter(item => !deselectArr.includes(item))
        })
      } else if(!allSelected && !singleClick){
        setSelectedRows([])
      }
      setPageIds(res.data.billable_items.data?.map((item) => item.billable_item_id))
      setIsLoading(false)
      setBillableItems(res.data?.billable_items?.data)
      let pageCount = calculatePageCount(res.data?.billable_items.total, res.data?.billable_items.per_page)
      setPaginationData({
        current_page: res.data?.billable_items.current_page,
        prev_page_url: res.data?.billable_items.prev_page_url,
        next_page_url: res.data?.billable_items.next_page_url,
        per_page: res.data?.billable_items.per_page,
        total: res.data?.billable_items.total,
        pagesCount: pageCount
      })
      if (res.data?.total_cost) {
        setFilteredTotal(res.data?.total_cost)
      } else {
        setFilteredTotal(0)
      }
    }).catch(err => {
      setIsLoading(false)
      setBillableItems([])
    })
  }
  // Get billable items  
  function getBillableItemsList(isLoader = true) {
    if (isLoader) {
      setIsLoading(true)
    }
    fetchBillableItems().then((res) => {
      setIsLoading(false)
      setBillableItems(res.data?.billable_items)
      let totalCost = calculateTotalCost(res.data?.billable_items, "cost")
      setFilteredTotal(totalCost)
      setTotalCost(totalCost)
    }).catch(err => {
      setIsLoading(false)
      setBillableItems([])
    })
  }

  useEffect(() => {
    if (allSelected || singleClick) {
      let searchParams = { ...filters }
      searchParams.billable_items = allSelected && !singleClick ? "all" : selectedRows ? selectedRows : []
      let search = JSON.stringify(searchParams)
      fetchBillableItemsPaginationTotal(paginationPerPage, paginationData.current_page, search, 0).then((res) => {
        setSelectedTotal(res.data?.selected_total_cost)
      }).catch(err => {
        setSelectedTotal("0")
      })
    } else {
      setSelectedTotal("0")
    }
  }, [selectedRows, allSelected, singleClick, filters.customer_id, filters.start_date, filters.end_date])

  useEffect(() => {
    if (globalSearch) {
      let searchParams = {
        customer_id: [], job_id: [], task_id: [], user_id: [],
        billing_type: [], start_date: "", end_date: "", is_billed: [], is_paid: [],
        global_search: globalSearch?.trim()
      }
      setRangePickerValue([])
      setFilters(searchParams)
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('billItems', saveFilter)
      getBillableItemsListPagination(paginationPerPage, paginationInitialPage, searchParams)
    } else {
      let savedFilters = getFilterFromLocal('billItems')
      let searchParams = {
        ...filters,
        customer_id: savedFilters?.customer_id ? savedFilters?.customer_id : [],
        job_id: savedFilters?.job_id ? savedFilters?.job_id : [],
        task_id: savedFilters?.task_id ? savedFilters?.task_id : [],
        user_id: savedFilters?.user_id ? savedFilters?.user_id : [],
        billing_type: savedFilters?.billing_type ? savedFilters?.billing_type : [],
        start_date: savedFilters?.start_date ? savedFilters?.start_date : "",
        end_date: savedFilters?.end_date ? savedFilters?.end_date : "",
        is_billed: savedFilters?.is_billed ? savedFilters?.is_billed : ["0"],
        is_paid: savedFilters?.is_paid ? savedFilters?.is_paid : [],
        global_search: ""
      }
      setSetSelectedCustomers(savedFilters?.customer_id?.length > 0 ? [savedFilters?.customer_id] : [])
      setFilters(searchParams)
      let { global_search, ...saveFilter } = searchParams
      saveFilterToLocal('billItems', saveFilter)
      setRangePickerValue([savedFilters?.start_date ? dayjs(savedFilters?.start_date) : null, savedFilters?.end_date ? dayjs(savedFilters?.end_date) : null])
      props.getCustomerBillItemsList()
      getBillableItemsListPagination(paginationPerPage, paginationInitialPage, searchParams)
    }
  }, [globalSearch, props.togglePage])

  useEffect(() => {
    setAllSelected(false)
    setSingleClick(false)
    setDeselectArr([])
    setSelectedRows([])
    setErrMessage("")
  }, [props.togglePage])

  // Filter
  useEffect(() => {
    let formattedData = billableItems
    setFormattedBillableItems(formattedData)
  }, [filter, billableItems, globalSearch, filters])

  // On pagination change handler
  const handleOnPageChange = (pageNumber) => {
    getBillableItemsListPagination(paginationData.per_page, pageNumber, filters, true)
  }

  // custom filter check handler
  const customFilterHandler = () => {
    setSelectedRows([])
    setDeselectArr([])
    setSetSelectedCustomers(filters.customer_id)
    let fils = { ...filters, global_search: "" }
    if (fils?.customer_id?.length != 1) {
      setSelectedTotal("0")
    }
    resetSearch()
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('billItems', saveFilter)
    if (globalSearch == "") {
      getBillableItemsListPagination(paginationData.per_page, 1, fils, true)
    }
  }

  // custom filter reset handler
  const customFilterResetHandler = (key) => {
    if (key == "customer_id") {
      setSelectedTotal("0")
      setSetSelectedCustomers([])
    }
    setSelectedRows([])
    setDeselectArr([])
    let search = { ...filters, [key]: [] }
    let { global_search, ...saveFilter } = search
    saveFilterToLocal('billItems', saveFilter)
    getBillableItemsListPagination(paginationData.per_page, paginationData.current_page, search, true)
  }

  // On cell handler
  const onCellHandler = () => {
    return { onClick: (event) => { event.stopPropagation() } }
  }

  // On customer handler
  const onCustomerNameClickcHandler = (e, record) => {
    e.stopPropagation()
    updateCustomerPopupOpen(record?.customer_id)
  }

  // On job click handler
  const onJobNameClickHandler = (e, record) => {
    e.stopPropagation()
    updateJobPopupOpen(record?.project_id)
  }

  // On Task click handler
  const onTaskNameClickHandler = (e, record) => {
    e.stopPropagation()
    if (record?.task_name == "Call Time Entry") {
      updateCallEntryPopupOpen({ name: record?.task_name, id: record?.task_id })
    } else {
      updateTaskPopupOpen(record?.task_name, record?.task_id)
    }
  }

  // Column definition 
  useEffect(() => {
    const columnsDef = [
      {
        title: "Customer",
        dataIndex: ["customer_name"],
        key: "clientName",
        width: 180,
        sorter: sortByString(["customer_name"]),
        render: (text, record) => {
          return (
            text ? <div>
              <Tooltip placement="top" title={"Go To Customer"}>
                <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onCustomerNameClickcHandler(e, record)} />
                <span onClick={(e) => onCustomerNameClickcHandler(e, record)} className="ms-1 redirect-cusor">{text}</span>
              </Tooltip>
            </div> : ""
          );
        }
      },
      {
        title: "Job",
        dataIndex: ["project_name"],
        key: "jobName",
        sorter: sortByString(["project_name"]),
        width:150,
        filteredValue: filters.job_id,
        filterDropdown: (props) => { return <JobFilter {...props} subsection={'billitems'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          return (
            text ? <div>
              <Tooltip placement="top" title={"Go To Job"}>
                <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onJobNameClickHandler(e, record)} />
                <span onClick={(e) => onJobNameClickHandler(e, record)} className="ms-1 redirect-cusor">{text}</span>
              </Tooltip>
            </div> : ""
          );
        }
      },
      {
        title: "Task",
        dataIndex: ["task_name"],
        key: "taskName",
        sorter: sortByString(["task_name"]),
        width:150,
        filteredValue: filters.task_id,
        filterDropdown: (props) => { return <TaskFilter {...props} subsection={'billitems'} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        render: (text, record) => {
          return (
            text ? <div>
              <Tooltip placement="top" title={"Go To Task"}>
                <FaSquareArrowUpRight className="redirect-icon text-danger" onClick={(e) => onTaskNameClickHandler(e, record)} />
                <span onClick={(e) => onTaskNameClickHandler(e, record)} className="ms-1 redirect-cusor">{text}</span>
              </Tooltip>
            </div> : ""
          );
        }
      },
      {
        title: "Billing Type",
        dataIndex: "billing_type",
        key: "billingType",
        width:190,
        filteredValue: filters.billing_type,
        filterDropdown: (props) => { return <BillTypeFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        sorter: sortByString(["billing_type"]),
        width:150,
      },
      {
        title: "Responsible Staff",
        dataIndex: ["assigned_user_details"],
        key: "responsibleUser",
        filteredValue: filters.user_id,
        filterDropdown: (props) => { return <UserFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} />  },
        sorter: sortByString(["assigned_user_details"]),
        width:200,
      },
      {
        title: "Item Completion Date",
        dataIndex: "item_completion_date",
        key: "dateOfCompletion",
        sorter: sortByDate(["item_completion_date"]),
        width:200,
        render: (text, record) => { return record.item_completion_date ? parseDateTimeString(record.item_completion_date, 6) : "" }
      },
      {
        title: "Total Cost",
        dataIndex: "cost",
        key: "cost",
        width:120,
        render: (text, record) => {
          return record.cost ? "$" + record.cost : ""
        },
        sorter: sortByString(["cost"]),
      },
      {
        title: "Billed",
        dataIndex: "is_billed",
        key: "billed",
        width:120,
        render: (text, record) => {
          return record.is_billed == 1 ? "Yes" : "No"
        },
        filteredValue: filters.is_billed,
        filterDropdown: (props) => { return <BilledFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        sorter: sortByString(["is_billed"]),
      },
      {
        title: "Paid",
        dataIndex: "is_paid",
        key: "paid",
        width:110,
        render: (text, record) => {
          return record.is_paid == 1 ? "Yes" : "No"
        },
        filteredValue: filters.is_paid,
        filterDropdown: (props) => { return <PaidFilter {...props} filters={filters} setFilters={setFilters} onFilter={customFilterHandler} onReset={customFilterResetHandler} /> },
        sorter: sortByString(["is_paid"]),
      },
    ];
    setColumns(columnsDef)
  }, [formattedBillableItems, filters, selectedRows])

  // Search filter
  useEffect(() => {
    const serchedData = billableItems.filter(item => {
      return (item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.project_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.task_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assigned_user_details?.toLowerCase().includes(searchTerm.toLowerCase()))
    });
    setFormattedBillableItems(serchedData)
  }, [searchTerm])

  // Date range picker onChange handler
  function onRangePickerChangeHandler(value, datestring) {
    setErrMessage("")
    if(datestring?.[0] == "" && datestring?.[1] == ""){
      let fils = { ...filters, start_date: "", end_date: "" }
      let { global_search, ...saveFilter } = fils
      saveFilterToLocal('billItems', saveFilter)
      getBillableItemsListPagination(paginationPerPage, 1, fils)
    }
    setRangePickerValue(value)
    let fils = { ...filters, start_date: datestring[0], end_date: datestring[1] }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('billItems', saveFilter)
    setFilters((prev) => ({ ...prev, start_date: datestring[0], end_date: datestring[1] }))
    setFilter({ ...filter, range: datestring })
  }

  // Date range picker onChange handler
  function datePickerOnBlurHandler(value, datestring) {
    resetSearch()
    let fils = { ...filters }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('billItems', saveFilter)
    getBillableItemsListPagination(paginationPerPage, 1, filters)
  }

  // Table change handler function
  function onTableChange(pagination, filters, sorter, extra) {
    const { currentDataSource } = extra
  }

  // Create customer bill
  function createCustomerBill(data) {
    setGenLoader(true)
    addCustomerBillItems(data).then(() => {
      setSelectedRows([])
      setAllSelected(false)
      setDeselectArr([])
      setSingleClick(false)
      setSeccessMessage("Bill successfully generated!")
      setShowMsg(true)
      getBillableItemsListPagination(paginationPerPage, 1, filters, false, false)
      onGenerateBillCancelHandler()
      setGenLoader(false)
    }).catch((err) => {
      setSeccessMessage("")
      setShowMsg(false)
      setGenLoader(false)
    })
  }

  // Row Selection onchange handler
  const onSelectHandler = (record, selected, selectedRow) => {
    setSingleClick(true)
    if (!selected) {
      setDeselectArr((prev) => ([...prev, record.billable_item_id]))
    } else {
      setDeselectArr((prev) => {
        return prev.filter((opt) => { return opt != record.billable_item_id })
      })
    }
    let checkedOpts = selectedRows ? selectedRows : []
    if (checkedOpts.includes(record.billable_item_id)) {
      checkedOpts = checkedOpts.filter((opt) => { return opt != record.billable_item_id })
    } else {
      checkedOpts.push(record.billable_item_id)
    }
    let checkedItems = removeDuplicatesAndUndefined(checkedOpts)
    setSelectedRows(checkedItems)
    if (selected) {
      const data = {
        customer_id: filters.customer_id?.[0] ? filters.customer_id?.[0] : "",
        billable_items: checkedItems ? checkedItems : [],
      };
      setBillData(data);
    } else {
      setBillData(null);
    }
  };
  // On Genrate button handler
  const onGenerateBillButtonHandler = () => {
    if (selectedRows.length > 0) {
      setFilePop(true);
      setFormError({});
    }
  };

  // Generate bill cancel handler
  const onGenerateBillCancelHandler = () => {
    setFormError({})
    setFormValue({ title: "" })
    setFilePop(false)
  }

  // on save button click handler 
  const saveButtonClickHandler = () => {
    let data = {
      customer_id: filters.customer_id?.[0] ? filters.customer_id?.[0] : "",
      billable_items: allSelected && !singleClick ? "all" : selectedRows ? selectedRows : [],
      title: formValue.title ? formValue.title : "",
      start_date: filters?.start_date ? filters?.start_date : "",
      end_date: filters?.end_date ? filters?.end_date : ""
    }
    validateFormData(generateBillSchema, data).then(() => {
      setSelectedTotal("0")
      createCustomerBill(data)
    }).catch((err) => {
      setFormError(err)
    })
  }

  // on title change handler 
  const onTitleChangeHandler = (e) => {
    let errors = formError
    if (errors.hasOwnProperty("title")) {
      delete errors["title"]
    }
    setFormError(errors)
    setFormValue({ ...formValue, title: e.target.value })
  }

  // Export excel report
  function exportExcelReport() {
    setIsLoader(true)
    let fils = {
      ...filters,
      billableItems: selectedRows
    }
    if (!fils.start_date || !fils.end_date) {
      setErrMessage("Start date and end date are required");
      setIsLoader(false);
      return;
    }

    const startDate = dayjs(fils.start_date);
    const endDate = dayjs(fils.end_date);

    const diffInMonths = endDate.diff(startDate, 'day');

    if (diffInMonths > 91) {
      setErrMessage("Date range must be within 3 months");
      setIsLoader(false);
      return;
    }
    let search = JSON.stringify(fils)
    fetchBillableItemsPaginationExport(paginationPerPage, paginationData.current_page, search, 1).then((res) => {
      if (res.data) {
        const filename = extractFilename(res)
        const blob_1 = new Blob([res.data], { type: res.headers['content-type'] })
        const downloadLink = window.URL.createObjectURL(blob_1)
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

  const onSelectChange = (newSelectedRowKeys, selectedRow) => {  };

  const onAllSelectClick = (selected) => {
    if(!selected){
      setSelectedRows([])
    }
    if (selected) {
      setSelectedRows((prev) => {
        let currentPageIds = formattedBillableItems?.map((item) => { if (item.billable_item_id && item.is_billed != 1) { return item.billable_item_id } })
        let arr = removeDuplicatesAndUndefined([...prev, ...currentPageIds])
        return arr
      });
    }
    setSingleClick(false)
    setDeselectArr([])
    setAllSelected(selected)
  }

  const getRowSelectionProps = () => {
    return {
      type: "checkbox",
      onSelect: onSelectHandler,
      onSelectAll: onAllSelectClick,
      selectedRowKeys: selectedRows,
      getCheckboxProps: (record) => {
        return {
          disabled: record.is_billed == 1
        }
      },
      onChange: onSelectChange,
      renderCell: (checked, record, index, originNode) => {
        if (record.is_billed === 1) {
          return <Tooltip placement="topLeft" title={"The item is already billed"}>
            {originNode}
          </Tooltip>
        } else {
          return originNode
        }
      }
    }
  }

  // Get Customer list
  function getCustomersList() {
    getCust().then((res) => {
      if (res.data?.customers) { setCustomerList(res.data.customers) }
    }).catch(err => { setCustomerList([]) })
  }

  useEffect(() => {
    // getCustomersList()
  }, [])

  // Status filter onChange handler
  function onCustomerFilterChangeHandler(e) {
    setSelectedRows([])
    setAllSelected(false)
    setDeselectArr([])
    setSingleClick(false)
    let fils = { ...filters, customer_id: e.target.value ? [e.target.value] : [] }
    if (fils?.customer_id?.length != 1) {
      setSelectedTotal("0")
    }
    let { global_search, ...saveFilter } = fils
    saveFilterToLocal('billItems', saveFilter)
    setSetSelectedCustomers(e.target.value ? [e.target.value] : [])
    resetSearch()
    getBillableItemsListPagination(paginationData.per_page, 1, fils, true)
    setFilters((prev) => ({ ...prev, customer_id: e.target.value ? [e.target.value] : [] }))
  }

  return (<>
    <div className="py-0 px-0 BillItems main-container">
      <div className="d-flex  flex-wrap p-2 align-items-center billSubHead">
        <SqButton
          onClick={onGenerateBillButtonHandler}
          className={`py-2 me-3 ${!(selectedRows.length > 0) ? 'disabled' : ''}`}
          disabled={!(selectedRows.length > 0)}
          style={{ backgroundColor: !(selectedRows.length > 0) ? '#f0f0f0' : '' }}
        >
          <FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Generate Bill
        </SqButton>
        <SqButton onClick={onGenerateExcelButtonHandler} className="py-2"><FaIcons.FaPlus style={{ marginTop: "-3px" }} /> Excel Report {isLoader && <Spin indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</SqButton>
        <div className="ms-3 selectBox-wrap">
          <Form.Select
            aria-label="Default select example"
            value={filters.customer_id?.[0] ? filters.customer_id?.[0] : ""}
            onChange={onCustomerFilterChangeHandler}
          >
            <option key={0} value={""}>All Customers</option>
            {sortObjectsByAttribute(customerList).map((item) => {
              return <option value={item.id} key={item.id}>{item.name}</option>
            })}
          </Form.Select>
        </div>
        <div className="calcValue px-3">
          <h6 className="m-0 py-2 pe-3">
            <b>Filtered Total: </b>
            <span className="totalColor">{fiteredTotal ? `$${fiteredTotal}` : "$0"}</span>
          </h6>
          <h6 className="m-0 py-2">
            <b>Selected Total: </b>
            <span className="totalColor">{selectedTotal ? `$${selectedTotal}` : "$0"}</span>
          </h6>
        </div>
        <div className="d-flex billdatepicker error-msg">
          <RangePicker format={'MM/DD/YYYY'} value={rangePickerValue} onCalendarChange={onRangePickerChangeHandler} onBlur={datePickerOnBlurHandler} />
          {showBtn ? <> <button className="BillClearBtn ms-3">
            <HiIcons.HiSearch />
          </button>
            <button className="BillClearBtn ms-3">
              <AiIcons.AiOutlineClear />
            </button></> : ""}
            {errMessage ? <span className='text-danger'>{errMessage}</span> : null}
        </div>

      </div>
      <div className="w-100">
        <Table
          columns={columns}
          sticky={{
            offsetHeader: 0,
          }}
          dataSource={formattedBillableItems}
          rowKey="billable_item_id"
          tableLayout="fixed"
          loading={{
            indicator:
              <LoadingOutlined style={{ fontSize: 50, color: '#2c0036', }} spin />,
              spinning: isLoading
          }}
          pagination={{
            position: ['bottomRight'],
            pageSize: paginationData.per_page,
            current: paginationData.current_page,
            showSizeChanger: paginationSizeChanger,
            total: paginationData.total,
            onChange: handleOnPageChange 
          }}
          footer={() => {
            return paginationData.total ? <div className="text-end d-flex justify-content-between align-items-center">
              <p className="mb-0">{calculatePageRange(paginationData.current_page, paginationData.per_page, paginationData.total)}</p>
            </div> : null
          }}
          onChange={onTableChange}
          rowSelection={selectedCustomers?.length == 1 ? getRowSelectionProps() : false}
        />
      </div>
    </div>
    <div className={`${filePop ? "centerpopups bill-modal" : "nocenterpopups"}`}>
      <div className='centerpopups'>
        <div className='popups d-flex justify-content-center align-items-center w-100'>
          <div className='addpopups customer-doc-popup'>
            <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
              <div>Generate Bill</div>
              <div className='myIcon' type='button' onClick={onGenerateBillCancelHandler}>
                <IoIosCloseCircle style={{ width: '28px' }} />
              </div>
            </div>
            <div className='popBody p-3 customer-body'>
              <div className="edit-field">
                <div className='input-wrap'>
                  <FloatingLabel label="Title">
                    <Form.Control
                      type="text"
                      placeholder="Title"
                      name='title'
                      value={formValue.title}
                      onChange={onTitleChangeHandler}
                    />
                  </FloatingLabel>
                  {formError?.title ? <span className='ms-2 text-danger'>{formError?.title}</span> : null}
                </div>
              </div>
            </div>
            <div className='mt-auto popfoot w-100 p-2'>
              <div className='d-flex align-items-center justify-content-center'>
                <Button className="mx-4 cclBtn" onClick={onGenerateBillCancelHandler}>Cancel</Button>
                <Button disabled={genLoader} type="button" onClick={saveButtonClickHandler}>Save {genLoader && <Spin indicator={<LoadingOutlined style={{ fontSize: 24, fill: '#fff' }} spin />} />}</Button>
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
        getCustomersList={getBillableItemsListPagination}
        selectedCustomer={selectedCustomer}
        onClick={updateCustomerCancelClickHandler}
        ibUsers={customerIbUsers}
        formError={customerFormError}
        setFormError={setCustomerFormError}
        paginationData={paginationData}
        getCustomersListPagination={getBillableItemsListPagination}
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
        isFromCustomer={false}
        filters={filters}
      />
      <div className="blurBg"></div>
    </div>}

    {jobOpenPopup && <div className={`mainpopups`}>
      <UpdateForm
        jobCodes={jobSectionCodes}
        paymentTerms={JobPaymentTerms}
        customerList={JobCustomerList}
        getJobList={getBillableItemsListPagination}
        selectedJob={selectedJobForSection}
        onClick={updateJobCancelClickHandler}
        responsibleUser={JobResponsibleUser}
        formError={JobFormError}
        setFormError={setJobFormError}
        getJobListPagination={getBillableItemsListPagination}
        paginationData={paginationData}
        setSelectedJob={setSelectedJobForSection}
        filters={filters}
        setFilters={setFilters}
        successMessage={jobSuccessMessage}
        setSuccessMessage={setJobSuccessMessage}
      />
      <div className="blurBg"></div>
    </div>}
    {openTaskPopup &&<div className={`mainpopups`}>
        <TaskUpdate
          serviceTypes={TaskServiceTypes}
          paymentTerms={TaskPaymentTerms}
          customerList={taskCustomerList}
          getTaskList={getBillableItemsListPagination}
          taskUpdateDetail={taskSectionUpdateDetail}
          onClick={onTaskCancelBtnHandler}
          formError={taskFormError}
          setFormError={setTaskFormError}
          paginationData={paginationData}
          getTaskListPagination={getBillableItemsListPagination}
          updatedtaskData={taskUpdatedtaskData}
          setUpdatetaskdData={setTaskUpdatetaskdData}
          settaskUpdateDetail={settaskSectionUpdateDetail}
          isCallEntry={taskIsCallEntry}
          filters={filters}
          successMessage={taskSuccessMessage}
          setSuccessMessage={setTaskSuccessMessage}
        />
        <div className="blurBg"></div>
      </div>}
    {openCallEntryPopup && <div className={`mainpopups`}>
      <CallEntryPopup
        serviceTypes={callEntryServiceTypes}
        paymentTerms={callEntryPaymentTerms}
        customerList={callEntryCustomerList}
        getTaskList={getBillableItemsListPagination}
        taskUpdateDetail={callEntryUpdateDetail}
        onClick={onCallEntryCancelBtnHandler}
        formError={callEntryFormError}
        setFormError={setCallEntryFormError}
        paginationData={paginationData}
        getTaskListPagination={getBillableItemsListPagination}
        updatedtaskData={updatedCallEntryData}
        setUpdatetaskdData={setUpdateCallEntryData}
        settaskUpdateDetail={setCallEntryUpdateDetail}
        isCallEntry={isCallEntryEdit}
        filters={filters}
        ibUsers={callEntryIbUsers}
        successMessage={callSuccessMessage}
        setSuccessMessage={setCallSuccessMessage}
      />
      <div className="blurBg"></div>
    </div>}
  </>
  );
};

export default BillItems;
