import React from 'react';
import '../../SCSS/message.scss';

const Message = (props) => {
    return (
        <div className='msgBody'>
            <div className='d-flex justify-content-between align-items-center'>
                <div className='sender'>{props.sender}</div>
                <div className='postDate'>{props.postdate}</div>
            </div>
            <div className='description'>{props.description}</div>
            <div className='d-flex align-items-center postfoot'>
                <div className='msgButton'>ALL USERS</div>
                <div className='msgButton'>EDIT</div>
                <div className='msgButton'>REPLY</div>
            </div>
            {props.children}
        </div>
    );
}

export default Message;