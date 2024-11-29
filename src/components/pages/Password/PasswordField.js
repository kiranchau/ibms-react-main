import React, { useState } from 'react'

import { hideText } from '../../../Utils/helpers'

const PasswordField = (props) => {
    const [showPass, setShowPass] = useState(false)

    // On Mouse Enter event handler to show password
    const onMouseEnterHandler = () => { setShowPass(true) }

    // On Mouse Leave event handler to hide password
    const onMouseLeaveHandler = () => { setShowPass(false) }

    return (
        <div onMouseEnter={onMouseEnterHandler} onMouseLeave={onMouseLeaveHandler}>{showPass ? props?.record.password : hideText(props?.record.password)}</div>
    )
}

export default PasswordField