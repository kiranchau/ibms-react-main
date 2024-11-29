/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import { Checkbox } from 'antd';

import { markAssignUserCompleted } from '../../../API/authCurd';

const AssignUserCompletedCheckbox = ({ record, getTaskForAssignedUsers, disabled }) => {
    const [checked, setChecked] = useState(false)

    // Mark as completed change handler
    const handleComplete = async (flagValue) => {
        const payload = {
            mark_as_completed: flagValue
        }
        markAssignUserCompleted(payload, record.task_assigned_user_id).then(() => {
            if (record?.task_id) {
                getTaskForAssignedUsers(record?.task_id)
            }
        }).catch((err) => {
            console.error('postAssignedUserData-Error:', err);
        })
    };

    useEffect(() => {
        setChecked(record?.mark_as_completed == 1 ? true : false)
    }, [record])


    function onChangeHandler(e) {
        handleComplete(e.target.checked == true ? 1 : 0)
        setChecked(!checked)
    }

    return (
        <Checkbox
            onChange={(e) => onChangeHandler(e)}
            checked={checked}
            disabled={disabled}
        ></Checkbox>
    )
}

export default AssignUserCompletedCheckbox