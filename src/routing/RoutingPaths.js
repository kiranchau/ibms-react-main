import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../components/pages/Login";
import "../App.scss";
import Rootlayout from "../components/pages/Rootlayout";
import Customers from "../components/pages/Customers/Customers";
import Settings from "../components/pages/Settings/Settings";
import Bill from "../components/pages/Bill/Bill";
import Dashboard from "../components/pages/Dashboard/Dashboard";
import Users from "../components/pages/Users/Users";
import ErrorPage from "../components/pages/Error";

import { checkAuthLoader, tokenLoader } from "../API/authCurd";
import ForumsLayout from "../components/pages/Forums/ForumsLayout";
import Reports from "../components/pages/Report/Reports";
import Notification from "../components/pages/Notification/NotificatonPage";
import ForgotPassword from "../components/pages/ForgotPassword";
import ResetPassword from "../components/pages/ResetPassword";
import ResponsiveTable from "../components/commonModules/UI/ResponsiveTable";
import Password from "../components/pages/Password/PasswordPage";
import ClientJobRequest from "../components/pages/ClientJobRequest/ClientJobRequest";
import JobPage from "../components/pages/Jobs/JobPage";
import TaskPage from "../components/pages/Task/TaskPage";

const router = createBrowserRouter([
  {
    index: true,
    path: "/", element: <Login />,
    errorElement: <ErrorPage />,
    loader: tokenLoader,
  },
  { path: "/forgotpassword", element: <ForgotPassword />, },
  { path: "/resetpassword", element: <ResetPassword />, },
  {
    path: "",
    element: <Rootlayout />,
    id: 'root',
    loader: tokenLoader,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      { path: "/jobs", element: <JobPage />, },
      { path: "/settings", element: <Settings />,},
      { path: "/bill", element: <Bill />, loader: checkAuthLoader },
      { path: "/tasks", element: <TaskPage />, },
      { path: "/users", element: <Users />, },
      { path: "/forums", element: <ForumsLayout />, },
      { path: "/reports", element: <Reports />, },
      { path: "/notifications", element: <Notification />, },
      { path: "/passwords", element: <Password />, },
      { path: "/table", element: <ResponsiveTable />, },
      { path: "/clientjobrequest", element: <ClientJobRequest />, },
    ],
  },
]);

function routesArray() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default routesArray;
