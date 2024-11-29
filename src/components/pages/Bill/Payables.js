/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import SqButton from "../../commonModules/UI/SqButton";
import * as AiIcons from 'react-icons/ai'
import * as HiIcons from 'react-icons/hi'
import * as FaIcons from 'react-icons/fa'
import { DatePicker, Table } from 'antd';
const Payables = () => {
  const { RangePicker } = DatePicker;

  const [columns, setColumns] = useState([])
  const [data, setData] = useState([])
  const [showBtn, setShowBtn] = useState(false)

  const BtnOn = () =>{
    setShowBtn(true);
  }


  useEffect(() => {
    const columnsDef = [
      {
        title: "Client",
        dataIndex: ["customer_details", "name"],
        key: "clientName",
        ellipsis: true,
      },
      {
        title: "Job",
        dataIndex: "name",
        key: "taskName",
        ellipsis: true,
      },
      {
        title: "Task",
        dataIndex: ["project_details", "name"],
        key: "job",
        ellipsis: true,
      },
      {
        title: "Bill Type",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",

        ellipsis: true,
      },
      {
        title: "Responsible Staff",
        dataIndex: "",
        key: "dateCompleted",
        ellipsis: true,
      },
      {
        title: "Item Completion Date",
        dataIndex: "",
        key: "completedBy",
        ellipsis: true,
      },
      {
        title: "Vendor Name",
        dataIndex: "",
        key: "status",
        ellipsis: true,
      },
      {
        title: "Vendor Amount",
        dataIndex: "",
        key: "status",
        ellipsis: true,
      },
      
    ];
    setColumns(columnsDef)
  }, [])

  return (
    <div className="py-0 px-1 Payables">
      <div className="d-flex  p-2 align-items-center billSubHead">
      <SqButton className="py-2"><FaIcons.FaPlus  style={{marginTop: "-3px"}} /> Make Payment</SqButton>
        <input type="text" className="form-control w-25 mx-3" placeholder="Search" />
        
        <div className="d-flex px-3">
        <h6 className="m-0">
          <b>Filter Total</b>
          <span className="totalColor"> $46,975.52</span>
        </h6>
        <h6 className="m-0 ps-3">
          <b>selected Total</b>
          <span className="totalColor"> $46,975.52</span>
        </h6>
        </div>
        <div className="d-flex align-items-center">
        <RangePicker onChange={()=> BtnOn()} />
        {showBtn ?  <> <button className="BillClearBtn ms-3">
          <HiIcons.HiSearch />
          </button>
        <button className="BillClearBtn ms-3">
          <AiIcons.AiOutlineClear />
          </button></> : "" }
        </div>
      
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
      />

    </div>
  );
};

export default Payables
