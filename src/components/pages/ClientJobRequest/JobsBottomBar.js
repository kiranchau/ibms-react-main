import React, { useState, useEffect } from 'react'
import Button from '../../commonModules/UI/Button'
import ReactPaginate from 'react-paginate'

const JobsBottomBar = (props) => {
  const [totalPages, setTotalPages] = useState(0);
  
  const totalItems = 32; // Total number of items in your dataset
  
  useEffect(() => { 
    const totalPagesCount = Math.ceil(totalItems / 10);
    setTotalPages(totalPagesCount);
  }, []);
  return (
    <div className='p-3 d-flex align-items-center justify-content-between btmwidth'>
      <Button className='btmbtn' onClick={props.onClick}>+Add Job</Button>
      <div className='d-flex'>
    <ReactPaginate
      previousLabel={"previous"}
      nextLabel={"next"}
      breakLabel={"..."}
      pageCount={totalPages}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
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
      <div>page</div>
    </div>
  )
}

export default JobsBottomBar;