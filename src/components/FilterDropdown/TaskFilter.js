/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */

import React, { useEffect, useState } from 'react';
import axios from "axios"

import DropDown from './DropDown';
import { getTaskDropdown } from '../../API/authCurd';
import { getSelectedOptionsFromLocalStorage, moveSelectedToTop, processOptions, saveSelectedOptionsToLocalStorage } from '../../Utils/helpers';
import { sortObjectsByAttribute } from '../../Utils/sortFunctions';


export default function TaskFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset, subsection }) {
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
        return getTaskDropdown(str, filters.job_id, filters.customer_id, newCancelToken.token).then((res) => {
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
        setFilters({ ...filters, task_id: [] })
        onReset('task_id')
        close()
        clearFilters && clearFilters()
        setSelectedOptions([])
        saveSelectedOptionsToLocalStorage("taskname", subsection, [])
    }

    // On Filter function
    function onFilterHandler() {
        close()
        onFilter()
        confirm()
        let options = moveSelectedToTop(searchOptions, 'name', filters?.task_id ? filters?.task_id : [])
        setSearchOptions(options)
    }

    // On Search Change function
    function onSelectHandler(e, item) {
        let checkedOpts = filters.task_id ? filters.task_id : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, task_id: checkedOpts })
        let options = searchOptions ? searchOptions?.filter((opt) => checkedOpts?.includes(opt.id)) : []
        setSelectedOptions(options)
        saveSelectedOptionsToLocalStorage("taskname", subsection, options)
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
            setSearchOptions([])
            const storedOptions = getSelectedOptionsFromLocalStorage("taskname", subsection);
            setSelectedOptions(sortObjectsByAttribute(storedOptions));
            setSearchOptions(sortObjectsByAttribute(storedOptions))
        }
    }, [searchText]);

    return (
        <DropDown
            placeholder={"Search Task"}
            onSearchChange={onSearchChange}
            onSelectChange={onSelectHandler}
            searchText={searchText}
            options={searchOptions}
            selectedOptions={filters.task_id}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
            addTip={false}
            message={message}
        />
    )
}
