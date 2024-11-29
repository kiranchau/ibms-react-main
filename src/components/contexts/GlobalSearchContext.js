import React, { useState } from 'react'
import { createContext } from "react";
import { getUserDetails } from '../../API/authCurd';

export const GlobalSearch = createContext();

const GlobalSearchContextProvider = ({ children }) => {
    const [globalSearch, setGlobalSearch] = useState("")
    const [serchText, setSearchText] = useState("");
    const [mentionArr, setMentionArr] = useState([])
    const [companies, setCompanies] = useState([])
    const [selectedCompany, setSelectedCompany] = useState("")
    const [selectedCompanyData, setSelectedCompanyData] = useState(null)
    const [userData, setUserData] = useState(null);

    const resetSearch = () => {
        setSearchText("")
        setGlobalSearch("")
    }

    const fetchUserData = () => {
        return getUserDetails().then((res) => {
            setUserData(res.data)
            return res.data;
        }).catch((err) => { })
    }

    return (
        <GlobalSearch.Provider value={{ globalSearch, setGlobalSearch, serchText, setSearchText, resetSearch, mentionArr, setMentionArr, companies, setCompanies, selectedCompany, setSelectedCompany, selectedCompanyData, setSelectedCompanyData, userData, setUserData, fetchUserData }}>{children}</GlobalSearch.Provider>
    )
}

export default GlobalSearchContextProvider