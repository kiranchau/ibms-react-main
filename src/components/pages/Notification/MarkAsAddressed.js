/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import { FaCheckCircle } from "react-icons/fa";
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import { updateUserNotifications } from '../../../API/authCurd';

const MarkAsAddressed = ({ record, getUserNOtificationsList, getUserNOtificationsListPagination, paginationData, filters }) => {
    const [markReadLoader, setMarkReadLoader] = useState(false)

    // Update mark as fields
    function updateNotificationData(id, data) {
        setMarkReadLoader(true)
        return updateUserNotifications(id, data).then((res) => {
            return res.data
        }).catch((err) => {
            setMarkReadLoader(false)
            console.log("updateNotificationData: ", err)
        })
    }

    // Mark as Read click handler function
    const markAsReadClickHandler = (record) => {
        let data = {
            is_addressed: record.is_addressed ? 0 : 1
        }
        updateNotificationData(record.users_notification_id, data).then(() => {
            getUserNOtificationsListPagination(paginationData.per_page, paginationData.current_page, filters, false).then(() => {
                setMarkReadLoader(false)
            }).catch((err) => {
                setMarkReadLoader(false)
            })
        })
    }

    return (
        <div>
            {markReadLoader ? <Spin className="text-white me-2" indicator={<LoadingOutlined style={{ fontSize: 18, color: '#2c0036' }} spin />} /> :
                <CenterTooltip title={record.is_addressed == 1 ? "Mark as unaddressed" : "Mark as addressed"}>
                    <TableBtn className={`website me-2 ${record.is_addressed == 1 ? 'active-btn' : ""}`} onclick={() => markAsReadClickHandler(record)}><FaCheckCircle /></TableBtn>
                </CenterTooltip>}
        </div>
    )
}

export default MarkAsAddressed