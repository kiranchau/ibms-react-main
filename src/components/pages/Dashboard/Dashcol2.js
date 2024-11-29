import React from "react";
import { Row } from "react-bootstrap";

import "../../SCSS/dashboard.scss";
import custLogo from "../../../images/Login/customer.png";
import jobsLogo from "../../../images/Login/jobs.png";
import taskLogo from "../../../images/Login/Task.png";
import { formatNumber } from "../../../Utils/helpers";

const Dashcol2 = ({ dashboardData }) => {
  return (
    <>
      <div className="d-flex align-items-end list-wrap">
        <div className="number-widget">
          <div className="d-flex align-items-center ">
            <div className="card-style">
              <div className="d-flex align-items-center px-4">
                <div ><img src={custLogo} alt="customer logo" width='100%' /></div>
                <div>
                  <div className="allCount">{formatNumber(dashboardData ? dashboardData.customers : 0)}</div>
                  <div className="countTitle">Customer</div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center ">
            <div className="card-style">
              <div className="d-flex align-items-center px-4">
                <div ><img src={jobsLogo} alt="jobs logo" width='100%' /></div>
                <div>
                  <div className="allCount">{formatNumber(dashboardData ? dashboardData.jobs : 0)}</div>
                  <div className="countTitle">Jobs</div>
                </div>
              </div>

            </div>
          </div>
          <Row>
            <div className="d-flex align-items-center ">
              <div className="card-style">
                <div className="d-flex align-items-center px-4">
                  <div ><img src={taskLogo} alt="customer logo" width='100%' /></div>
                  <div >
                    <div className="allCount">{formatNumber(dashboardData ? dashboardData.tasks : 0)}</div>
                    <div className="countTitle">Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Dashcol2;
