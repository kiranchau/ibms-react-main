/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
import { reqStatuses } from '../../Utils/staticdata';

export default function ReqStatusFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    // On clear filter function
    function onClearFilter() {
        // setSearchText("")
        setFilters({ ...filters, request_status: [] })
        onReset('request_status')
        close()
        clearFilters && clearFilters()
    }

    // On Filter function
    function onFilterHandler() {
        close()
        onFilter()
        confirm()
    }

    // On Search Change function
    function onSelectHandler(e, item) {
        let checkedOpts = filters.request_status ? filters.request_status : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, request_status: checkedOpts })
    }

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={reqStatuses}
            selectedOptions={filters.request_status}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
