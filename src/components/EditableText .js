/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';

import { patchAssignedUserData } from '../API/authCurd';

const Dropdown = ({ options, onSelect, record }) => {
  const [optionValue, setOptionValue] = useState(false);
  const userType = localStorage.getItem('usertype')

  // handler option change
  const handleOptionClick = (e) => {
    setOptionValue(e.target.value)
    if (e.target.value != record.status) {
      onSelect(e.target.value);
    }
  };

  useEffect(() => {
    setOptionValue(`${record.status}`)
  }, [record])

  return (
    <div className="status-dropdown" >
      <Form.Select
        aria-label="Default select example"
        className=''
        style={{ cursor: (userType == 1 || userType == 2) ? "pointer" : "not-allowed" }}
        disabled={(userType == 1 || userType == 2) ? false : true}
        value={optionValue}
        onChange={(e) => handleOptionClick(e)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.id}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

const EditableText = (props) => {
  const options = [
    { value: '1', label: 'To do', id: "1" },
    { value: '2', label: 'In Progress', id: "2" },
    { value: '4', label: 'Review', id: "4" },
    { value: '3', label: 'Done', id: "3" },
  ];

  // Select handler
  const handleSelect = async (status) => {
    const payload = {
      task_id: props.record.id,
      status: status
    };
    patchAssignedUserData(props.record.id, payload).then(()=>{
      props.getTaskListPagination(props.paginationData.per_page, props.paginationData.current_page, props.filters, false)
    }).catch((err)=>{
      console.log("TaskStatusChange-err: ", err)
    })
  };

  return (
    <div>
      <Dropdown options={options} onSelect={handleSelect} record={props.record} />
    </div>
  );
};

export default EditableText;
