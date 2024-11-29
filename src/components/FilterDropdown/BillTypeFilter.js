/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
import { billingTypes, billingTypesTwo } from '../../Utils/staticdata';

export default function BillTypeFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    // On clear filter function
    function onClearFilter() {
        // setSearchText("")
        setFilters({ ...filters, billing_type: [] })
        onReset('billing_type')
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
        let checkedOpts = filters.billing_type ? filters.billing_type : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, billing_type: checkedOpts })
    }

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={billingTypesTwo}
            selectedOptions={filters.billing_type}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
