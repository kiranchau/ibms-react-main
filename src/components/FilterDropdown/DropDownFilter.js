import React from 'react'

import { Button, Space, Checkbox } from 'antd';

const DropDownFilter = ({ options, onSelectChange, selectedOptions, close, clearFilters, onOk, onReset }) => {
    return (
        (
            <div
                style={{ padding: 8 }}
                className='d-flex flex-column'
                onKeyDown={(e) => e.stopPropagation()}
            >
                {options?.length > 0 ? <Space direction="vertical">
                    {options.map((item) => {
                        let name = item.name ? item.name : `${item?.first_name ? item?.first_name : ""} ${item?.last_name ? item?.last_name : ""}`.trim()
                        return <Checkbox
                            key={`${item.id}`}
                            onChange={(e) => onSelectChange(e, item)}
                            checked={selectedOptions?.includes(item.id)}
                        >{name}</Checkbox>;
                    })}
                </Space> : <Space direction="vertical" className='ps-2 mb-2'>No Result</Space>}
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

export default DropDownFilter