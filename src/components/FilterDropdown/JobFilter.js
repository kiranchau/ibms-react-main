/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */

import React, { useEffect, useState } from 'react';
import axios from "axios"

import DropDown from './DropDown';
import { getJobDropdown } from '../../API/authCurd';
import { getSelectedOptionsFromLocalStorage, moveSelectedToTop, processOptions, saveSelectedOptionsToLocalStorage } from '../../Utils/helpers';
import { sortObjectsByAttribute } from '../../Utils/sortFunctions';

export default function JobFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset, subsection }) {
    const [searchText, setSearchText] = useState("")
    const [searchOptions, setSearchOptions] = useState([])
    const [cancelToken, setCancelToken] = useState(null)
    const [message, setMessage] = useState("Enter at least 3 characters to search.") 
    const [selectedOptions, setSelectedOptions] = useState([])

    // Search Api
    function getSearchOptions(str) {
        if (cancelToken) {
            cancelToken.cancel('Operation canceled due to new request.');
          }
        // Create a new CancelToken
        const newCancelToken = axios.CancelToken.source();
        setCancelToken(newCancelToken);
        return getJobDropdown(str, filters.customer_id, newCancelToken.token).then((res) => {
            if (res.data) { return res.data?.Projects }
        }).catch(() => { return })
    }

    // On Search Change function
    function onSearchChange(e) {
        setSearchText(e.target.value)
    }

    // On clear filter function
    function onClearFilter() {
        setSearchText("")
        setSearchOptions([])
        setFilters({ ...filters, job_id: [] })
        onReset('job_id')
        close()
        clearFilters && clearFilters()
        setSelectedOptions([])
        saveSelectedOptionsToLocalStorage("jobname", subsection, [])
    }

    // On Filter function
    function onFilterHandler() {
        close()
        onFilter()
        confirm()
        let options = moveSelectedToTop(searchOptions, 'name', filters?.job_id ? filters?.job_id : [])
        setSearchOptions(options)
    }

    // On Search Change function
    function onSelectHandler(e, item) {
        let checkedOpts = filters.job_id ? filters.job_id : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, job_id: checkedOpts })
        let options = searchOptions ? searchOptions?.filter((opt) => checkedOpts?.includes(opt.id)) : []
        setSelectedOptions(options)
        saveSelectedOptionsToLocalStorage("jobname", subsection, options)
    }

    // Search api call
    useEffect(() => {
        if (searchText.length >= 3) {
            getSearchOptions(searchText).then((data) => {
                if (data) {
                    if (data?.length == 0) {
                        setMessage("No Result")
                    } else {
                        setMessage("")
                    }
                    let arr = processOptions(selectedOptions, data)
                    setSearchOptions(arr)
                }
            })
        } else {
            setMessage("Enter at least 3 characters to search.")
            const storedOptions = getSelectedOptionsFromLocalStorage("jobname", subsection);
            setSelectedOptions(sortObjectsByAttribute(storedOptions));
            setSearchOptions(sortObjectsByAttribute(storedOptions))
        }
    }, [searchText]);

    return (
        <DropDown
            placeholder={"Search Job"}
            onSearchChange={onSearchChange}
            onSelectChange={onSelectHandler}
            searchText={searchText}
            options={searchOptions}
            selectedOptions={filters.job_id}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
            addTip={false}
            message={message}
        />
    )
}
