/* eslint-disable eqeqeq */
import * as yup from 'yup';
import moment from "moment";

export async function validateFormData(schema, formData) {
    try {
        await schema.validate(formData, { abortEarly: false });
        const result = {
            isvalid: true,
            data: formData
        }
        return Promise.resolve(result);
    } catch (validationError) {
        const errors = validationError.inner.map((error) => ({
            field: error.path,
            message: error.message,
        }));
        const errorsObject = errors.reduce((acc, error) => {
            acc[error.field] = error.message;
            return acc;
        }, {});
        return Promise.reject(errorsObject);
    }
};

export const customerSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Please enter valid Email.').required('Email is required.'),
    status: yup.string().required('Status is required.'),
    // country: yup.string().required('Country is required'),
    website: yup.string()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .nullable()
        .matches(
            /^(https?:\/\/)?(www\.)?([\w.]+)\.([a-z]{2,})(\/[\w .-]*)*\/?$/i,
            'Please enter a valid Website.'
        ),
    phone: yup.string().test('phone', 'Phone must be 10 digits', function (value) {
        if (!value || value.trim() === '') return true; // Return true if empty or null
        return /^\d{10}$/.test(value); // Check if phone number is 10 digits
    }).nullable(),
})

export const jobSchema = yup.object().shape({
    customer: yup.string().required('Client is required'),
    type: yup.string().required('Job code is required.'),
    name: yup.string().required('Job Name is required.'),
    billing_type: yup.string().required('Billing is required.'),
    assigned_user_id: yup.string().required('Responsible user is required.'),
    priority: yup.string().required('Priority is required.'),
    status: yup.string().required('Status is required.'),
    job_amount: yup
        .string()
        .nullable()
        .when('billing_type', (billingType, schema) => {
            if (billingType == '3') {
                return schema.required('Amount is required').matches(/^\d{1,6}(\.\d{1,2})?$/, 'Maximum 6 digits allowed with up to 2 decimal places');
            }
            return schema;
        }),
    projected_hours: yup
        .string()
        .nullable()
        .test({
            name: 'isRequired',
            message: 'Projected Hours are required',
            test: function(value) {
                const billingType = this.parent.billing_type;
                const jobType = this.parent.type;
                
                if ((billingType == '3' || billingType == '4') && jobType != '6') {
                    return !!value;
                }
                return true;
            }
        })
})

export const clientJobSchema = yup.object().shape({
    customer: yup.string().required('Client is required'),
    name: yup.string().required('Job Name is required.')
})

export const conversionSchema = yup.object().shape({
    type: yup.string()
        .required('Job code is required.')
        .test('is-not-zero-or-empty', 'Job code is required.', function (value) {
            return value != '0' && value.trim() != '';
        }),
    billing_type: yup.string().required('Billing is required.'),
    job_amount: yup
        .string()
        .nullable()
        .when('billing_type', (billingType, schema) => {
            if (billingType == '3') {
                return schema.required('Amount is required').matches(/^\d{1,6}(\.\d{1,2})?$/, 'Maximum 6 digits allowed with up to 2 decimal places');
            }
            return schema;
        }),
    projected_hours: yup
        .string()
        .nullable()
        .test({
            name: 'isRequired',
            message: 'Projected Hours are required',
            test: function (value) {
                const billingType = this.parent.billing_type;
                const jobType = this.parent.type;

                if ((billingType == '3' || billingType == '4') && jobType != '6') {
                    return !!value;
                }
                return true;
            }
        })
})

export const taskSchema = yup.object().shape({
    customer: yup.string().required('Client is required'),
    project: yup.string().required('Job is required.'),
    name: yup.string().required('Task name is required.'),
    service_type: yup.string().required('Service type is required.'),
    priority: yup.string().required('Priority is required.'),
})

export const forumSchema = yup.object().shape({
    post_title: yup.string().required('Title is required'),
    // description: yup.string().required('Post is required'),
    description: yup.string()
        .test('description-validation', 'Post is required', function (value) {
            if (!value || value.trim() === '<p><br></p>') {
                return false;
            }
            const regexPattern = /<p>\s+<\/p>/;
            return !regexPattern.test(value);
        })
        .required('Post is required'),
    category_id: yup.string().required('Category is required.'),
})

export const creditCardSchema = yup.object().shape({
    credit_card_no: yup.string().trim()
        .min(16, "Minimum 16 digit required")
        .max(16, "Maximum 16 digit required")
        .matches(/^[0-9\b]+$/, "Invalid Card number !")
        .required('Card number is required.'),
    exp_month_year: yup.string().required('Expiry month/year is required.'),
    cvv: yup.string().required('CVC is required.'),
    name_on_card: yup.string().required('Name is required.'),
    address: yup.string().required('Street name is required.'),
    country: yup.string().required('Country is required.'),
    city: yup.string().required('City is required.'),
    state: yup.string().required('State is required.'),
    zip_code: yup.string().required('Zipcode is required.'),
})

export const contactSchema = yup.object().shape({
    first_name: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid first name').required('First name is required'),
    last_name: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid last name').required('Last name is required.'),
    email: yup.string().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Please enter valid Email.').required('Email is required.'),
    title: yup.string().test('title', 'Invalid title', function (value) {
        if (!value || value.trim() === '') return true;
        return !/\d/.test(value);
    }).nullable(),
    phone: yup.string().test('phone', 'Phone must be 10 digits', function (value) {
        if (!value || value.trim() === '') return true; // Return true if empty or null
        return /^\d{10}$/.test(value); // Check if phone number is 10 digits
    }).nullable(),
});

export const serviceRateSchema = yup.object().shape({
    // service_name: yup.string().required('Service name is required'),
    // default_rate: yup.string().required('Rate is required.'),
    default_rate: yup.number()
        .required('Default rate is required.')
        .min(0, 'Rate must be at least zero.')
        .typeError('Rate must be a valid positive number.')
        .test('is-valid-rate', 'Maximum 6 digits allowed with up to 2 decimal places', function (value) {
            if (value) {
                const stringValue = String(value);
                return /^[0-9]{1,6}(\.[0-9]{1,2})?$/.test(stringValue);
            };
        })
})

export const forgotPasswordSchema = yup.object().shape({
    // email: yup.string().trim().email("Enter valid email format").required("Email is required"),
    email: yup.string().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Please enter valid Email.').required('Email is required.'),
})

export const resetPasswordSchema = yup.object().shape({
    password: yup.string()
        .trim()
        .min(8, "Minimum 8 characters required")
        .max(25, "Maximum 16 characters allowed")
        .required("Password is required")
        .matches(
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*?([^\w\s]|[_]))(?!.* ).{8,}$/,
            "Must contain 8 characters, 1 uppercase, 1 lowercase, 1 number, and one special character."
        ),
    confirmPassword: yup.string()
        .trim()
        .required("Confirm Password is required")
        .oneOf([yup.ref('password'), null], "Password and Confirm Password didn't match")
})

export const jobCodeMasterSchema = yup.object().shape({
    name: yup.string().trim().required("Job Code is required")
})

export const clientStatusMasterSchema = yup.object().shape({
    name: yup.string().trim().required("Client Status is required")
})

export const departmentMasterSchema = yup.object().shape({
    name: yup.string().trim().required("Department Name is required"),
    abbreviation: yup.string().trim().required("Abbreviation is required")
})

export const forumCategoryMasterSchema = yup.object().shape({
    name: yup.string().trim().required("Forums Category is required"),
})

export const serviceTypeMasterSchema = yup.object().shape({
    name: yup.string().trim().required("Service Type is required"),
    // default_rate: yup.string().trim().required("Rate is required"),
    default_rate: yup.number()
        .required('Default rate is required.')
        .min(0, 'Rate must be at least zero.')
        .typeError('Rate must be a valid positive number.')
        .test('is-valid-rate', 'Maximum 6 digits allowed with up to 2 decimal places', function (value) {
            if (value) {
                const stringValue = String(value);
                return /^[0-9]{1,6}(\.[0-9]{1,2})?$/.test(stringValue);
            };
        })
})

export const customerPasswordSchema = yup.object().shape({
    customer_id: yup.string().required('Cutsomer is required'),
    email: yup.string().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Please enter valid Email.').required('Email is required.'),
    password: yup.string().trim().required("Password is required"),
    url: yup.string().required("URL is required").matches(
        /^(https?:\/\/)?(www\.)?([\w.]+)\.([a-z]{2,})(\/[\w .-]*)*\/?$/i,
        'Please enter a valid URL'
    )
})

export const userSchema = yup.object().shape({
    first_name: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid first name').required('First name is required'),
    last_name: yup.string().matches(/^[A-Za-z\s]+$/, 'Invalid last name').required('Last name is required'),
    email: yup.string().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Please enter valid Email.').required('Email is required.'),
    status: yup.string().required('Status is required.'),
    phone_no: yup.string().test('phone_no', 'Phone must be 10 digits', function (value) {
        if (!value || value.trim() === '') return true;
        return /^\d{10}$/.test(value);
    }).nullable(),
})

export const customerBillSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
})

export const generateBillSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
})

export const timeTrackingReportSchema = yup.object().shape({
    start_date: yup.string().required('Start Date is required'),
    end_date: yup.string().required('End Date is required'),
})

export const workloadReportSchema = yup.object().shape({
    start_date: yup.string().required('Start Date is required'),
    end_date: yup.string().required('End Date is required'),
})

export const completedTaskReportSchema = yup.object().shape({
    start_date: yup.string().required('Start Date is required'),
    end_date: yup.string().required('End Date is required'),
})

export const userActivityReportSchema = yup.object().shape({
    start_date: yup.string().required('Start Date is required'),
    end_date: yup.string().required('End Date is required'),
})

export const projectHourlyReportSchema = yup.object().shape({
    start_date: yup.string().required('Start Date is required'),
    end_date: yup.string().required('End Date is required'),
})

export const callTimeEntrySchema = yup.object().shape({
    start_date: yup.date().required('Start date is required'),
    stop_date: yup.date().required('Stop date is required'),
    start_time: yup.string().required('Start time is required'),
    end_time: yup.string().required('Stop time is required'),
}).test('is-greater', 'Stop date time should be greater than start date time', function (values) {
    const { start_date, stop_date, start_time, end_time } = values;

    if (start_date && stop_date && start_time && end_time) {
        const startDate = moment(start_date, 'MM/DD/YYYY');
        const startTime = moment(start_time, 'hh:mm A');
        const stopDate = moment(stop_date, 'MM/DD/YYYY');
        const endTime = moment(end_time, 'hh:mm A');

        const startDateTime = startDate.clone().set({
            'hour': startTime.get('hour'),
            'minute': startTime.get('minute'),
            'second': startTime.get('second')
        });
        const endDateTime = stopDate.clone().set({
            'hour': endTime.get('hour'),
            'minute': endTime.get('minute'),
            'second': endTime.get('second')
        });

        if (startDateTime >= endDateTime) {
            return this.createError({
                path: 'date_time_validation',
                message: 'Stop date time should be greater than start date time'
            });
        }
    }
    return true;
});