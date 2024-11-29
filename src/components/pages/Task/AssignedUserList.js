import React, { useEffect, useState } from 'react'

const AssignedUserList = ({ record }) => {
    const [assignedUsers, setAssignedUsers] = useState([])
    const [showFullText, setShowFullText] = useState(true)

    useEffect(() => {
        const assignedUser = record?.assigned_user_details ? record?.assigned_user_details?.split(",") : [];
        if (assignedUser.length > 4) {
            setShowFullText(false)
        } else {
            setShowFullText(true)
        }
        setAssignedUsers(assignedUser)
    }, [record])

    const seeMoreButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(true)
    }

    const seeLessButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(false)
    }

    return (
        <div>
            {Array.isArray(assignedUsers) && assignedUsers.length > 0 ? (
                <>
                    {showFullText ? <>{
                        assignedUsers.map((user, index) => (
                            <div key={index}>{user}</div>
                        ))
                    }</> : <>{assignedUsers.slice(0, 4).map((user, index) => (
                        <div key={index}>{user}</div>
                    ))}</>
                    }
                    {assignedUsers?.length > 4 && (
                        showFullText ? <div className='see-more-btn' onClick={(e) => { seeLessButtonHandler(e, record) }}>See Less</div> : <div className='see-more-btn' onClick={(e) => { seeMoreButtonHandler(e, record) }}>See More</div>)
                    }
                </>
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default AssignedUserList