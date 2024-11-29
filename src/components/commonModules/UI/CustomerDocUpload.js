/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable eqeqeq */
import React from 'react';
import { Upload } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FaDownload } from "react-icons/fa6";
import { MdCloudUpload } from "react-icons/md";
import IMAGE from "../../../images/ImageDefault.png"
import { getIconPath } from '../../../Utils/helpers';

const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const fileExt = ['pdf', 'doc', 'docx', 'ppt', 'pptx', "txt", "csv", "xls", "xlsx", "mp4", "eps", "ai"]

const renderIcon = (file) => {
  let fileType = file.type?.split("/")[0]
  const fileExtension = file.name.split('.').pop().toLowerCase()
  if (file.status == "done" && imageExt.includes(fileExtension)) {
    return <img src={file?.url ? file?.url : IMAGE} />
  } else if (file.status == "done" && fileExt.includes(fileExtension)) {
    return <img src={`/static/icons/${getIconPath(file.name)}`} />
  } else if ((file.status == "uploading" || file.status == "error") && fileType != "image") {
    return <img src={`/static/icons/${getIconPath(file.name)}`} />
  } else {
    return <img src={IMAGE} />
  }
}

const CustomerDocUpload = (props) => {
  const handleRemove = (file) => {
    props.handleRemove(file)
  };

  const handleDownload = (file) => {
    props.handleDownload(file)
  };

  const customItemRender = (originNode, file, fileList) => {
    return (
      <div className={`custom-file-item ${file.status == "error" ? "file-error" : ""}`}>
        <div className="custom-file-info">
          <div className='d-flex align-items-center upload-file-name'>
            <span className="custom-img-thumb" onClick={() => handleDownload(file)}>
              {renderIcon(file)}
            </span>
            {originNode}
          </div>
          <div className='d-flex gap-4'>
            <span className="custom-icon" onClick={() => handleRemove(file)}>
              <DeleteOutlined />
            </span>
            <span className="custom-icon" onClick={() => handleDownload(file)}>
              <FaDownload />
            </span>
          </div>
        </div>
        {(file.status == "error" && file?.error?.message) && <span className='file-error-text'>{file?.error?.message}</span>}
      </div>
    );
  };

  return (
    <Upload.Dragger
      multiple={props.multiple ? props.multiple : false}
      customRequest={props.customRequest}
      fileList={props.fileList}
      itemRender={customItemRender}
      style={{ background: 'white' }}
      onChange={props.onChange}
      accept={props.accept ? props.accept : ""}
    >
      <p className="ant-upload-drag-icon">
        <MdCloudUpload />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
    </Upload.Dragger>
  );
};

export default CustomerDocUpload;
