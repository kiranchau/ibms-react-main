/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import SVG from 'react-inlinesvg';
import Like from "../../../images/bloom.svg"
import { getNameInitials, separateAndTransformIdsWithZero, truncateText } from '../../../Utils/helpers'
import { parseDateTimeString } from '../../../Utils/dateFormat'
import { deleteComment, editComment } from '../../../API/authCurd';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import { FaCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { MentionsInput, Mention } from 'react-mentions';
import ForumRichTextEditor from "../../commonModules/UI/ForumRichTextEditor";

const ForumComment = ({ comment, forumPostData, commentBloomButtnHandler, getComments, ibUsers, taggingList }) => {
    const [commentEditvalue, setCommentEditValue] = useState("")
    const [commentEditor, setCommentEditor] = useState({
        value: "",
        mentions: []
    })
    const [isEditMode, setIsEditMode] = useState(false)
    const userId = localStorage.getItem("id")
    const [showFullText, setShowFullText] = useState(true)
    const [rteInitialValue, setRteInitialValue] = useState("")

    useEffect(() => {
        if (comment?.description?.length > 1200) {
            setShowFullText(false)
        } else {
            setShowFullText(true)
        }
    }, [comment])

    function deleteCommentData(id, postId) {
        deleteComment(id, postId).then(() => {
            getComments(postId)
        }).catch((err) => { console.log("deleteCommentData-err: ", err.message) })
    }

    function editCommentData(id, postId, data) {
        return editComment(id, data).then(() => {
            getComments(postId)
            setRteInitialValue("")
        }).catch((err) => { console.log("editCommentData-err: ", err.message) })
    }

    function commentEditButtonHandler(data) {
        setRteInitialValue(data.description ? data.description : "")
        setCommentEditValue(data.description)
        setCommentEditor({
            value: "",
            mentions: data.mentions ? data.mentions : []
        })
        setIsEditMode(true)
    }

    function commentSaveButtonHandler(comment) {
        if (commentEditvalue == "") {
            return
        }
        const { userIds, deptIds } = separateAndTransformIdsWithZero(commentEditor.mentions)
        let data = {
            post_id: comment.post_id,
            description: commentEditvalue,
            mentions: userIds ? userIds : [],
            group_mentions: deptIds ? deptIds : []
        }
        editCommentData(comment.comment_id, comment.post_id, data).then(() => {
            setCommentEditValue("")
            setCommentEditor({
                value: "",
                mentions: []
            })
            setIsEditMode(false)
        })
    }

    function commentEditOnChangeHandler(e) {
        setCommentEditValue(e.target.value)
    }

    const commentMentionsOnChangeHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCommentEditValue(newPlainTextValue)
        let ids = mentions ? mentions.map(m => m.id) : []
        setCommentEditor({
            value: newValue,
            mentions: ids
        })
    }
    function commentEditCancelButtonHandler(e) {
        setCommentEditValue("")
        setCommentEditor({
            value: "",
            mentions: []
        })
        setIsEditMode(false)
    }

    function commentDeleteButtonHandler(data) {
        let isConfirm = confirmDelete("comment")
        if (isConfirm) {
            deleteCommentData(data.comment_id, data.post_id)
        }
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
        setCommentEditValue(value)
    }

    const rteMentionOnChangeHandler = (mentions) => {
        let ids = mentions ? mentions.map(m => m.id) : []
        setCommentEditor({
            value: "",
            mentions: ids
        })
    }

    return (
        <div class="comment">
            <div>
                <div className="user-profile">
                    <span className="initial-text">{getNameInitials(comment.created_by_user?.first_name, comment.created_by_user?.last_name)}</span>
                </div>
            </div>
            <div class="comment-details">
                <div className='commnet-bg'>
                    <div className='userpost-time'>
                        <p class="user-name">{comment.created_by_user?.first_name ? comment.created_by_user?.first_name : ""} {comment.created_by_user?.last_name ? comment.created_by_user?.last_name : ""}</p>
                        <p class="post-time">Posted on {parseDateTimeString(comment?.created_at, 11)}</p>
                    </div>
                    {/* {!isEditMode && <p class="comment-content">{comment.description}</p>} */}
                    {!isEditMode && <>{
                        // showFullText ? <p class="comment-content">{comment.description}</p> : <p class="comment-content">{truncateText(comment.description, 1200)}</p>}
                        showFullText ? <p class="comment-content" dangerouslySetInnerHTML={{__html: comment.description}}></p> : <p class="comment-content" dangerouslySetInnerHTML={{__html: truncateText(comment.description, 1200)}}></p>}
                        {comment?.description?.length > 1200 && (
                            showFullText ? <div className='see-more-btn' onClick={(e) => { seeLessButtonHandler(e) }}>See Less</div> : <div className='see-more-btn' onClick={(e) => { seeMoreButtonHandler(e) }}>See More</div>)
                        }
                    </>}
                    {(isEditMode && commentEditvalue) && <div className="comment-editor">
                        {/* <MentionsInput
                            value={commentEditor.value}
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
                            initialValue={rteInitialValue}
                            onChange={rteOnChangeHandler}
                            mentionOnChange={rteMentionOnChangeHandler}
                        />
                        <div className='comment-btn-wrap'>
                            <div className="close-btn action-btn" onClick={() => { commentEditCancelButtonHandler() }}>
                                <IoClose />
                            </div>
                            <div className="check-btn action-btn" onClick={() => { commentSaveButtonHandler(comment) }}>
                                <FaCheck />
                            </div>
                        </div>
                    </div>}
                </div>
                <p class="comment-buttons">
                    <div className='like-btn-wrap'>
                     <div className='d-flex'>
                     <button
                            className={`like-btn m-0 ${comment?.reactions?.upvote == 1 ? "liked" : ""}`}
                            onClick={() => commentBloomButtnHandler(comment, forumPostData)}
                        >
                            <SVG src={Like} />
                            <span>Bloom</span>
                            
                        </button>
                        {comment?.all_comment_reactions_count > 0 && <span className='like-count mx-1'>({comment?.all_comment_reactions_count} Likes)</span>}
                       
                     </div>
                        {(comment?.created_by == userId) && <span className='like-btn' onClick={() => commentEditButtonHandler(comment)}>Edit</span>}
                        {(comment?.created_by == userId) && <span className='like-btn' onClick={() => commentDeleteButtonHandler(comment)}>Delete</span>}
                    </div>
                </p>
            </div>
        </div>
    )
}

export default ForumComment