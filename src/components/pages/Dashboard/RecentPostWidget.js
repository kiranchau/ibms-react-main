/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import IMAGE from "../../../images/Login/Login.png"
import * as MdIcons from 'react-icons/md';
export const RecentPostWidget = () => {
  return (
    <div className='recent-post-widget widget-container '>
        <div className='header'>
            <div className='header-content'>
            <MdIcons.MdForum />
                <h4>Recent Posts</h4>
            </div>
        </div>
        <div className='inner-widget  slide-wrap'>
            <div className='widget-card'>
                <div className='user-info'>
                    <div className='user-profile'>
                        SA
                    </div>
                    <div className='user-name-category'>
                       <h5> Shubham Argade</h5>
                       <p>Digital Marketing</p>
                       
                    </div>
                    <p className='post-time'>February 23, 2024</p>
                </div>
                <div className='post-content'>
                    <p>Clinical Trial Case <a href=''> @Guru</a></p>
                </div>
                <div className='post-image'>
                    <img src={IMAGE}/>
                </div>
            </div>
            <div className='widget-card'>
                <div className='user-info'>
                    <div className='user-profile'>
                        SA
                    </div>
                    <div className='user-name-category'>
                       <h5> Shubham Argade</h5>
                       <p>Digital Marketing</p>
                       
                    </div>
                    <p className='post-time'>February 23, 2024</p>
                </div>
                <div className='post-content'>
                    <p>Clinical Trial Case <a href=''> @Guru</a></p>
                </div>
                <div className='post-image'>
                    <img src={IMAGE}/>
                </div>
            </div>
           
        </div>  
    </div>
  )
}
