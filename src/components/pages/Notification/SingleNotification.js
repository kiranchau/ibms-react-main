/* eslint-disable eqeqeq */
import React from 'react';
import { useNavigate } from "react-router-dom"

import { updateNotificationReadFlag } from '../../../API/authCurd';

const SingleNotification = (props) => {
    const navigate = useNavigate()

    // update notification read flag
    function updateNotificationReadFlagData(id, data) {
        return updateNotificationReadFlag(id, data).then((res) => {
            return Promise.resolve(res.data)
        }).catch((err) => { return Promise.reject(err) })
    }

    // navigate function
    const navitagePage = (navurl) => {
        const url = navurl ? navurl.split("/") : []
        if (url[2] == "tasks") {
            navigate("/tasks")
        }
    }

    // Notification onClick handler function
    const onNotificationClickHandler = (data) => {
        if (data.postIsRead == 0) {
            const payload = { is_read: 1 }
            updateNotificationReadFlagData(data.notificationId, payload).then((res) => {
                navitagePage(data.postUrl)
            }).catch((err) => { console.log("updateNotificationReadFlagData-err", err) })

        } else {
            navitagePage(data.postUrl)
        }
    }

    return (
        <div key={props.key} className='d-flex justify-content-center mt-3' style={{ cursor: "pointer" }} onClick={() => onNotificationClickHandler(props)}>
            <div className='singleNotify'>
                <div className='d-flex'>
                    <div>
                        <div className='user-profile'>
                            {props.userimage ? <img src={props.userimage} width='100%' height='100%' alt='user' /> : <span className="initial-text">{props.userInitials}</span>}
                        </div>
                    </div>
                    <div>
                        <div>
                            <strong>{props.postName}</strong>
                            {/* <span className='subContent'> {props.postAction}</span> */}
                        </div>

                        {props.postTitle && <p className='mb-0 fw-bold'>{props.postTitle}</p>}
                        {props.postDescription && <p className='mb-0' dangerouslySetInnerHTML={{ __html: props.postDescription }}></p>}
                        {props.postActiontime && <div className='actionTime'>{props.postActiontime}</div>}
                    </div>
                </div>
                <div>
                    {props.postimage && <div className='postImg'>
                        <img src={props.postimage} width='100%' height='100%' alt='user' />
                    </div>}
                </div>
            </div>
            {props.children}
        </div>
    );
}

export default SingleNotification;
