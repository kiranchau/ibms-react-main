/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable array-callback-return */
import React, { useContext, useEffect, useState } from 'react'
import { BiSolidMessage } from "react-icons/bi";
import { MdOutlineReply } from "react-icons/md";
import NODATA from "../../../images/not-found.jpg"
import { getNameInitials } from '../../../Utils/helpers';
import { parseDateTimeString } from '../../../Utils/dateFormat';
import { ActivityNotesContext } from '../../contexts/ActivityNotesContext';
import ActivityPopups from '../../popups/taskpops/ActivityPopups';

export const RecentNotesWidget = ({ dashboardData }) => {
    const [recentNotes, setRecentNotes] = useState([])
    const {
        taskActivePopup, taskActivityNotes, setTaskActivityNotes, selectedTaskForActivity, taskFileList, isJob, getActivityNotesByTaskId,
        taskDocumentUploadCustomRequest, handleTaskDocDownload, taskDocOnChangehandler, onTaskActivityPopupCloseHandler, handleTaskDocRemove,
        jobActivePopup, jobActivityNotes, setJobActivityNotes, selectedJobForActivity, jobfileList, JobdocumentUploadCustomRequest, handleJobDocRemove,
        handleJobDocDownload, jobdocOnChangehandler, getActivityNotesByJobId, closeJobActivityPopup, onNoteButtonClick
    } = useContext(ActivityNotesContext)

    useEffect(() => {
        if (dashboardData) {
            setRecentNotes(dashboardData?.recent_notes ? dashboardData.recent_notes : "");
        }
    }, [dashboardData])

    return (
        <>
            <div className='recent-notes-widget widget-container '>
                <div className='header'>
                    <div className='header-content'>
                        <BiSolidMessage />
                        <h4>Recent Notes</h4>
                    </div>
                </div>
                <div className='inner-widget-wrap'>
                {recentNotes.length > 0 ? recentNotes.map((item) => {
                    return <div key={item.id} className='inner-widget '>
                        <div className='widget-card '>
                            <div className='user-info'>
                                <div className='user-profile'>
                                    {getNameInitials(item?.created_by_user?.first_name, item?.created_by_user?.last_name)}
                                </div>
                                <div className='user-name-category'>
                                    <h5>{`${item?.created_by_user?.first_name} ${item?.created_by_user?.last_name ? item?.created_by_user?.last_name : ""}`}</h5>
                                    <p className='post-time'>Posted on {parseDateTimeString(item.created_at, 1)}</p>
                                    {/* <p>Digital Marketing</p> */}
                                </div>
                               
                            </div>
                            <div className='post-content hot-post-content'>
                                {item.note && <p dangerouslySetInnerHTML={{ __html: item.note }}></p>}
                                <div>
                                <button className='button reply-btn' onClick={(e)=>onNoteButtonClick(e, item)}>Reply <MdOutlineReply /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                }) : <div className="no-data">
                    <img src={NODATA} />
                    <p>There are no recent notes.</p>
                </div>}
                </div>
            </div>
            {<div className={`${taskActivePopup ? "mainpopups" : "nomainpopups"}`}>
                <ActivityPopups
                    onClick={onTaskActivityPopupCloseHandler}
                    activityNotes={taskActivityNotes}
                    setActivityNotes={setTaskActivityNotes}
                    selectedTask={selectedTaskForActivity}
                    getActivityNotesByTaskId={getActivityNotesByTaskId}
                    documentUploadCustomRequest={taskDocumentUploadCustomRequest}
                    fileList={taskFileList}
                    docOnChangehandler={taskDocOnChangehandler}
                    handleDownload={handleTaskDocDownload}
                    handleRemove={handleTaskDocRemove}
                    isJob={isJob}
                />
                <div className="blurBg"></div>
            </div>}
            {<div className={`${jobActivePopup ? "mainpopups" : "nomainpopups"}`}>
                <ActivityPopups
                    onClick={closeJobActivityPopup}
                    activityNotes={jobActivityNotes}
                    setActivityNotes={setJobActivityNotes}
                    selectedJob={selectedJobForActivity}
                    getActivityNotesByTaskId={getActivityNotesByJobId}
                    multiple={true}
                    documentUploadCustomRequest={JobdocumentUploadCustomRequest}
                    fileList={jobfileList}
                    docOnChangehandler={jobdocOnChangehandler}
                    handleDownload={handleJobDocDownload}
                    handleRemove={handleJobDocRemove}
                    isJob={isJob}
                />
                <div className="blurBg"></div>
            </div>}
        </>
    )
}
