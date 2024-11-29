/* eslint-disable eqeqeq */
import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';

const UploadFiles = (props) => {
  return <>
    <div className='mb-2'>Client Logo</div>
    <Upload
      listType="picture"
      fileList={props.fileList}
      onChange={props.onChange}
      customRequest={props.customRequest}
      accept={props.accept}
      beforeUpload={props.beforeUpload}
      onRemove={props.onRemove}
    >
      {props?.fileList?.length == 0 && <Button className='button btn-height' icon={<UploadOutlined />}>Upload</Button>}
    </Upload>
  </>
};
export default UploadFiles;