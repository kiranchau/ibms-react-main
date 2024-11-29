/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import { createContext } from "react";

import { deleteJobDocument, deleteTaskActivityDocument, fetchActivityNotesByJobId, fetchActivityNotesByTaskId, getSingleJob, getSingleTask, uploadJobActivityDocument, uploadTaskActivityDocument } from '../../API/authCurd';
import { confirmDelete } from '../commonModules/UI/Dialogue';
import { downloadFile } from '../../Utils/helpers';
import { jobActivityDocExtentions, taskActivityDocExtentions } from '../../Utils/staticdata';

export const ActivityNotesContext = createContext();

const ActivityNotesContextProvider = ({ children }) => {
    const [taskActivePopup, setTaskActivePopup] = useState(false);
    const [taskActivityNotes, setTaskActivityNotes] = useState([]);
    const [selectedTaskForActivity, setSelectedTaskForActivity] = useState(null)
    const [taskFileList, setTaskFileList] = useState([]);
    const [isJob, setIsJob] = useState(false)

    const [jobActivePopup, setJobActivePopup] = useState(false);
    const [jobActivityNotes, setJobActivityNotes] = useState([]);
    const [selectedJobForActivity, setSelectedJobForActivity] = useState(null);
    const [jobfileList, setJobFileList] = useState([]);

    // Get Activity notes by id
    function getActivityNotesByTaskId(id) {
        fetchActivityNotesByTaskId(id).then((res) => {
            setTaskActivityNotes(res.data)
        }).catch(() => { setSelectedTaskForActivity(null) })
    }

    useEffect(() => {
        if (selectedTaskForActivity) {
            const doc = selectedTaskForActivity?.activity_document_details?.map((doc) => {
                let parts = doc.document_url.split("/")
                let name = parts[parts.length - 1]
                return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
            })
            setTaskFileList(doc)
        }
    }, [selectedTaskForActivity])

    // Document upload handler
    const taskDocumentUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        if (!taskActivityDocExtentions.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('documents1', data.file)
            formData.append('id', selectedTaskForActivity.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadTaskActivityDocument(formData, config).then((res) => {
                onSuccess(res.data)
            }).catch(err => {
                onError({ message: err.response?.data.message || "Failed to upload document" })
            })
        } else {
            onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
        }
    }

    // Docuemnt remove function
    function removeTaskDocument(id) {
        deleteTaskActivityDocument(id).then(() => {
            setTaskFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteTaskActivityDocument-err", err)
        })
    }

    // Document remove Handler
    const handleTaskDocRemove = (e) => {
        let isConfirm = confirmDelete("document")
        if (isConfirm) {
            if (e.status == "error") {
                setTaskFileList((prev) => { return prev.filter((item) => item.uid != e.uid) })
            } else {
                removeTaskDocument(e.uid)
            }
        }
    }

    // Document download Handler
    const handleTaskDocDownload = (e) => {
        downloadFile(e.url, e.name)
    }

    // Document onchange Handler
    const taskDocOnChangehandler = (e) => {
        if (e.file.status == "done") {
            let items = [...taskFileList]
            let newArr = items.map((item) => {
                if (item.uid == e.file.uid) {
                    let parts = e.file.response?.url?.split("/")
                    let name = parts[parts.length - 1]
                    return { uid: e.file.response.document_id, name: name ? name : "Document", status: 'done', url: e.file.response.url }
                }
                return item
            })
            setTaskFileList(newArr)
        } else {
            setTaskFileList(e.fileList)
        }
    }

    // Activity popup close button
    const onTaskActivityPopupCloseHandler = () => {
        setSelectedTaskForActivity(null)
        setTaskActivityNotes([])
        setTaskActivePopup(false)
        setTaskFileList([])
    }

    // Job document 
    useEffect(() => {
        if (selectedJobForActivity) {
            const doc = selectedJobForActivity?.activity_document_details?.map((doc) => {
                let parts = doc.document_url.split("/")
                // let name = parts[parts.length - 1]
                let name = doc?.document_name
                return { uid: doc.document_id, name: name ? name : "Document", status: 'done', url: doc.document_url }
            })
            setJobFileList(doc)
        }
    }, [selectedJobForActivity])

    // Document upload handler
    const JobdocumentUploadCustomRequest = (data) => {
        const { onSuccess, onError, onProgress } = data
        const fileExtension = data.file?.name?.split('.').pop().toLowerCase()
        if (!jobActivityDocExtentions.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('documents1', data.file)
            formData.append('id', selectedJobForActivity.id)

            const config = {
                onUploadProgress: (e) => {
                    onProgress({ percent: (e.loaded / e.total) * 100 })
                }
            }
            uploadJobActivityDocument(formData, config).then((res) => {
                onSuccess(res.data)
            }).catch(err => {
                onError({ message: err.response?.data.message || "Failed to upload document" })
            })
        } else {
            onError({ message: fileExtension ? `Failed to upload .${fileExtension} file` : "Failed to upload file" })
        }
    }

    // Docuemnt remove function
    function removeJobDocument(id) {
        deleteJobDocument(id).then(() => {
            setJobFileList((prev) => prev.filter((item) => item.uid != id))
        }).catch((err) => {
            console.log("deleteJobDocument-err", err)
        })
    }

    // Document remove Handler
    const handleJobDocRemove = (e) => {
        let isConfirm = confirmDelete("document")
        if (isConfirm) {
            if (e.status == "error") {
                setJobFileList((prev) => { return prev.filter((item) => item.uid != e.uid) })
            } else {
                removeJobDocument(e.uid)
            }
        }
    }

    // Document download Handler
    const handleJobDocDownload = (e) => {
        downloadFile(e.url, e.name)
    }

    // Document onchange Handler
    const jobdocOnChangehandler = (e) => {
        if (e.file.status == "done") {
            let items = [...jobfileList]
            let newArr = items.map((item) => {
                if (item.uid == e.file.uid) {
                    let parts = e.file.response?.url?.split("/")
                    let name = parts[parts.length - 1]
                    return { uid: e.file.response.document_id, name: name ? name : "Document", status: 'done', url: e.file.response.url }
                }
                return item
            })
            setJobFileList(newArr)
        } else {
            setJobFileList(e.fileList)
        }
    }


    // Get single task data by ID
    function getSingleTaskData(id) {
        return getSingleTask(id).then((res) => {
            if (res.data?.Task) {
                setSelectedTaskForActivity(res.data?.Task)
            }
            return res.data?.Task
        }).catch(() => {
            setSelectedTaskForActivity(null)
        })
    }

    // Get activity notes of job
    const getActivityNotesByJobId = (id) => {
        fetchActivityNotesByJobId(id).then((res) => {
            if (res.data?.job_notes) {
                setJobActivityNotes(res.data?.job_notes)
            }
        }).catch(() => { setJobActivityNotes([]) })
    }

    // Get single job record 
    function getSingleJobData(id) {
        return getSingleJob(id).then((res) => {
            return res?.data
        }).catch(err => {
            return
        })
    }

    // On Row click handler
    const onNoteButtonClick = (e, record) => {
        if (record.task_id) {
            setIsJob(false)
            getActivityNotesByTaskId(record.task_id)
            getSingleTaskData(record.task_id).then(() => {
                setTaskActivePopup(true)
            }).catch((err) => {
                console.log("getSingleTaskData: ", err)
            })
        } else if(record.job_id) {
            setIsJob(true)
            getSingleJobData(record.job_id).then((res) => {
                if (res?.job) {
                    setSelectedJobForActivity(res.job)
                }
            }).catch(() => {
                setSelectedJobForActivity(null)
            })
            getActivityNotesByJobId(record.job_id)
            setJobActivePopup(true)
        }
    }

    const closeJobActivityPopup = () => {
        setJobFileList([])
        setSelectedJobForActivity(null)
        setJobActivePopup(false)
        setJobActivityNotes([])
    }

    return (
        <ActivityNotesContext.Provider value={{
            taskActivePopup, setTaskActivePopup, taskActivityNotes, setTaskActivityNotes,
            selectedTaskForActivity, setSelectedTaskForActivity, taskFileList, setTaskFileList, isJob, setIsJob, getActivityNotesByTaskId,
            taskDocumentUploadCustomRequest, handleTaskDocDownload, taskDocOnChangehandler, onTaskActivityPopupCloseHandler, handleTaskDocRemove,
            onNoteButtonClick, jobActivePopup, setJobActivePopup, jobActivityNotes, setJobActivityNotes, selectedJobForActivity, setSelectedJobForActivity, 
            jobfileList, setJobFileList, JobdocumentUploadCustomRequest, handleJobDocRemove, handleJobDocDownload, jobdocOnChangehandler, getActivityNotesByJobId,
            closeJobActivityPopup
        }}>
            {children}
        </ActivityNotesContext.Provider>
    )
}

export default ActivityNotesContextProvider
