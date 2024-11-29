/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
export default function JobCodeFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset, options }) {
    // On clear filter function
    function onClearFilter() {
        setFilters({ ...filters, type_id: [] })
        onReset('type_id')
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
        let checkedOpts = filters.type_id ? filters.type_id : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, type_id: checkedOpts })
    }
    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={options}
            selectedOptions={filters.type_id}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
