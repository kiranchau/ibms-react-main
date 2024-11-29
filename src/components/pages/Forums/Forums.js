import React, { useState } from 'react';
import '../../SCSS/forums.scss'
import ForumTable from './ForumTable';
import AddCust from '../../popups/custpops/AddCust';
import Button from '../../commonModules/UI/Button';
import * as FaIcons from "react-icons/fa6";

const Forums = () => {
  const [popUps, setPopUps] = useState(false);
  
//   return (
//     <div className="PageContent forumspage">
//     <div className='fullheightTable'>
//     <ForumTable />
//     </div>
//   </div>
//   )
// }
return (
  <div className="PageContent custpage">
  <div className='mx-3 mt-2 settingPage'>
      <div className="header px-3 py-1 d-flex justify-content-between">
        <div><span className='pe-2'>
        <FaIcons.FaBriefcase />
        </span>
          Forums</div>
          <Button className="headBtn" ><FaIcons.FaPlus  style={{marginTop: "-3px"}} /> Add Forums</Button>
      </div>

      <div className='h-100'>
      <ForumTable />
    
        {/* <div className='bottomBar'>
        <BottomBar handlePageClick={handlePageClick} pageCount={pageCount} totalPages={totalPages}/>
        </div> */}
      </div>
    </div>
    <div className={`${popUps ? "centerpopups" : "nocenterpopups"}`}>
      <AddCust
        onClick={() => setPopUps(!popUps)}
      />

      <div className="blurBg"></div>
    </div>
  </div>
)
}

export default Forums;
