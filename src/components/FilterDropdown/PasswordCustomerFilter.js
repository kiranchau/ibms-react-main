/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */

import React, { useEffect, useState } from 'react';

import DropDown from './DropDown';
import { moveSelectedToTop } from '../../Utils/helpers';

export default function PasswordCustomerFilter({ confirm, clearFilters, close, filters, setFilters, onFilter, onReset, allOptions }) {
    const [searchText, setSearchText] = useState("")
    const [searchOptions, setSearchOptions] = useState([])
    const [message, setMessage] = useState("Enter at least 3 characters to search.")

    // On Search Change function
    function onSearchChange(e) {
        setSearchText(e.target.value)
    }

    // On clear filter function
    function onClearFilter() {
        setSearchText("")
        setSearchOptions(allOptions)
        setFilters({ ...filters, customer_id: [] })
        onReset('customer_id')
        close()
        clearFilters && clearFilters()
        const sortedOptions = moveSelectedToTop(searchOptions, 'name', [])
        setSearchOptions(sortedOptions);
    }

    // On Filter function
    function onFilterHandler() {
        confirm()
        onFilter("customer_id")
        close()
        const sortedOptions = moveSelectedToTop(searchOptions, 'name', filters.customer_id ? filters.customer_id : [])
        setSearchOptions(sortedOptions);
    }

    // On Search Change function
    function onSelectHandler(e, item) {
        let checkedOpts = filters?.customer_id ? filters?.customer_id : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, customer_id: checkedOpts })
    }

    useEffect(() => {
        let opts = allOptions ? allOptions : []
        if (searchText.length > 0) {
            let filteredCustomer = opts?.filter((item) => { return item?.name?.toLowerCase().includes(searchText.trim()?.toLowerCase()) })
            if (filteredCustomer?.length == 0) {
                setMessage("No Result")
            } else {
                setMessage("")
            }
            const sortedOptions = moveSelectedToTop(filteredCustomer, 'name', filters.customer_id ? filters.customer_id : [])
            setSearchOptions(sortedOptions)
        } else {
            setMessage("")
            const sortedOptions = moveSelectedToTop(opts, 'name', filters.customer_id ? filters.customer_id : [])
            setSearchOptions(sortedOptions)
        }
    }, [searchText]);

    return (
        <DropDown
            placeholder={"Search Customer"}
            onSearchChange={onSearchChange}
            onSelectChange={onSelectHandler}
            searchText={searchText}
            options={searchOptions}
            selectedOptions={filters?.customer_id}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
            addTip={false}
            message={message}
        />
    )
}
