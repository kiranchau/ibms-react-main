/* eslint-disable eqeqeq */

import React from 'react';

import DropDownFilter from './DropDownFilter';
import { customerReviewOptions } from '../../Utils/staticdata';

export default function BillStatusFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters, close, filters, setFilters, onFilter, onReset }) {
    // On clear filter function
    function onClearFilter() {
        // setSearchText("")
        setFilters({ ...filters, customer_review: [] })
        onReset('customer_review')
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
        let checkedOpts = filters.customer_review ? filters.customer_review : []
        if (checkedOpts.includes(item.id)) {
            checkedOpts = checkedOpts.filter((opt) => { return opt != item.id })
        } else {
            checkedOpts.push(item.id)
        }
        setFilters({ ...filters, customer_review: checkedOpts })
    }

    return (
        <DropDownFilter
            onSelectChange={onSelectHandler}
            options={customerReviewOptions}
            selectedOptions={filters.customer_review}
            clearFilters={clearFilters}
            close={close}
            onOk={onFilterHandler}
            onReset={onClearFilter}
        />
    )
}
