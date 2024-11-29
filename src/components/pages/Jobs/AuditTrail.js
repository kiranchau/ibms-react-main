import React, { useEffect, useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

import '../../SCSS/popups.scss';
import { getAuditTrailByJobId } from '../../../API/authCurd';
import { parseDateTimeString } from '../../../Utils/dateFormat';

const Audittrail = (props) => {
    const [auditTrails, setAuditTrails] = useState([])

    // get jobs audit trail
    const getAuditTrails = (id) => {
        getAuditTrailByJobId(id).then((res) => {
            if (res.data?.JobAuditTrail) { setAuditTrails(res.data?.JobAuditTrail) }
        }).catch(() => { setAuditTrails([]) })
    }

    useEffect(() => {
        if (props?.selectedJobForAuditTrail?.id) {
            getAuditTrails(props?.selectedJobForAuditTrail?.id)
        } else {
            setAuditTrails([])
        }
    }, [props.selectedJobForAuditTrail])

    // Close button Handler 
    const closeButtonHandler = () => {
        setAuditTrails([])
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
                                return <div className='audit-row' key={audit.job_audit_trail_id}>
                                    <p><span>{audit?.first_name ? audit?.first_name : ""} {audit?.last_name ? audit?.last_name : ""}</span> changed status to {audit?.status ? audit?.status : ""} on {parseDateTimeString(audit.created_at ,12)}.</p>
                                </div>
                                // return <div className='audit-row' key={audit.job_audit_trail_id} dangerouslySetInnerHTML={{ __html: audit.content }}></div>
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
