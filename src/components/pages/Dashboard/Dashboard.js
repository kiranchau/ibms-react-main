/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "../../SCSS/dashboard.scss";
import Dashcol2 from "./Dashcol2";
import Dashcol3 from "./Dashcol3";
import Dashcol4 from "./Dashcol4";
import { fetchDashboardData } from "../../../API/authCurd";
import { RecentNotesWidget } from "./RecentNotesWidget";
import { RecentPostWidget } from "./RecentPostWidget";
import { DueTaskWidget } from "./DueTaskWidget";
import RecentPostCarousel from "./RecentPostCarousel";
import { useNavigate } from 'react-router-dom';
import TaskContextProvider from "../../contexts/TaskContext";
import CustomerContextProvider from "../../contexts/CustomerContext";
import JobContextProvider from "../../contexts/JobContext";
import ActivityNotesContextProvider from "../../contexts/ActivityNotesContext";

const Dashboard = (props) => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getDashboardData(isLoader = true) {
    if (isLoader) {
      setLoading(true)
    }
    fetchDashboardData().then((res) => {
      setLoading(false)
      if (res.data) {
        setDashboardData(res.data)
      }
    }).catch(() => {
      setLoading(false)
      setDashboardData(null)
    })
  }

  useEffect(() => {
    let usertype = localStorage.getItem("usertype")
    if (usertype == 3) {
      navigate('/tasks');
    } else {
      getDashboardData()
    }
  }, [])

  return (
    // <div className="PageContent">
    //   <div className="mx-3 mt-2 dashboard-page">
    //     <div className="right-section">
    //       <Dashcol2 dashboardData={dashboardData} />
    //       <Dashcol4 dashboardData={dashboardData} loading={loading} getDashboardData={getDashboardData} />
    //     </div>
    //     <div className="left-section">
    //       <Dashcol3 dashboardData={dashboardData} />
    //     </div>
    //   </div>
    // </div>
    <div className="PageContent">
      <div className="dashboard-page">
        <CustomerContextProvider>
          <JobContextProvider>
            <TaskContextProvider>
            <ActivityNotesContextProvider>
              <Container fluid>
                <Row>
                  <Col lg={8}>
                    <div className="">
                      <RecentPostCarousel dashboardData={dashboardData} />
                    </div>
                    <div>
                      <DueTaskWidget dashboardData={dashboardData} getDashboardData={getDashboardData} />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <RecentNotesWidget dashboardData={dashboardData} />
                  </Col>
                </Row>
              </Container>
              </ActivityNotesContextProvider>
            </TaskContextProvider>
          </JobContextProvider>
        </CustomerContextProvider>
      </div>
    </div>
  );
};

export default Dashboard;
