/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg';
import Like from "../../../images/bloom.svg"
import { MdModeComment } from "react-icons/md";
import { BsSendFill } from "react-icons/bs";
import profileImage from "../../../images/Login/pexels-anthony-derosa-216216.jpg";
import { convertToLink, getIconPath, getNameInitials, separateAndTransformIdsWithZero, truncateText } from '../../../Utils/helpers'
import { parseDateTimeString } from '../../../Utils/dateFormat'
import { addComment, addReaction, deletePostAttachment, fetchComments, updateForumPost, updateForumPostPin, updateReaction } from "../../../API/authCurd";
import { IoMdMore } from "react-icons/io";
import Dropdown from 'react-bootstrap/Dropdown';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import ForumComment from './ForumComment';
import Carousel from 'react-bootstrap/Carousel';
import { MdCancel } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPin, LuPinOff } from "react-icons/lu";
import { Tooltip } from 'antd';
import { MentionsInput, Mention } from 'react-mentions';
import { FaRegImage } from "react-icons/fa6";
import ForumRichTextEditor from "../../commonModules/UI/ForumRichTextEditor";
const regex = /<p>\s+<\/p>/

const ForumPost = ({ post, deleteForumPostData, paginationData, getForumPostsForLazyLoading, getHotPosts, filters, ibUsers, taggingList }) => {
    const [comments, setComments] = useState([])
    const [isHidden, setIsHidden] = useState(true);
    const [commentDesc, setCommentDesc] = useState("")
    const [commentDescEditor, setCommentDescEditor] = useState({
        value: "",
        mentions: []
    })
    const [forumPostData, setForumPostData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false)
    // const [editModeValue, setEditModeValue] = useState({ post_title: "", description: "", category_id: "", editorValue: "", mentions: [] })
    const [editModeValue, setEditModeValue] = useState({ post_title: "", description: "", category_id: "", mentions: [] })
    const [documents, setDocuments] = useState([])
    const [imageVideos, setImageVideos] = useState([])
    const [commentCount, setCommentCount] = useState(0)
    const descRef = useRef(null)
    const userId = localStorage.getItem("id")
    const [showFullText, setShowFullText] = useState(true)
    const [commentError, setCommentError] = useState("")
    const [rteInitialValue, setRteInitialValue] = useState("")
    const [cleartext, setClearText] = useState("")

    useEffect(() => {
        if (forumPostData?.description?.length > 1200) {
            setShowFullText(false)
        } else {
            setShowFullText(true)
        }
    }, [forumPostData])

    const toggleVisibility = (id) => {
        setCommentError("")
        if (isHidden) {
            getComments(id)
        } else {
            setComments([])
        }
        setIsHidden(!isHidden);
    };

    // get comments by id
    function getComments(id) {
        fetchComments(id).then((res) => {
            setComments(res.data.comments)
            setCommentCount(res.data?.comments ? res.data?.comments?.length : 0)
        }).catch(() => setComments([]))
    }

    // update forum post method
    function updateForumPostData(id, data) {
        return updateForumPost(id, data).then((res) => {
            getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
        }).catch((err) => { console.log("addNewComment-err: ", err.message) })
    }

    // add new commetn method
    function addNewComment(id, data) {
        addComment(data).then(() => {
            getComments(id)
            setCommentDesc("")
            setClearText("clear")
            setCommentDescEditor({
                value: "",
                mentions: []
            })
        }).catch((err) => { console.log("addNewComment-err: ", err.message) })
    }

    // add like method
    function addLike(data, isComment, postId) {
        addReaction(data).then(() => {
            getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
            if (isComment) {
                getComments(postId)
            }
        }).catch((err) => { console.log("addLike-err: ", err.message) })
    }

    // update like method
    function updateLike(id, data, postId, isPost) {
        return updateReaction(id, data).then(() => {
            if (isPost) {
                getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
            } else {
                getComments(postId)
            }
        }).catch((err) => { console.log("updateLike-err: ", err.message) })
    }

    // Comment onchange handler
    const commentOnChangehandler = (e) => {
        setCommentDesc(e.target.value)
    }

    const commentMentionsOnChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCommentError("")
        setCommentDesc(newPlainTextValue)
        let ids = mentions ? mentions.map(m => m.id) : []
        setCommentDescEditor({
            value: "",
            mentions: ids
        })
    }

    // Send comment button handler
    const sendCommentButtonHandler = (id) => {
        if (commentDesc == "" || commentDesc == "<p><br></p>" || regex.test(commentDesc)) {
            setCommentError("Comment is required.")
        } else {
            const { userIds, deptIds } = separateAndTransformIdsWithZero(commentDescEditor.mentions)
            const payload = {
                post_id: id,
                description: commentDesc,
                mentions: userIds ? userIds : [],
                group_mentions: deptIds ? deptIds : []
            }
            addNewComment(id, payload)
        }
    }

    // Post bloom add like / update like
    const postBloomButtnHandler = (postData) => {
        if (!postData.post_reactions) {
            let data = {
                post_id: postData.post_id,
                upvote: 1
            }
            addLike(data)
        } else {
            let data = {
                post_id: postData.post_id,
                upvote: postData.post_reactions.upvote == 1 ? 0 : 1
            }
            updateLike(postData.post_reactions.reaction_id, data, null, true)
        }
    }

    // Comment bloom add like / update like
    const commentBloomButtnHandler = (commentData, postData) => {
        if (!commentData.reactions) {
            let data = {
                post_id: postData.post_id,
                comment_id: commentData.comment_id,
                upvote: 1
            }
            addLike(data, true, postData.post_id)
        } else {
            let data = {
                post_id: postData.post_id,
                comment_id: commentData.comment_id,
                upvote: commentData.reactions.upvote == 1 ? 0 : 1
            }
            updateLike(commentData.reactions.reaction_id, data, postData.post_id, false)
        }
    }

    // Delete forum post handler
    const deleteForumPostHandler = (e, data) => {
        e.preventDefault()
        let isConfirm = confirmDelete("post")
        if (isConfirm) {
            deleteForumPostData(data.post_id)
        }
    }

    // Edit forum post handler
    const editForumPostHandler = (e, data) => {
        e.preventDefault()
        setIsEditMode(true)
        setRteInitialValue(data.description ? data.description : "")
        setEditModeValue({ ...editModeValue, category_id: data.category_id, post_title: data.post_title, mentions: data.mentions ? data.mentions : [] })
        // setEditModeValue({ ...editModeValue, description: data.description, category_id: data.category_id, post_title: data.post_title, editorValue: data.description, mentions: data.mentions ? data.mentions : [] })
    }

    // Edit input onchange handler
    const editInputOnChangeHandler = (e) => {
        let descElem = descRef?.current
        if (descElem) {
            descElem.style = "auto"
            descElem.style.height = (descElem.scrollHeight) + "px";
        }
        setEditModeValue({ ...editModeValue, [e.target.name]: e.target.value })
    }

    const mentionsOnChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
        let ids = mentions ? mentions.map(m => m.id) : []
        setEditModeValue({ ...editModeValue, description: newPlainTextValue, editorValue: newValue, mentions: ids })
    }

    // Edit forum post save button handler
    const editForumPostSaveHandler = (data) => {
        const { userIds, deptIds } = separateAndTransformIdsWithZero(editModeValue.mentions)
        let dataToUpdate = {
            ...editModeValue,
            mentions: userIds,
            group_mentions: deptIds
        }
        updateForumPostData(data.post_id, dataToUpdate).then(() => {
            setRteInitialValue("")
            setIsEditMode(false)
            // setEditModeValue({ ...editModeValue, description: "", post_title: "", editorValue: "", mentions: [] })
            setEditModeValue({ ...editModeValue, description: "", post_title: "", mentions: [] })
        })
    }

    useEffect(() => {
        setForumPostData(post)
    }, [post])

    // Separating Documents
    useEffect(() => {
        let imgVids = []
        let docs = []
        forumPostData?.post_images.forEach((item) => {
            const fileExtension = item.image_url.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                imgVids.push(item)
            } else {
                docs.push(item)
            }
        })
        setImageVideos(imgVids)
        setDocuments(docs)
        setCommentCount(forumPostData?.post_comments_count ? forumPostData?.post_comments_count : 0)
    }, [forumPostData])

    // Delete attachment
    function deleteAttachment(id) {
        deletePostAttachment(id).then((res) => {
            getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
        }).catch((err) => { console.log("deletePostAttachment-err: ", err.message) })
    }

    // On delete attachment button handler
    const onDeleteFileBtnClick = (e, item) => {
        let isConfirm = confirmDelete("attachment")
        if (isConfirm) {
            deleteAttachment(item.photo_id)
        }
    }

    // On delete attachment button handler
    const cancelButtonHandler = (e, item) => {
        setIsEditMode(false)
        // setEditModeValue({ ...editModeValue, description: "", post_title: "", editorValue: "", mentions: [] })
        setEditModeValue({ ...editModeValue, description: "", post_title: "", mentions: [] })
    }

    // Pin post
    function pinPost(id, payload) {
        return updateForumPostPin(id, payload).then((res) => {
            getHotPosts()
            getForumPostsForLazyLoading(paginationData.per_page, paginationData.current_page, filters)
        }).catch((err) => { console.log("updateForumPostPin-err: ", err.message) })
    }

    // Pin Button click handler
    const pinButtonClickHandler = (postData) => {
        let data = { pin: postData?.pin ? 0 : 1 }
        pinPost(postData.post_id, data)
    }

    const seeMoreButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(true)
    }

    const seeLessButtonHandler = (e) => {
        e.stopPropagation()
        setShowFullText(false)
    }

    const rteOnChangeHandler = (value) => {
        setEditModeValue((prev) => ({ ...prev, description: value }))
    }

    const rteMentionOnChangeHandler = (mentions) => {
        let ids = mentions ? mentions.map(m => m.id) : []
        setEditModeValue((prev) => ({ ...prev, mentions: ids }))
    }

    const rteCommentOnChangeHandler = (value) => {
        setClearText("")
        setCommentError("")
        setCommentDesc(value)
    }

    const rteCommentMentionOnChangeHandler = (mentions) => {
        let ids = mentions ? mentions.map(m => m.id) : []
        setCommentDescEditor({
            value: "",
            mentions: ids
        })
    }

    return (
        <div className="post" id={`forum-post-number-${forumPostData?.post_id}`}>
            <div className="post-header">
                <div className='user-profile-wrap'>
                    <div className="user-profile">
                        <span className="initial-text">{getNameInitials(forumPostData?.user?.first_name, forumPostData?.user?.last_name)}</span>
                    </div>
                    <div className="user-info">
                        <div className='post-time-wrap'>
                            <h3 className="user-name">{forumPostData?.user?.first_name ? forumPostData?.user?.first_name : ""} {forumPostData?.user?.last_name ? forumPostData?.user?.last_name : ""}</h3>
                            <p className="post-time">Posted on {parseDateTimeString(forumPostData?.created_at, 11)}</p>
                        </div>
                        <p className='category mb-0'>{forumPostData?.category_details?.length > 0 ? forumPostData?.category_details[0].name : ""}</p>
                    </div>
                </div>
                <div className='d-flex align-items-center gap-2'>
                    <Tooltip placement="top" title={`${forumPostData?.pin ? "Unpin" : "Pin"}`}>
                        <div className='pin-post' onClick={() => { pinButtonClickHandler(forumPostData) }}>
                            {forumPostData?.pin ? <LuPinOff className='pin-icon' /> : <LuPin className='pin-icon' />}
                        </div>
                    </Tooltip>

                    {(forumPostData?.user_id == userId) && <div className='more-option'>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">
                                <IoMdMore />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="#/action-1" onClick={(e) => editForumPostHandler(e, forumPostData)}><TiEdit />Edit</Dropdown.Item>
                                {/* <Dropdown.Item href="#/action-1" onClick={(e) => editForumPostHandler(e, forumPostData)}><LuPin className='pin-icon' /><LuPinOff className='pin-icon'/>Pinned</Dropdown.Item> */}
                                <Dropdown.Item href="#/action-2" onClick={(e) => deleteForumPostHandler(e, forumPostData)}><RiDeleteBinLine />Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>}
                </div>
            </div>
            <div className="post-content">
                {(forumPostData?.post_title && !isEditMode) && <p className='post-title'>{forumPostData?.post_title}</p>}
                {(forumPostData?.description && !isEditMode) && <>{
                    showFullText ? <p className="post-description" dangerouslySetInnerHTML={{ __html: convertToLink(forumPostData?.description) }}></p> : <p className="post-description" dangerouslySetInnerHTML={{ __html: convertToLink(truncateText(forumPostData?.description, 1200)) }}></p>
                } {forumPostData?.description?.length > 1200 && (
                    showFullText ? <div className='see-more-btn' onClick={(e) => { seeLessButtonHandler(e) }}>See Less</div> : <div className='see-more-btn' onClick={(e) => { seeMoreButtonHandler(e) }}>See More</div>)
                    }</>}
                {isEditMode && <div className='edit-post-container'>
                    <div className='edit-input-wrap'>
                        <input
                            type="text"
                            className="form-control edit-text"
                            id="exampleFormControlInput1"
                            placeholder="Add Title Here...."
                            name='post_title'
                            onChange={editInputOnChangeHandler}
                            value={editModeValue.post_title}
                        />
                        {/* <MentionsInput
                            value={editModeValue.editorValue}
                            onChange={mentionsOnChangeHandler}
                            style={{ width: "100%", height: "100px" }}
                            placeholder="Type @ to tag users..."
                            className="edit-post-editor"
                        >
                            <Mention
                                trigger="@"
                                data={taggingList}
                                displayTransform={(id, display) => { return `@${display} ` }}
                            />
                        </MentionsInput> */}
                        <ForumRichTextEditor
                            taggingList={taggingList}
                            initialValue={rteInitialValue}
                            onChange={rteOnChangeHandler}
                            mentionOnChange={rteMentionOnChangeHandler}
                        />
                    </div>
                    <div className="file-edit-wrap">
                        {forumPostData?.post_images && forumPostData?.post_images.map((item, index) => {
                            const fileExtension = item.image_url.split('.').pop().toLowerCase();
                            let parts = item.image_url.split("/")
                            let result = parts[parts.length - 1];
                            let name = item?.document_name
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                                return (<div className='edit-post-wap'>
                                    <img key={index} className="post-upload-image" src={item.image_url} alt="upload image" />
                                    <MdCancel onClick={(e) => onDeleteFileBtnClick(e, item)} />
                                </div>)
                            } else {
                                return <div className='edit-post-wap'>
                                    <span key={index} className="mt-1">{name}</span>
                                    <MdCancel onClick={(e) => onDeleteFileBtnClick(e, item)} />
                                </div>
                            }
                        })}

                    </div>
                    {/* <div className='attachment-width'>
                  <label htmlFor="fileInput2" className="custom-file-input upload-btn">
                    <FaRegImage /> Attachments
                    <input
                      id="fileInput2"
                      type="file"
                      multiple={true}
                      name="photos"
                    //   onChange={editInputOnChangeHandler}
                    />
                  </label>
                  </div> */}
                    <a className="mx-4 cclBtn" onClick={cancelButtonHandler}>Cancel</a>
                    <button className='button mt-2' onClick={() => editForumPostSaveHandler(forumPostData)}>Save</button>
                </div>}

                {(imageVideos.length > 0 && !isEditMode) && <>
                    <Carousel >
                        {imageVideos.map((item, index) => {
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
                {(documents.length > 0 && !isEditMode) && <>
                    <div className='file-doc-wrap'>
                        {documents.map((item, index) => {
                            let parts = item.image_url.split("/")
                            let result = parts[parts.length - 1];
                            let name = item?.document_name
                            return <div className='file-doc'>
                                <img src={`/static/icons/${getIconPath(item.image_url)}`} />
                                <a key={index} href={item.image_url} target="_blank" rel="noopener noreferrer">{name}</a>
                            </div>
                        })}
                    </div>
                </>}
            </div>
            <div className="post-actions">
                <div className='post-action-btn'>
                    <div className='like-btn-wrap'>
                        <button
                            className={`like-btn ${forumPostData?.post_reactions?.upvote == 1 ? "liked" : ""}`}
                            onClick={() => { postBloomButtnHandler(forumPostData) }}
                        >
                            <SVG src={Like} />
                            <span>Bloom {forumPostData?.all_post_reactions_count > 0 && <span className='like-count'>({forumPostData?.all_post_reactions_count} Likes)</span>}</span>
                        </button>

                    </div>
                    <button
                        className="comment-btn"
                        id="myBtn1"
                        onClick={() => toggleVisibility(forumPostData?.post_id)}
                    >
                        <MdModeComment />
                        <span>Comment {commentCount ? `(${commentCount})` : ""}</span>
                    </button>
                </div>
                {!isHidden && (
                    <div className="comments">
                        {comments?.length > 0 && comments.map((com) => {
                            return <ForumComment ibUsers={ibUsers} taggingList={taggingList} getComments={getComments} comment={com} forumPostData={forumPostData} commentBloomButtnHandler={commentBloomButtnHandler} />
                        })}
                        <div className="new-post mb-0 new-comments">
                            <div className='user-width'>
                                <div className="user-profile">
                                    <span className="initial-text">{getNameInitials(localStorage.getItem('first_name'), localStorage.getItem('last_name'))}</span>
                                </div>
                            </div>
                            <div className="text-editor">
                                {/* <MentionsInput
                                    value={commentDescEditor.value}
                                    onChange={commentMentionsOnChangeHandler}
                                    style={{ width: "100%" }}
                                    placeholder="Type @ to tag users..."
                                    className="add-comment-editor"
                                >
                                    <Mention
                                        trigger="@"
                                        data={taggingList}
                                        displayTransform={(id, display) => { return `@${display} ` }}
                                        singleLine={true}
                                    />
                                </MentionsInput> */}
                                <ForumRichTextEditor
                                    taggingList={taggingList}
                                    onChange={rteCommentOnChangeHandler}
                                    mentionOnChange={rteCommentMentionOnChangeHandler}
                                    cleartext={cleartext}
                                />
                                <div className="send-btn" onClick={() => { sendCommentButtonHandler(forumPostData?.post_id) }}>
                                    <BsSendFill />
                                </div>
                            </div>
                        </div>
                        {commentError ? <span className='ms-5 text-danger'>{commentError}</span> : null}
                        <div className="child-comment hidden">
                            <div className="child-comment-section">
                                <img
                                    className="comment-profile-pic"
                                    src={profileImage}
                                    alt="Profile Picture"
                                />
                                <div className="comment-details">
                                    <p className="user-name">Amit</p>
                                    <p className="comment-content">
                                        This is a comment By Amit.This is a comment. This
                                        comment belongs to nowhere.Definition and Usage.
                                    </p>
                                    <p className="comment-buttons">
                                        <span className="like-button">Bloom</span>
                                        <span className="reply-button">Reply</span>
                                    </p>
                                </div>
                            </div>
                            <div className="child-comment-section">
                                <img
                                    className="comment-profile-pic"
                                    src={profileImage}
                                    alt="Profile Picture"
                                />
                                <div className="comment-details">
                                    <p className="user-name">Rajesh</p>
                                    <p className="comment-content">
                                        This is a comment by rajesh. This is a comment. This
                                        comment belongs to nowhere.Definition and Usage. The
                                        comment tag is used to insert comments in the source
                                        code. Comments are not displayed in the browsers. You
                                        can use comments
                                    </p>
                                    <p className="comment-buttons">
                                        <span className="like-button fa fa-thumbs-up">Like</span>
                                        <span className="reply-button">Reply</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ForumPost