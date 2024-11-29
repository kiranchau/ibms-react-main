/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
import { billedStatus } from '../../Utils/staticdata';

export default function BilledFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    // On clear filter function
    function onClearFilter() {
        // setSearchText("")
        setFilters({ ...filters, is_billed: [] })
        onReset('is_billed')
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
        let checkedOpts = filters.is_billed ? filters.is_billed : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, is_billed: checkedOpts })
    }

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={billedStatus}
            selectedOptions={filters.is_billed}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
