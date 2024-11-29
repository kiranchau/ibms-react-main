import React from 'react'
import Task from './Task'
import CustomerContextProvider from '../../contexts/CustomerContext'
import JobContextProvider from '../../contexts/JobContext'
import TaskContextProvider from '../../contexts/TaskContext'

const TaskPage = () => {
    return (
        <CustomerContextProvider>
            <JobContextProvider>
                <TaskContextProvider>
                    <Task />
                </TaskContextProvider>
            </JobContextProvider>
        </CustomerContextProvider>
    )
}

export default TaskPage