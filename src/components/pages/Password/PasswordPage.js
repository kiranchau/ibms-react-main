import React from 'react'
import { Password } from './Password'
import CustomerContextProvider from '../../contexts/CustomerContext'

const PasswordPage = () => {
    return (
        <CustomerContextProvider>
            <Password />
        </CustomerContextProvider>
    )
}

export default PasswordPage