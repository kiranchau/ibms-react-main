import React, { useEffect, useState } from 'react'
import { truncateText } from '../../../Utils/helpers'

const Instructions = ({ record }) => {
    const [showFullText, setShowFullText] = useState(true)

    useEffect(() => {
        if (record?.instruction?.length > 100) {
            setShowFullText(false)
        } else {
            setShowFullText(true)
        }
    }, [record])

    const seeMoreButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(true)
    }

    const seeLessButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(false)
    }
    return <>{
        showFullText ? <div>
            {record?.instruction}
        </div> : <div>
            {truncateText(record?.instruction, 100)}
        </div>
    }
        {record?.instruction?.length > 100 && (
            showFullText ? <div className='see-more-btn' onClick={(e) => { seeLessButtonHandler(e, record) }}>See Less</div> : <div className='see-more-btn' onClick={(e) => { seeMoreButtonHandler(e, record) }}>See More</div>)
        }</>
}

export default Instructions
