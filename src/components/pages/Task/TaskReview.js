import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

const TaskReview = (props) => {
  const [check, setCheck] = useState(false)

  useEffect(() => {
    setCheck(props.record.customer_review)
  }, [props.record])

  const onChangeHandler = () => {
    setCheck(!check)
    props.handleCheckboxChange(props.record.id)
  }

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input ms-auto"
        type="checkbox"
        role="switch"
        id={`flexSwitchCheckDefault-${props.record.id}`}
        checked={check}
        onClick={(e) => { e.stopPropagation() }}
        onChange={onChangeHandler}
      />
    </div>
  )
}

export default TaskReview
