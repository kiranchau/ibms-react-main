/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Outlet, useNavigate } from 'react-router-dom';

import Sidebar from "../commonModules/Sidebar";
import useAuth from "../hooks/use-auth";
import GlobalSearchContextProvider from "../contexts/GlobalSearchContext";

const Rootlayout = (props) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    let isAuth = isAuthenticated()
    if (!isAuth) {
      navigate("/")
    }
  }, [])

  return (
    <>
      <GlobalSearchContextProvider>
        <div style={{ position: 'relative' }}>
          <Sidebar />
        </div>
        <Outlet />
      </GlobalSearchContextProvider>
    </>
  );
};

export default Rootlayout;
