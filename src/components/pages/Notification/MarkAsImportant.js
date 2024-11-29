/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import { FaInfoCircle } from "react-icons/fa";
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

import CenterTooltip from "../../commonModules/UI/CenterTooltip";
import TableBtn from "../../commonModules/UI/TableBtn";
import { updateUserNotifications } from '../../../API/authCurd';

const MarkAsImportant = ({ record, getUserNOtificationsList, getUserNOtificationsListPagination, paginationData, filters }) => {
    const [markImpLoader, setMarkImpLoader] = useState(false)

    // Update mark as fields
    function updateNotificationData(id, data) {
        setMarkImpLoader(true)
        return updateUserNotifications(id, data).then((res) => {
            return res.data
        }).catch((err) => {
            setMarkImpLoader(false)
            console.log("updateNotificationData: ", err)
        })
    }

    // Mark as Important click handler function
    const markAsImportantClickHandler = (record) => {
        let data = {
            is_important: record.is_important ? 0 : 1
        }
        updateNotificationData(record.users_notification_id, data).then(() => {
            getUserNOtificationsListPagination(paginationData.per_page, paginationData.current_page, filters, false).then(() => {
                setMarkImpLoader(false)
            }).catch((err) => {
                setMarkImpLoader(false)
            })
        })
    }

    return (
        <div>
            {markImpLoader ? <Spin className="text-white me-2" indicator={<LoadingOutlined style={{ fontSize: 18, color: '#2c0036' }} spin />} /> :
                <CenterTooltip title={record.is_important == 1 ? "Mark as unimportant" : "Mark as important"}>
                    <TableBtn className={`website me-2 ${record.is_important == 1 ? 'active-btn' : ""}`} onclick={() => markAsImportantClickHandler(record)}><FaInfoCircle /></TableBtn>
                </CenterTooltip>}
        </div>
    )
}

export default MarkAsImportant