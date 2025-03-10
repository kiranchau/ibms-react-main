/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
import { billStatus } from '../../Utils/staticdata';

export default function BillStatusFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    // On clear filter function
    function onClearFilter() {
        // setSearchText("")
        setFilters({ ...filters, status: [] })
        onReset('status')
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
        let checkedOpts = filters.status ? filters.status : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, status: checkedOpts })
    }

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={billStatus}
            selectedOptions={filters.status}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
