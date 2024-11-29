import React from 'react'
import CustomerContextProvider from '../../contexts/CustomerContext'
import Notification from './Notification'
import JobContextProvider from '../../contexts/JobContext'
import TaskContextProvider from '../../contexts/TaskContext'
import CallTimeEntryContextProvider from '../../contexts/CallTimeEntryContext'

const NotificatonPage = ({ children }) => {
    return (
        <CustomerContextProvider>
            <JobContextProvider>
                <TaskContextProvider>
                    <CallTimeEntryContextProvider>
                        <Notification />
                    </CallTimeEntryContextProvider>
                </TaskContextProvider>
            </JobContextProvider>
        </CustomerContextProvider>
    )
}

export default NotificatonPage