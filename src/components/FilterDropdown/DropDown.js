import React from 'react'

import { Button, Input, Space, Checkbox } from 'antd';

const DropDown = ({ onSearchChange, searchText, placeholder, options, onSelectChange, selectedOptions, close, clearFilters, onOk, onReset, addTip, message }) => {
    return (
        (
            <div
                style={{ padding: 8 }}
                className='d-flex flex-column'
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    placeholder={placeholder}
                    value={searchText}
                    onChange={onSearchChange}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                {addTip && <p className='input-tip'>Enter at least 3 characters to search.</p>}
                {message && <p className='input-tip'>{message}</p>}
                {options?.length > 0 && <Space direction="vertical">
                    {options.map((item) => {
                        let name = item.name ? item.name : `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
                        return <Checkbox
                            key={`${item.id}`}
                            onChange={(e) => onSelectChange(e, item)}
                            checked={selectedOptions?.includes(item.id)}
                        >{name}</Checkbox>;
                    })}
                </Space>}
                <Space className=''>
                    <Button
                        size="small"
                        type='link'
                        onClick={onReset}
                    >
                        Reset
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        onClick={onOk}
                    >
                        Ok
                    </Button>
                </Space>
            </div>
        )
    )
}

export default DropDown