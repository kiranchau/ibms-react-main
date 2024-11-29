/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from 'react'
import IMAGE from "../../../images/Login/Login.png"
import { getIconPath } from '../../../Utils/helpers'

const ForumsDocs = ({ card }) => {
    const [documents, setDocuments] = useState([])
    const [imageVideos, setImageVideos] = useState([])

    // Separating Documents
    useEffect(() => {
        let imgVids = []
        let docs = []
        card?.post_images?.forEach((item) => {
            const fileExtension = item.image_url.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mkv'].includes(fileExtension)) {
                imgVids.push(item)
            } else {
                docs.push(item)
            }
        })
        setImageVideos(imgVids)
        setDocuments(docs)
    }, [card])
    return (<>
        {(imageVideos?.length > 0) && <div className='post-image'>
            <img className="post-upload-image" src={imageVideos[0].image_url} alt="upload image" />
            {(imageVideos?.length > 1) && <span>See more...</span>}
        </div>}
        {(documents?.length > 0) && <div className='file-doc'>
            <img src={`/static/icons/${getIconPath(documents[0]?.image_url)}`} />
            <a href={documents[0]?.image_url} target="_blank" rel="noopener noreferrer">{documents[0]?.document_name}</a>
            {(documents?.length > 1) && <span>See more...</span>}
        </div>}
    </>
    )
}

export default ForumsDocs