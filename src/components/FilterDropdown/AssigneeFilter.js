/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */

import React, { useEffect, useState } from 'react';
import axios from "axios"

import DropDown from './DropDown';
import { GetUsers, getUserDropdown } from '../../API/authCurd';
import DropDownFilter from './DropDownFilter';
import { sortObjectsByAttribute } from '../../Utils/sortFunctions';
import { moveSelectedToTop } from '../../Utils/helpers';


export default function AssigneeFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    const [searchText, setSearchText] = useState("")
    const [searchOptions, setSearchOptions] = useState([])
    const [cancelToken, setCancelToken] = useState(null)

    // Search Api
    function getSearchOptions(str) {
        if (cancelToken) {
            cancelToken.cancel('Operation canceled due to new request.');
        }
        // Create a new CancelToken
        const newCancelToken = axios.CancelToken.source();
        setCancelToken(newCancelToken);
        return getUserDropdown(str, newCancelToken.token).then((res) => {
            if (res.data) { return res.data?.Users }
        }).catch(() => { return })
    }

    // Get user list function
    function getUsersList() {
        GetUsers().then((res) => {
            if (res.data?.users) {
                let users = res?.data.users?.map((item) => { return { id: item.id, name: `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}` } })
                const sortedOptions = moveSelectedToTop(users, 'name', filters.assignee ? filters.assignee : [])
                setSearchOptions(sortedOptions)
            } else {
                setSearchOptions([])
            }
        }).catch(() => {
            setSearchOptions([])
        })
    }

    useEffect(() => {
        getUsersList()
    }, [])

    // On Search Change function
    function onSearchChange(e) {
        setSearchText(e.target.value)
    }

    // On clear filter function
    function onClearFilter() {
        setFilters({ ...filters, assignee: [] })
        onReset('assignee')
        close()
        clearFilters && clearFilters()
        const sortedOptions = moveSelectedToTop(searchOptions, 'name', [])
        setSearchOptions(sortedOptions);
    }

    // On Filter function
    function onFilterHandler() {
        close()
        onFilter()
        confirm()
        const sortedOptions = moveSelectedToTop(searchOptions, 'name', filters.assignee ? filters.assignee : [])
        setSearchOptions(sortedOptions);
    }

    // On Search Change function
    function onSelectHandler(e, item) {
        let checkedOpts = filters.assignee ? filters.assignee : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, assignee: checkedOpts })
    }

    // Search api call
    useEffect(() => {
        if (searchText) {
            getSearchOptions(searchText).then((data) => {
                if (data) { setSearchOptions(data) }
            })
        } else {
            setSearchOptions([])
        }
    }, [searchText]);

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={searchOptions}
            selectedOptions={filters.assignee}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
        // <DropDown
        //     placeholder={"Search Assignee"}
        //     onSearchChange={onSearchChange}
        //     onSelectChange={onSelectHandler}
        //     searchText={searchText}
        //     options={searchOptions}
        //     selectedOptions={filters.assignee}
        //     clearFilters={clearFilters}
        //     close={close}
        //     onOk={onFilterHandler}
        //     onReset={onClearFilter}
        // />
    )
}
