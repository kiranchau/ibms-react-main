/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import '../../SCSS/popups.scss';
import Button from '../../commonModules/UI/Button';
import RichTextEditor from '../../commonModules/UI/RichTextEditor';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { getNameInitials, getUserInitials } from '../../../Utils/helpers';
import { addActivityNotes, deleteActivityNotes, updateActivityNotes } from '../../../API/authCurd';
import { IoIosCloseCircle } from "react-icons/io";
import parse from 'html-react-parser';
import { confirmDelete } from '../../commonModules/UI/Dialogue';
import CustomerDocUpload from '../../commonModules/UI/CustomerDocUpload';
const regex = /<p>\s+<\/p>/

const ActivityPopups = (props) => {
  const [toggle, setToggle] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModeValue, setEditModeValue] = useState("");
  const [commentSelectedForEdit, setCommentSelectedForEdit] = useState(null);

  const richTextEditorSaveBtnHandler = async (taskId, payload, comment, jobId) => {
    return addActivityNotes(payload).then(() => {
      if (props.isJob) {
        props.getActivityNotesByTaskId(jobId);
      } else {
        props.getActivityNotesByTaskId(taskId);
      }
    }).catch((error) => {
      console.error('addActivityNotes:error ', error);
    });
  };

  const onDeleteBtnClick = (e, comment) => {
    e.preventDefault();
    let isConfirm = confirmDelete("note")
    if (isConfirm) {
      deleteActivityNotes(comment.id)
        .then(() => {
          const updatedActivityNotes = props.activityNotes.filter((item) => item.id !== comment.id);
          props.setActivityNotes(updatedActivityNotes);
          if(props.getUserNOtificationsList){
            props.getUserNOtificationsList(false)
          }
        }).catch((error) => {
          console.error('Error deleting note', error);
        });
    }
  };

  const onEditBtnClick = (e, comment) => {
    e.preventDefault();
    setIsEditMode(true);
    setCommentSelectedForEdit(comment);
    setEditModeValue(comment.note);
  };

  const editModeSaveBtnHandler = async (taskId, payload, comment, jobId) => {
    return updateActivityNotes(comment.id, payload)
      .then(() => {
        if (props.isJob) {
          props.getActivityNotesByTaskId(jobId);
        } else {
          props.getActivityNotesByTaskId(taskId);
        }
        setEditModeValue('');
        setIsEditMode(false);
        setCommentSelectedForEdit(null);
      }).catch((error) => {
        setEditModeValue('');
        setIsEditMode(false);
        console.error('updateActivityNotes:error ', error);
      });
  };

  const closeBtnHandler = () => {
    props.onClick();
    setIsEditMode(false);
  };

  return (
    <div className='popups d-flex justify-content-center align-items-center w-100'>
      <div className='addpopups activity-log'>
        <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
          {props.isJob ? <div>
            JOB: {`${props.selectedJob?.customer_details?.name ? props.selectedJob?.customer_details?.name + ' - ' : ''}`}{' '}
            {`${props.selectedJob?.name ? props.selectedJob?.name : ''}`}
          </div> :
            <div>
              TASK: {`${props.selectedTask?.customer_details?.name ? props.selectedTask?.customer_details?.name + ' - ' : ''}`}{' '}
              {`${props.selectedTask?.project_details?.name ? props.selectedTask?.project_details?.name + ' - ' : ''}`}{' '}
              {`${props.selectedTask?.name ? props.selectedTask?.name : ''}`}
            </div>}
          <div className='myIcon' type='button' onClick={closeBtnHandler}>
            <IoIosCloseCircle style={{ width: '28px' }} />
          </div>
        </div>
        <div className='popBody p-3 activity-modal-content'>
          <div className='column-wrap'>
            <div className='add-text-wrap'>
              <h6 className='content-title'>Notes / Activity</h6>
              <div >
                <div className='w-100 activity-editor'>
                  <div className='initial-text'>
                    <span>{getNameInitials(localStorage.getItem('first_name'), localStorage.getItem('last_name'))}</span>
                  </div>
                  <RichTextEditor
                    selectedTask={props.selectedTask}
                    selectedJob={props.selectedJob}
                    saveButtonHandler={richTextEditorSaveBtnHandler}
                  />
                </div>
                <div className='w-100'>
                </div>
              </div>
              <div className='tabs-wrap'>
                <div className={toggle === 1 ? 'comments-content align-start flex-column' : 'hide-content'}>
                  {props.activityNotes.length > 0 ? (
                    props.activityNotes.map((item) => {
                      return (item?.note != "<p><br></p>" && !regex.test(item?.note)) ? <div key={item.id} className='d-flex activity-user-comments'>
                     
                      <div className='w-100' >
                      <div className='user-details-wrap'>
                      <div className='initial-text pe-3'>
                        <span>{getUserInitials(item?.created_by_user?.first_name, item?.created_by_user?.last_name)}</span>
                      </div>
                        <div className='user-details'>
                          <p className='user-name'>{`${item?.created_by_user?.first_name} ${item?.created_by_user?.last_name ? item?.created_by_user?.last_name : ""}`}</p>

                            <p className='date-time'>Posted on {parseDateTimeString(item.created_at, 1)} {item?.updated_by_user ? `(edited ${parseDateTimeString(item.updated_at, 1)} by ${item?.updated_by_user?.first_name} ${item?.updated_by_user?.last_name ? item?.updated_by_user?.last_name : ""})` : ""}</p>
                        </div>
                        </div>
                        {commentSelectedForEdit?.id === item?.id && isEditMode ? (
                          <div className='text-editor'>
                            <div className='activity-editor'>
                              <RichTextEditor
                                editValue={editModeValue}
                                selectedTask={props.selectedTask}
                                selectedJob={props.selectedJob}
                                saveButtonHandler={editModeSaveBtnHandler}
                                commentSelectedForEdit={commentSelectedForEdit}
                              />
                            </div>
                          </div>
                        ) : (
                              <p className='comment' dangerouslySetInnerHTML={{ __html: item.note }}></p>
                        )}
                        <div className='comment-action'>
                          <a href='' className={`${(commentSelectedForEdit?.id === item?.id && isEditMode) ? "edit-mode" : ""}`} onClick={(e) => onEditBtnClick(e, item)}>
                            Edit
                          </a>
                          <a href='' onClick={(e) => onDeleteBtnClick(e, item)}>
                            Delete
                          </a>
                        </div>
                      </div>
                      </div> : null
                    })
                  ) : (
                    <div className='no-activity'>
                      <span>No Activities</span>
                    </div>
                  )}
                </div>
                <div className={toggle === 2 ? 'comments-content' : 'hide-content'}>{/* History content goes here */}</div>
              </div>
            </div>
            <div className='file-upoad-wrap'>
              <h6 className='content-title'>Upload Documents</h6>
              <CustomerDocUpload
                multiple={true}
                customRequest={props.documentUploadCustomRequest}
                fileList={props.fileList}
                onChange={props.docOnChangehandler}
                handleDownload={props.handleDownload}
                handleRemove={props.handleRemove}
              />
            </div>
          </div>

        </div>
        {/* <div className='mt-auto popfoot w-100 p-2'>
          <div className='d-flex align-items-center justify-content-center'>
            <Button className="mx-4 cclBtn" onClick={closeBtnHandler} >Cancel</Button>
            <Button type="submit" onClick={closeBtnHandler}>Save</Button>
          </div>
        </div> */}
      </div>

    </div>
  );
};

export default ActivityPopups;
