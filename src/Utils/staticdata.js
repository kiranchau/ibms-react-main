export const jobStatuses = [
    { id: "2", name: "In Progress" },
    { id: "9", name: "Needs Invoicing" },
    { id: "5", name: "Agency Fees Invoiced NOT PAID" },
    { id: "6", name: "Total Amount Invoiced NOT PAID" },
    { id: "7", name: "PAID and Ready to Run" },
    { id: "8", name: "Agency Fees Paid" },
    { id: "3", name: "Overdue" },
    { id: "4", name: "Completed" },
]

export const billingTypes = [
    { id: "1", name: "Task Billing" },
    { id: "2", name: "Completed Job Billing" },
    { id: "3", name: "Lump Sum / Non Hourly Billing" },
    { id: "4", name: "House Billing / No Charge" },
]

export const billingTypesTwo = [
    { id: "1", name: "Task Billing" },
    { id: "2", name: "Completed Job Billing" },
    { id: "3", name: "Lump Sum / Non Hourly Billing" },
    { id: "4", name: "House Billing / No Charge" },
    { id: "5", name: "Pre-Paid Hours" },
    { id: "6", name: "Bill as you go" },
]

export const billStatus = [
    { id: "0", name: "Unpaid" },
    { id: "2", name: "Paid" },
    { id: "1", name: "Partially Paid" }
]

export const cardTypes = [
    { id: "1", name: "American Express" },
    { id: "2", name: "Bank of America" },
    { id: "3", name: "Capital One" },
    { id: "4", name: "Chase" },
    { id: "5", name: "Citibank" },
    { id: "6", name: "Discover" },
    { id: "7", name: "MasterCard" },
    { id: "8", name: "PNC" },
    { id: "9", name: "Visa" },
    { id: "0", name: "Other" },
]

export const taskStatus = [
    { value: '1', name: 'To do', label: 'To do', id: "1" },
    { value: '2', name: 'In Progress', label: 'In Progress', id: "2" },
    { value: '4', name: 'Review', label: 'Review', id: "4" },
    { value: '3', name: 'Done', label: 'Done', id: "3" },
];

export const notificationStatus = [
    { name: 'Unadressed', id: "1" },
    { name: 'High Importance', id: "2" },
    { name: 'Addressed', id: "3" },
];

export const reqStatuses = [
    { id: "11", name: "Request Sent" },
    { id: "12", name: "Pending Clarification" },
    { id: "13", name: "Jobs Not Started" },
    { id: "14", name: "Jobs Started" },
    { id: "15", name: "Jobs Completed" }
]

export const customerPermissions = ["Tasks", "Client Job Requests"]

export const adminPermissions = ["Dashboard", "Customers", "Jobs", "Tasks", "CollabHub", "Notifications", "Billings", "Settings", "Users", "Reports", "Passwords", "Customer Credit Cards", "Customer Service Rates", "Client Job Requests"]

export const recurrenceFrequency = [
    { id: "30", name: "Monthly" },
    { id: "60", name: "Bi-Monthly" },
    { id: "90", name: "Quarterly" },
    { id: "183", name: "Semi-Annually" },
    { id: "365", name: "Annually" },
]

export const userStatus = [
    { id: "1", name: "Active" },
    { id: "2", name: "Inactive" },
]

export const customerReviewOptions = [
    { id: "1", name: "In Customer Review" },
    { id: "0", name: "Not In Customer Review" }
]

export const billingFrequency = [
    { id: "1", name: "Per Week" },
    { id: "2", name: "Per Month" },
    { id: "3", name: "Unlimited" },
]

export const clientJobRequestStatus = [
    { id: "11", name: "Request Sent" },
    { id: "12", name: "Pending Clarification" },
    { id: "16", name: "Job Not Moving Forward" },
]

export const clientJobStatuses = [
    { id: "11", name: "Request Sent" },
    { id: "12", name: "Pending Clarification" },
    { id: "13", name: "Jobs Not Started" },
    { id: "14", name: "Jobs Started" },
    { id: "15", name: "Jobs Completed" },
    { id: "16", name: "Job Not Moving Forward" },
]

export const billedStatus = [
    { id: "1", name: "Yes" },
    { id: "0", name: "No" },
]

export const paidStatus = [
    { id: "1", name: "Yes" },
    { id: "0", name: "No" },
]

export const jobDocExtentions = []
export const jobActivityDocExtentions = []
export const taskActivityDocExtentions = []
export const custDocExtentions = ["pdf", "docx", "doc", "xls", "xlsx", "csv", "png", "jpg", "gif", "jpeg", "webp"]
export const logoImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp']