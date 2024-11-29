import React, { useEffect, useState } from 'react'
import Button from '../../commonModules/UI/Button'
import SqButton from '../../commonModules/UI/SqButton'
import ReactPaginate from 'react-paginate'
// import { getCustPage } from '../../../API/authCurd'

const BottomBar = (props) => {
  const [totalPages, setTotalPages] = useState(0);

  const totalItems = 32; // Total number of items in your dataset

  useEffect(() => {
    const totalPagesCount = Math.ceil(totalItems / 10);
    setTotalPages(totalPagesCount);
  }, []);

  return (
    <div className='p-3 d-flex align-items-center justify-content-center btmwidth'>
      <div className='d-flex'>
        <ReactPaginate
          previousLabel={"previous"}
          nextLabel={"next"}
          breakLabel={"..."}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={props.handlePageClick}
          containerClassName={"pagination justify-content-center"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          activeClassName={"active"}
        />
      </div>
    </div>
  )
}

export default BottomBar
