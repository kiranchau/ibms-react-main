import React from 'react'
import JobContextProvider from '../../contexts/JobContext'
import Jobs from './Jobs'
import CustomerContextProvider from '../../contexts/CustomerContext'
import TaskContextProvider from '../../contexts/TaskContext'

const JobPage = () => {
    return (
        <CustomerContextProvider>
            <JobContextProvider>
                <TaskContextProvider>
                    <Jobs />
                </TaskContextProvider>
            </JobContextProvider>
        </CustomerContextProvider>
    )
}

export default JobPage