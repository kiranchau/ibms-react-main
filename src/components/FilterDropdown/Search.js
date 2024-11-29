import React from 'react'

import { Button, Input, Space } from 'antd';

const Search = ({ onSearchChange, searchText, placeholder, close, clearFilters, onOk, onReset }) => {
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

export default Search