import React from 'react';
import '../../SCSS/popups.scss';
import * as MdIcons from 'react-icons/md';
import Button from '../../commonModules/UI/Button';
import Taskspopcol1 from './Taskspopcol1';
import Taskspopcol2 from './Taskspopcol2';

const Taskspop = (props) => {



  return (
    <div className='popups tasksPops d-flex align-items-baseline flex-column'>
      <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
        <div>Task: ImageBloom, Inc. - UserNames not displaying consistently</div>
        <div className='myIcon' type="button" onClick={props.onClick}><MdIcons.MdOutlineClose /></div>
      </div>
      <div className='popBody'>
        <Taskspopcol1 />
       <Taskspopcol2 />
      </div>
      <div className='mt-auto popfoot w-100 p-2'>
        <div className='d-flex align-items-center justify-content-center'>
          <Button className="mx-4 cclBtn">Cancel</Button>
          <Button>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default Taskspop;
