import { IoIosCloseCircle } from "react-icons/io";
import Button from './Button';

export function confirmDelete(modelName) {
    const isConfirm = window.confirm(`Are you sure you want to delete this ${modelName ? modelName : ""}?`)
    return isConfirm
}

export function confirmWindow(msg) {
    const isConfirm = window.confirm(msg)
    return isConfirm
}

export function WarningDialog({ okClick, noClick, title, description }) {
    return (<div className={`centerpopups bill-modal`}>
        <div className='centerpopups'>
            <div className='popups d-flex justify-content-center align-items-center w-100'>
                <div className='addpopups customer-doc-popup'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>{title}</div>
                        <div className='myIcon' type='button' onClick={noClick}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3 customer-body'>
                        <p>{description}</p>
                    </div>
                    <div className='mt-auto popfoot w-100 p-2'>
                        <div className='d-flex align-items-center justify-content-center'>
                            <Button type="button" className="mx-4 cclBtn" onClick={noClick}>No</Button>
                            <Button type="button" onClick={okClick}>Yes</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="blurBg"></div>
        </div>
    </div>)
}