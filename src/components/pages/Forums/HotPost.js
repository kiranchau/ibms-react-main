/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from 'react'
import Carousel from 'react-bootstrap/Carousel';
import { getIconPath, getNameInitials, truncateText } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';

const HotPost = ({ hpost, onClick }) => {
    const [hotDocuments, setHotDocuments] = useState([])
    const [hotImageVideos, setHotImageVideos] = useState([])

    // Separating Documents
    useEffect(() => {
        let imgVids = []
        let docs = []
        hpost?.post_images.forEach((item) => {
            const fileExtension = item.image_url.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'mkv'].includes(fileExtension)) {
                imgVids.push(item)
            } else {
                docs.push(item)
            }
        })
        setHotImageVideos(imgVids)
        setHotDocuments(docs)
    }, [hpost])

    return (
        <div className="hot-post-wrap">
            <div className="post-header" onClick={() => onClick(hpost)}>
                <div>
                    <div className="user-profile">
                        <span className="initial-text">{getNameInitials(hpost?.user?.first_name, hpost?.user?.last_name)}</span>
                    </div>
                </div>
                <div className="image-content">
                    <div class="user-info">
                        <h3 class="user-name">{hpost?.user?.first_name ? hpost?.user?.first_name : ""} {hpost?.user?.last_name ? hpost?.user?.last_name : ""}</h3>
                        <p class="post-time mb-1">Posted on {parseDateTimeString(hpost.created_at, 11)}</p>
                    </div>
                </div>
            </div>
            <div className="text-image">
                {hpost?.post_title && <p className='mb-0 title'>{hpost?.post_title}</p>}
                <p className='mb-0 post-description'>{truncateText(hpost.description, 100)}</p>
                {hotImageVideos.length > 0 && <>
                    <Carousel>
                        {hotImageVideos.map((item, index) => {
                            const fileExtension = item.image_url.split('.').pop().toLowerCase();
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                                return <Carousel.Item>
                                    <img key={index} className="post-pic" src={item.image_url} alt="Post Picture" />
                                </Carousel.Item>
                            } else if (['mp4', 'avi', 'mov', 'mkv'].includes(fileExtension)) {
                                return (
                                    <Carousel.Item>
                                        <video key={index} className="post-video" controls width="300">
                                            <source src={item.image_url} type={`video/${fileExtension}`} />
                                            Your browser does not support the video tag.
                                        </video>
                                    </Carousel.Item>
                                );
                            }
                        })}
                    </Carousel>
                </>}
                {hotDocuments.length > 0 && <>
                    <div className='file-doc-wrap'>
                        {hotDocuments.map((item, index) => {
                            let parts = item.image_url.split("/")
                            let result = parts[parts.length - 1];
                            return <div className='file-doc' title={result}>
                                <img src={`/static/icons/${getIconPath(item.image_url)}`}/>
                            <a key={index} href={item.image_url} target="_blank" rel="noopener noreferrer">{result}</a>
                            </div>
                        })}
                    </div>
                </>}
            </div>
        </div>
    )
}

export default HotPost