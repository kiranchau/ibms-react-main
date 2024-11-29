import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

import '../../SCSS/popups.scss';

const Audittrail = (props) => {
    const [auditTrails, setAuditTrails] = useState([])

    useEffect(() => {
        if (props?.selectedJobForAuditTrail?.audit_trails) {
            setAuditTrails(props?.selectedJobForAuditTrail.audit_trails)
        } else {
            setAuditTrails([])
        }
    }, [props.selectedJobForAuditTrail])

    // Close button Handler 
    const closeButtonHandler = () => {
        props.onClick()
    }

    return (
        <form noValidate>
            <div className='popups d-flex justify-content-center align-items-center audit-trail-popup'>
                <div className='addpopups'>
                    <div className='mb-auto pophead d-flex align-items-center justify-content-between'>
                        <div>Audit Trail</div>
                        <div className='myIcon' type='button' onClick={closeButtonHandler}>
                            <IoIosCloseCircle style={{ width: '28px' }} />
                        </div>
                    </div>
                    <div className='popBody p-3'>
                        <div className='audit-container'>
                            {auditTrails.length > 0 ? auditTrails.map((audit) => {
                                return <div className='audit-row' key={audit.job_audit_trail_id} dangerouslySetInnerHTML={{ __html: audit.content }}></div>
                            }) :
                                <div className='not-found-wrap mt-2'>
                                    <h5 className='mt-2 text-center'>Audit Trail Not Found</h5>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Audittrail;
