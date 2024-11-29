/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import * as AiIcons from "react-icons/ai"
import * as HiIcons from "react-icons/hi"
import { DatePicker, Table } from 'antd';
const Payments = () => {
  const { RangePicker } = DatePicker;

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [showBtn, setShowBtn] = useState(false);

  const BtnOn = () =>{
    setShowBtn(true);
  }


  useEffect(() => {
    const columnsDef = [
      {
        title: "Payment No",
        dataIndex: ["customer_details", "name"],
        key: "clientName",
        ellipsis: true,
      },
      {
        title: "Vendor Name",
        dataIndex: "name",
        key: "taskName",
        ellipsis: true,
      },
      {
        title: "Payment Date",
        dataIndex: ["project_details", "name"],
        key: "job",
        ellipsis: true,
      },
      {
        title: "Amount Paid",
        dataIndex: "desired_due_date",
        key: "desiredDueDate",

        ellipsis: true,
      },
      {
        title: "Reference Number",
        dataIndex: "",
        key: "dateCompleted",
        ellipsis: true,
      },
      {
        title: "Created",
        dataIndex: "",
        key: "completedBy",
        ellipsis: true,
      },
      {
        title: "Updated",
        dataIndex: "",
        key: "status",
        ellipsis: true,
      },
      
    ];
    setColumns(columnsDef)
  }, [])

  return (
    <div style={{ padding: "0px 1px" }}>
      <div className="d-flex  p-2 align-items-center billSubHead">
      
        <input type="text" className="form-control w-25 mx-3" placeholder="Search" />
        
        <div className="d-flex px-5">
   
        </div>
        <div className="d-flex  align-items-center">
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

export default Payments
