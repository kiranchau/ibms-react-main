/* eslint-disable no-unused-vars */
import axios from "axios"
import { redirect } from "react-router-dom"
import axiosIntance from "../Utils/BaseUrl"
export const baseurl = process.env.REACT_APP_BACKEND_URL
export const loginUrl = '/api/login'
export const addCustUrl = '/api/customer'
export const getCustUrl = '/api/customer'
export const getCustPagePage = '/api/customer?per_page=10'
export const addJobUrl = '/api/project'
export const getJobUrl = '/api/project'
export const deletJobUrl = '/api/project'
export const getJobPage = '/api/project?per_page=10'
export const addTaskUrl = '/api/task'
export const getTaskUrl = '/api/task'
export const deletTaskUrl = '/api/task'
export const getTaskPage = '/api/task?per_page=10'
export const countryUrl = '/api/auth/forgotpasswordSentMail';
export const createDeviceInfoUrl = ``;
export const updateCustomerUrl = '/api/customer';
export const updatejobUrl = '/api/project';
export const updatetaskUrl = '/api/task';
export const AddUsersList = '/api/user'
export const GetUsersList = '/api/user'
export const GetJobList = '/api/user'
export const postFireBaseToken = '/api/save-token'
export const User_Notification_Count_URL = '/api/nofitications'
export const getAssignedUsers = '/api/user-with-dept'
export const postAssignedUsers = '/api/task_assigned_users'
export const updateAssignedUsers = '/api/update-task-status'
export const postDuplicateTask = '/api/duplicate-task'

export function postDuplicateTaskData(payload) {
  return axiosIntance.post(baseurl + postDuplicateTask, payload)
}

export function getAuthToken() {
  const token = localStorage.getItem('token');
  return token;
}


export function createDeviceInfo(data) {
  return axios.post(baseurl + createDeviceInfoUrl, data)
}

export function getCountries() {
  return axios.get(baseurl + countryUrl)
}

export function login(Email, Password) {
  // let Password = CryptoJS.AES.encrypt(Password_, 'dynamisch-secret').toString();
  const data = {
    email: Email,
    password: Password,
    isMobileLogin: "false"
  }
  //let baseurl = sessionStorage.getItem("end_point")
  return axios.post(baseurl + loginUrl, data)
}

export function formatError(errorResponse) {
  switch (errorResponse.error.message) {
    case 'Email_Exist': return 'Email already exists';

    default: return '';
  }
}

const token = localStorage.getItem('token')

export const config1 = {

  // let jwttoken = localStorage.getItem('jwttoken'),
  headers: {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'ngrok-skip-browser-warning': 'true'

  },
}

// FireBase Token=================
export function firebaseToken(reqFirebase) {
  const data = reqFirebase
  return axiosIntance.post(baseurl + postFireBaseToken, data, config1)
}

export function NotificationCount() {
  return axiosIntance.get(baseurl + User_Notification_Count_URL)
}
// CUST=================
export function addCust(addCust) {
  const data = addCust
  return axiosIntance.post(baseurl + addCustUrl, data)
}
export function getAllCust(getCust) {
  const data = getCust
  return axiosIntance.get(baseurl + getCustUrl, config1)
}

export function getCust(isActive = 1) {
  let url = getCustUrl
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url)
}

export function getCustPage(currentPage) {
  return axiosIntance.get(baseurl + getCustPagePage + ` &page=${currentPage}`, config1)
}
// =========================

export function addJob(data) {
  return axiosIntance.post(addJobUrl, data)
}
export function getJob(getCust) {
  const data = getCust
  return axiosIntance.get(baseurl + getJobUrl)
}
export function deleteJob(id) {
  return axiosIntance.delete(baseurl + getJobUrl + `/${id}`)
}
export function getjobPage(perPage, pageNum, searchParams){
  return axiosIntance.get(`/api/project?per_page=${perPage}&page=${pageNum}&search=${searchParams}&is_draft=${false}`)
}
export function getCientRequestJobPage(perPage, pageNum, searchParams){
  return axiosIntance.get(`/api/project?per_page=${perPage}&page=${pageNum}&search=${searchParams}&is_draft=${true}`)
}

export function addTask(data) {
  return axiosIntance.post(addTaskUrl, data)
}

export function getTask(getTaskData) {
  const data = getTaskData
  return axiosIntance.get(baseurl + getTaskUrl)
}
export function deleteTask(id) {
  return axiosIntance.delete(baseurl + getTaskUrl + `/${id}`)
}
export function gettaskPage(currentPage) {
  return axiosIntance.get(baseurl + getTaskPage + ` &page=${currentPage}`, config1)
}

// ==========Update
export function updateCustomer(data, id) {
  return axiosIntance.patch(baseurl + updateCustomerUrl + `/${id}`, data)
}
export function updateJob(data, id) {
  return axiosIntance.patch(baseurl + updatejobUrl + `/${id}`, data)
}
export function updatetask(data, id) {
  return axiosIntance.patch(baseurl + updatetaskUrl + `/${id}`, data)
}
export function updatetaskCallEntry(data, id) {
  return axiosIntance.patch(`/api/update-call-entry-log/${id}`, data)
}

// Client Job Section
export function addNewClientJobRequest(data) {
  return axiosIntance.post(`/api/add-client-job-request`, data)
}

export function updateClientJobRequest(data, id) {
  return axiosIntance.patch(`/api/update-client-job-request/${id}`, data)
}

export function convertClientJobRequest(data, id) {
  return axiosIntance.patch(`api/convert-client-job-request/${id}`, data)
}

export function tokenLoader() {
  return getAuthToken();
}

export function checkAuthLoader() {
  const token = getAuthToken();

  if (!token) {
    return redirect("/");
  }
  return null;
}

// Fetch Jobs
export function fetchJobs(id) {
  return axiosIntance.get(`/api/customer/${id}/jobs/`)
}
// Fetch user type
export function fetchUserType(formDataWithUserType) {
  return axiosIntance.get('/api/master/user_type',formDataWithUserType)
}

// Fetch Job Codes
export function fetchJobCodes() {
  return axiosIntance.get('/api/master/job_codes')
}
// Delete Job Codes
export function deleteJobCode(id) {
  return axiosIntance.delete(`/api/master/job_codes/${id}`)
}
// Fetch Service types
export function fetchServiceTypes() {
  return axiosIntance.get('/api/master/service_types')
}
// Delete Service types
export function deleteServiceType(id) {
  return axiosIntance.delete(`/api/master/service_types/${id}`)
}
// Fetch Payment terms
export function fetchPaymentTerms() {
  return axiosIntance.get('/api/master/payment_terms')
}
// Fetch Client status
export function fetchClientStatus() {
  return axiosIntance.get('/api/master/client_status')
}
// Delete Client status
export function deleteClientStatus(id) {
  return axiosIntance.delete(`/api/master/client_status/${id}`)
}
// Fetch Forum topic categories
export function fetchForumTopicCategories() {
  return axiosIntance.get('/api/master/forum_topic_categories')
}
// Delete Forum topic categories
export function deleteForumTopicCategory(id) {
  return axiosIntance.delete(`/api/master/forum_topic_categories/${id}`)
}
// Fetch Departments
export function fetchDepartments() {
  return axiosIntance.get('/api/master/departments')
}
// Delete Departments
export function deleteDepartment(id) {
  return axiosIntance.delete(`/api/master/departments/${id}`)
}

export function postDepartments() {
  return axiosIntance.post('/api/master/departments')
}
// Fetch Countries
export function fetchCountries() {
  return axiosIntance.get('/api/master/countries')
}
// Fetch States
export function fetchStates() {
  return axiosIntance.get('/api/master/states')
}
// Fetch Cities
export function fetchCities() {
  return axiosIntance.get('/api/master/cities')
}
// Add Master data
export function addMasterData(data) {
  return axiosIntance.post('/api/master', data)
}
// Update Master data
export function updateMasterData(data, id) {
  return axiosIntance.patch(`/api/master/${id}`, data)
}
// Fetch users with type
export function fecthUsersWithType(userTypeId, isActive = 1) {
  let url = `/api/user-with-type/${userTypeId}`
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url)
}
// Fetch activity notes
export function fetchActivityNotes() {
  return axiosIntance.get(`/api/activity_notes`)
}
// Delete activity note
export function deleteActivityNotes(id) {
  return axiosIntance.delete(`/api/activity_notes/${id}`)
}
// Fetch activity notes by task id
export function fetchActivityNotesByTaskId(id) {
  return axiosIntance.get(`/api/task-activities/${id}`)
}
// Fetch activity notes by job id
export function fetchActivityNotesByJobId(id) {
  return axiosIntance.get(`/api/job-activities/${id}`)
}
// Add activity notes
export function getActivityNotesUsersDepartment(isActive = 0) {
  let url = `/api/user-with-dept`
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url)
}
// Add activity notes
export function addActivityNotes(data) {
  return axiosIntance.post(`/api/activity_notes/`, data)
}
// Update activity notes
export function updateActivityNotes(id, data) {
  return axiosIntance.patch(`/api/activity_notes/${id}`, data)
}
// Get hot posts
export function fetchHotPosts() {
  return axiosIntance.get(`/api/hot-posts`)
}
// Get forum posts
export function fetchForumPosts() {
  return axiosIntance.get(`/api/post`)
}
// Get forum posts
export function fetchForumPostsForLazyLoad(perPage, page, searchParams) {
  return axiosIntance.get(`/api/post?per_page=${perPage}&page=${page}&search=${searchParams}`)
}
// Get forum posts by id
export function fetchForumPostsById(id) {
  return axiosIntance.get(`/api/post/${id}`)
}
// Add forum post
export function addForumPost(data) {
  return axiosIntance.post(`/api/post`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
}
// Update forum post
export function updateForumPost(id, data) {
  return axiosIntance.patch(`/api/post/${id}`, data)
}
// Update forum post pin
export function updateForumPostPin(id, data) {
  return axiosIntance.patch(`/api/update-pin/${id}`, data)
}
// Delete forum post
export function deleteForumPost(id) {
  return axiosIntance.delete(`/api/post/${id}`)
}

// Get Comments
export function fetchComments(id) {
  return axiosIntance.get(`/api/comments?post_id=${id}`)
}

// Add post comment
export function addComment(data) {
  return axiosIntance.post(`/api/comments`, data)
}

// edit post comment
export function editComment(id, data) {
  return axiosIntance.patch(`/api/comments/${id}`, data)
}

// delete post comment
export function deleteComment(id) {
  return axiosIntance.delete(`/api/comments/${id}`)
}

// Get user Details
export function getUserDetails(id) {
  return axiosIntance.get(`/api/user-details`)
}

// Add like
export function addReaction(data) {
  return axiosIntance.post(`/api/reactions`, data)
}
// Update like
export function updateReaction(id, data) {
  return axiosIntance.patch(`/api/reactions/${id}`, data)
}

// Dashboard
export function fetchDashboardData() {
  return axiosIntance.get(`/api/dashboard`)
}

// Delete Dashboard notifications
export function deleteNotifications() {
  return axiosIntance.delete(`/api/delete-nofitications`)
}

// Generate user activity report
export function generateUserActivityReport(data) {
  return axiosIntance.post(`/api/reports/useractivityreport`, data)
}

// Generate user activity report
export function generateReport(reportType, data) {
  return axiosIntance.post(`/api/reports/${reportType}`, data, { responseType: "blob" })
}

// fetch customer pagination
export function fetchCustomerPagination(perPage, pageNum){
  return axiosIntance.get(`/api/customer?per_page=${perPage}&page=${pageNum}`)
}

// fetch task pagination
export function fetchTaskPagination(perPage, pageNum, searchParams) {
  return axiosIntance.get(`/api/task?per_page=${perPage}&page=${pageNum}&search=${searchParams}`)
}

// fetch billable excel export
export function fetchExcelExport() {
  return axiosIntance.get(`/api/billing-export`, { responseType: "blob" })
}

// fetch billable items
export function fetchBillableItems() {
  return axiosIntance.get(`/api/billable-items`)
}

// fetch billable items pagination 
export function fetchBillableItemsPagination(perPage, pageNum, searchParams, isExport = 0) {
  return axiosIntance.get(`/api/billable-items?per_page=${perPage}&page=${pageNum}&search=${searchParams}&is_export=${isExport}`)
}

// fetch billable items pagination 
export function fetchBillableItemsPaginationTotal(perPage, pageNum, searchParams, isExport = 0) {
  return axiosIntance.get(`/api/billable-items?per_page=${perPage}&page=${pageNum}&search=${searchParams}&is_export=${isExport}`)
}

// fetch billable items pagination 
export function fetchBillableItemsPaginationExport(perPage, pageNum, searchParams, isExport = 0) {
  return axiosIntance.get(`/api/billable-items?per_page=${perPage}&page=${pageNum}&search=${searchParams}&is_export=${isExport}`, { responseType: "blob" })
}

// fetch customer billable items 
export function fetchCustomerBillItems(isExport = 0) {
  return axiosIntance.get(`/api/customer-bills?is_export=${isExport}`)
}
// fetch customer billable items 
export function fetchCustomerBillItemsExport(isExport = 0, searchParams) {
  return axiosIntance.get(`/api/customer-bills?search=${searchParams}&is_export=${isExport}`, { responseType: "blob" })
}
// fetch customer billable items pagination 
export function fetchCustomerBillItemsPagination(perPage, pageNum) {
  return axiosIntance.get(`/api/customer-bills?per_page=${perPage}&page=${pageNum}`)
}

// delete customer billable items
export function deleteCustomerBillItems(id) {
  return axiosIntance.delete(`/api/customer-bills/${id}`)
}

// add customer billable items
export function addCustomerBillItems(data) {
  return axiosIntance.post(`/api/customer-bills`, data)
}

// Get selected items total
export function getSelectedItemsTotal(data) {
  return axiosIntance.post(`/api/show-selected-total`, data)
}

// Upload Client Logo
export function uploadClientLogo(data, config) {
  return axiosIntance.post(`/api/upload/customer-logo`, data, config)
}

// Remove Client Logo
export function removeClientLogo(customerId) {
  return axiosIntance.patch(`/api/remove-customer-logo/${customerId}`)
}

// get customer credit cards
export function fetchCustomerCreditCards(customerId) {
  return axiosIntance.get(`/api/customer-credit-cards?customer_id=${customerId}`)
}

// add customer credit card
export function addCustomerCreditCard(data) {
  return axiosIntance.post(`/api/customer-credit-cards`, data)
}

// update customer credit card
export function updateCustomerCreditCard(id, data) {
  return axiosIntance.patch(`/api/customer-credit-cards/${id}`, data)
}

// Delete customer credit card
export function deleteCustomerCreditCard(id) {
  return axiosIntance.delete(`/api/customer-credit-cards/${id}`)
}

// get customer service rates
export function fetchCustomerServiceRates(customerId) {
  return axiosIntance.get(`/api/customer-service-type?customer_id=${customerId}`)
}

// add customer service types
export function addCustomerServiceType(data) {
  return axiosIntance.post(`/api/customer-service-type`, data)
}

// update customer service types
export function updateCustomerServiceType(id, data) {
  return axiosIntance.patch(`/api/customer-service-type/${id}`, data)
}

// get customer users
export function fetchCustomerUsers(isActive = 0) {
  let url = `/api/customer-users`
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url)
}

// get customer contacts
export function fetchCustomerContacts(customerId) {
  return axiosIntance.get(`/api/customer-contacts?customer_id=${customerId}`)
}

// add customer contacts
export function addCustomerContact(data) {
  return axiosIntance.post(`/api/customer-contacts`, data)
}

// update customer contacts
export function updateCustomerContact(id, data) {
  return axiosIntance.patch(`/api/customer-contacts/${id}`, data)
}

// update customer contacts
export function deleteCustomerContact(id) {
  return axiosIntance.delete(`/api/customer-contacts/${id}`)
}

// Get notifications
export function getNotifications() {
  return axiosIntance.get(`/api/nofitications`)
}

// Update notification read flag
export function updateNotificationReadFlag(notification_id, data) {
  return axiosIntance.patch(`/api/update-notification-read-flag/${notification_id}`, data)
}

// Forget password
export function forgetPassword(data) {
  return axiosIntance.post(`/api/forgot-password`, data)
}

// reset password
export function resetPassword(data, token) {
  return axiosIntance.post(`api/reset-password/${token}`, data)
}

// set password
export function setPassword(data) {
  return axiosIntance.post("/api/user/set-password", data)
}

// Get Document
export function fetchDocument(id) {
  return axiosIntance.get(`/api/customer-documents?customer_id=${id}`)
}

// Add Document
export function uploadDocument(data, config) {
  return axiosIntance.post(`/api/customer-documents`, data, config)
}

// Add Job Document
export function uploadJobDocument(data, config) {
  return axiosIntance.post(`/api/upload-documents`, data, config)
}

// Delete Document
export function deleteDocument(id) {
  return axiosIntance.delete(`/api/customer-documents/${id}`)
}

// Delete Job Document
export function deleteJobDocument(id) {
  return axiosIntance.delete(`/api/documents/${id}`)
}

// Add Task Document
export function uploadTaskDocument(data, config) {
  return axiosIntance.post(`/api/upload-task-documents`, data, config)
}

// Add Task Activity Document
export function uploadTaskActivityDocument(data, config) {
  return axiosIntance.post(`/api/upload-task-activity-documents`, data, config)
}

// Add Job Activity Document
export function uploadJobActivityDocument(data, config) {
  return axiosIntance.post(`/api/upload-job-activity-documents`, data, config)
}

// Delete Task Document
export function deleteTaskDocument(id) {
  return axiosIntance.delete(`/api/documents/${id}`)
}

// Delete Attachment
export function deletePostAttachment(id) {
  return axiosIntance.delete(`/api/photos/${id}`)
}

// Delete Task Activity Document
export function deleteTaskActivityDocument(id) {
  return axiosIntance.delete(`/api/documents/${id}`)
}

// Get User notifications
export function getUserNotifications() {
  return axiosIntance.get(`/api/user-notifications`)
}

// Get User notifications
export function getUserNotificationsPagination(perPage, pageNum, searchParams) {
  return axiosIntance.get(`/api/user-notifications?per_page=${perPage}&page=${pageNum}&search=${searchParams}`)
}

// Update User notifications
export function updateUserNotifications(id, data) {
  return axiosIntance.patch(`/api/user-notifications/${id}`, data)
}

// Get customer password
export function getCustomerPasswords() {
  return axiosIntance.get(`/api/customer-passwords`)
}

// Delete customer password
export function deleteCustomerPassword(id) {
  return axiosIntance.delete(`/api/customer-passwords/${id}`)
}

// Get customer password
export function getCustomerPasswordPagination(perPage, pageNum) {
  return axiosIntance.get(`/api/customer-passwords?per_page=${perPage}&page=${pageNum}`)
}

// Add customer password
export function addCustomerPassword(data) {
  return axiosIntance.post(`/api/customer-passwords`, data)
}

// Update customer password
export function updateCustomerPassword(id, data) {
  return axiosIntance.patch(`/api/customer-passwords/${id}`, data)
}

// Get customer by id
export function getSingleCustomer(id) {
  return axiosIntance.get(`/api/get_customers/${id}`)
}

// Get task by id
export function getSingleTask(id) {
  return axiosIntance.get(`/api/task/${id}`)
}

// Get job by id
export function getSingleJob(id) {
  return axiosIntance.get(`/api/project/${id}`)
}

// Get Tasks for call log
export function fetchTasksForCallLog(id) {
  return axiosIntance.get(`/api/job-tasks/${id}`)
}

// Start call Log
export function startCallLog(data) {
  return axiosIntance.post(`/api/call-entry-log`, data)
}

// End call Log
export function endCallLog(id) {
  return axiosIntance.patch(`/api/call-entry-log/${id}`)
}

// =================USERS
export function AddUsers(addUsers) {
  const data = addUsers
  return axiosIntance.post(baseurl + AddUsersList, data)
}

export function updateUsers(data, id) {
  return axiosIntance.patch(AddUsersList + `/${id}`, data)
}
export function GetUsers(isActive = 1) {
  let url = `/api/user`
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url)
}
export function GetAllUsers() {
  return axiosIntance.get(baseurl + GetUsersList, config1)
}

// Get users list pagination
export function getUsersPagination(perPage, pageNum) {
  return axiosIntance.get(`/api/user?per_page=${perPage}&page=${pageNum}`)
}

// Get permission list
export function fetchPermissions() {
  return axiosIntance.get(`/api/all-permissions`)
}

// Update customer bill
export function updateCustomerBill(id, data) {
  return axiosIntance.patch(`api/customer-bills/${id}`, data)
}

// Generate customer bill
export function generateCustomerBill(id) {
  return axiosIntance.get(`/api/billing-report?customer_bill_id=${id}`, { responseType: "blob" })
}

// Update task being worked on
export function updateTaskBeingWorkedOn(id, data) {
  return axiosIntance.patch(`/api/update-task-worked-on/${id}`, data)
}

// Get user Document
export function getUserDocument(user_id) {
  return axiosIntance.get(`api/user-documents?user_id=${user_id}`)
}

// Upload user Document
export function uploadUserDocument(data, config) {
  return axiosIntance.post(`/api/user-documents`, data, config)
}

// Delete user Document
export function deleteUserDocument(id) {
  return axiosIntance.delete(`api/user-documents/${id}`)
}

// Delete user
export function deleteUserData(id) {
  return axiosIntance.delete(`api/user/${id}`)
}

// Get audit trail 
export function getAuditTrailByJobId(id) {
  return axiosIntance.get(`/api/job-audit-trail/${id}`)
}

export function GetJob(getJobList) {
  const data = getJobList
  return axiosIntance.get(baseurl + GetUsersList, config1)
}

export function getCustomerDropdown(searchTerm, cancelToken, isActive) {
  let url = `/api/customers/${searchTerm}`
  if (isActive) {
    url = `${url}?is_active=${isActive}`
  }
  return axiosIntance.get(url, {
    cancelToken: cancelToken
  })
}

export function getJobDropdown(searchTerm, customer_id, cancelToken) {
  return axiosIntance.get(`/api/jobs/${searchTerm}?customer_id=${JSON.stringify(customer_id)}`, {
    cancelToken: cancelToken
  })
}

export function getTaskDropdown(searchTerm, job_id, customer_id, cancelToken) {
  return axiosIntance.get(`/api/tasks/${searchTerm}?job_id=${JSON.stringify(job_id)}&customer_id=${JSON.stringify(customer_id)}`, {
    cancelToken: cancelToken
  })
}

export function getUserDropdown(searchTerm, cancelToken) {
  return axiosIntance.get(`/api/users/${searchTerm}`, {
    cancelToken: cancelToken
  })
}

export const sendDataToBackendNewApi = (data) => {
  // Example: Simulate a POST request to the backend
  return axios.post('https://jsonplaceholder.typicode.com/posts', data);
};

// ======================================================
export function GetAssignedUserData(assignedList) {
  const data = assignedList
  return axiosIntance.get(baseurl + getAssignedUsers, config1)
}

export function postAssignedUserData(payload) {
  return axiosIntance.post(baseurl + postAssignedUsers,payload)
}

export function markAssignUserCompleted(payload, id) {
  return axiosIntance.patch(`/api/update_task_assigned_users_complete_date/${id}`, payload)
}

export function updateAssignedUserData(payload, id) {
  return axiosIntance.patch(`/api/task_assigned_users/${id}`, payload)
}

export function patchAssignedUserData(id,payload) {
  return axiosIntance.patch(baseurl + updateAssignedUsers+ `/${id}`,payload)
}

// Update forum post
export function patchCustomerReview(id, data) {
  return axiosIntance.patch(`/api/toggle-customer-review/${id}`, data)
}


// Delete assigned user
export function deleteAssignedUser(id) {
  return axiosIntance.delete(`/api/task_assigned_users/${id}`)
}

// Update user last active time
export function updateUserLastActiveTime() {
  return axiosIntance.patch(`/api/updateUserLastActiveTime`)
}

// Update exclaimation mark
export function updateExclaimationMark(data) {
  return axiosIntance.patch(`/api/ping-api`, data)
}
