/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';

import { patchAssignedUserData } from '../../../API/authCurd';
import { taskStatus } from '../../../Utils/staticdata';


const Dropdown = ({ options, onSelect, record }) => {
  const [optionValue, setOptionValue] = useState(false);
  const userType = localStorage.getItem('usertype')

  // handler option change
  const handleOptionClick = (e) => {
    setOptionValue(e.target.value)
    if (e.target.value != record.task_status) {
      onSelect(e.target.value);
    }
  };

  useEffect(() => {
    setOptionValue(`${record.task_status}`)
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

const TaskStatusDropDown = ({ record, paginationData, paginationMethod, filters, }) => {
  const handleSelect = async (status) => {
    const payload = {
      task_id: record.task_id,
      status: status
    };
    patchAssignedUserData(record.task_id, payload).then(() => {
      paginationMethod(paginationData.per_page, paginationData.current_page, filters, false)
    }).catch((err) => {
      console.log("TaskStatusChange-err: ", err)
    })
  };

  return (
    <div>
      <Dropdown options={taskStatus} onSelect={handleSelect} record={record} />
    </div>
  );
};

export default TaskStatusDropDown;
