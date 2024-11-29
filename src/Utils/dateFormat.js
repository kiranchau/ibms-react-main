/* eslint-disable eqeqeq */
import moment from "moment";
import dayjs from "dayjs"
import 'dayjs/locale/en';


export function convertDateFormat(inputDate, type) {
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (inputDate) {
        if (dateRegex.test(inputDate)) {
            return inputDate;
        }
        const parts = inputDate.split('/');
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')} 00:00:00`;
    } else {
        return null
    }
}

export function convertDateFormatTwo(date) {
    if (date) {
        const inputDate = new Date(date)
        const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const day = inputDate.getDate().toString().padStart(2, '0');
        const year = inputDate.getFullYear();

        const formattedDate = `${month}/${day}/${year}`;
        return formattedDate
    } else {
        return null
    }
}

export function getCurrentDate() {
    const currentDate = new Date();

    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const year = currentDate.getFullYear();

    return `${month}/${day}/${year}`;
}

export function getPreviousDate(dateCount = 1) {
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - dateCount);

    const month = String(previousDate.getMonth() + 1).padStart(2, '0');
    const day = String(previousDate.getDate()).padStart(2, '0');
    const year = previousDate.getFullYear();

    return `${month}/${day}/${year}`;
}

export function getDateByOffset(offset = 0) {
    const currentDate = dayjs();

    if (offset == 0) {
        return currentDate;
    } else {
        const modifiedDate = currentDate.add(offset, 'day');
        return modifiedDate;
    }
};

export function parseDateTimeString(date, type) {
    if (type == 1) {
        // October 2, 2023 at 9:02 AM
        return moment(date).format("MMMM D, YYYY [at] h:mm A")
    }
    if (type == 2) {
        // October 2, 2023
        return moment(date).format("MMMM D, YYYY")
    }
    if (type == 3) {
        // Oct 2, 2023
        return moment(date).format("MMM D, YYYY")
    }
    if (type == 4) {
        // ... time ago
        return moment(date).fromNow()
    }
    if (type === 5) {
        // 2024-01-08
        return moment(date).format("YYYY-MM-DD");
    }
    if (type == 6) {
        // 01/08/2024
        return moment(date).format("MM/DD/YYYY");
    }
    if (type == 7) {
        // DEC 6, 2018 08:16 PM
        return moment(date).format("MMM D, YYYY hh:mm A");
    }
    if (type == 8) {
        // 01-08-2024
        return moment(date).format("MM-DD-YYYY");
    }
    if (type == 9) {
        // 07:28 am
        return moment(date, "HH:mm:ss").format("hh:mm A");
    }
    if (type == 10) {
        // Convert UTC Time to Local
        return moment.utc(date, "HH:mm:ss").local().format("hh:mm A");
    }
    if (type == 11) {
        // October 2, 2023 9:02 AM
        return moment(date).format("MMMM D, YYYY h:mm A")
    }
    if (type == 12) {
        // 01/08/2024 9:02 AM
        return moment(date).format("MM/DD/YYYY h:mm A");
    }
    if (type == 13) {
        return moment(date, "HH:mm:ss").format("hh:mm A");
    }
    return date
}

export function isOverdue(dueDate) {
    const currentDate = moment();
    const providedDueDate = moment(dueDate, 'MM/DD/YYYY');
    return providedDueDate.isBefore(currentDate, 'day');
}

export function convertToHHMMSS(timeValue) {
    if (timeValue) {
        const parsedTime = moment(timeValue, 'hh:mm A');
        const formattedTime = parsedTime.format('HH:mm:ss');
        return formattedTime;
    } else {
        return null
    }
}

export function calculateDuration(startTime, endTime) {
    const startMoment = startTime ? moment(startTime, 'hh:mm A') : null;
    const endMoment = endTime ? moment(endTime, 'hh:mm A') : null;

    if (!startMoment && !endMoment) {
        return '00:00:00';
    }

    let durationMinutes;
    if (startMoment && endMoment) {
        durationMinutes = endMoment.diff(startMoment, 'minutes');
    } else if (startMoment) {
        durationMinutes = moment().diff(startMoment, 'minutes');
    } else if (endMoment) {
        durationMinutes = endMoment.diff(moment(), 'minutes');
    }

    if (durationMinutes < 0) {
        return '00:00:00';
    }

    const roundedDurationMinutes = Math.ceil(durationMinutes / 5) * 5;

    const hours = Math.floor(roundedDurationMinutes / 60);
    const minutes = roundedDurationMinutes % 60;
    const seconds = 0;

    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedDuration;
}

export function convertToUTC(time) {
    if (time) {
        const parsedTime = moment(time, 'HH:mm:ss');
        const utcTime = parsedTime.utc().format('HH:mm:ss');
        return utcTime;
    } else {
        return null
    }
}

export function calculateTimeDifference(startDate, startTime, endDate, endTime) {
    // const combinedStartDateTime = moment(startDate, "YYYY-MM-DD HH:mm:ss").add(moment.duration(startTime));
    // const combinedEndDateTime = moment(endDate, "YYYY-MM-DD HH:mm:ss").add(moment.duration(endTime));

    const combinedStartDateTime = moment(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss");
    const combinedEndDateTime = moment(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm:ss");

    const durationInSeconds = combinedEndDateTime.diff(combinedStartDateTime, 'seconds');

    if (durationInSeconds < 0) {
        return '00:00:00';
    }

    const roundedDurationMinutes = Math.ceil(durationInSeconds / 300) * 5; // Rounding to the nearest 5 minutes

    const hours = Math.floor(roundedDurationMinutes / 60);
    const minutes = roundedDurationMinutes % 60;
    const seconds = 0;

    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function calculateTimeDuration(startDate, startTime, endDate, endTime) {
    if (!startDate || !startTime || !endDate || !endTime) {
        return "00:00:00";
    }

    const combinedStartDateTime = moment(`${startDate} ${startTime}`, "MM/DD/YYYY hh:mm A");
    const combinedEndDateTime = moment(`${endDate} ${endTime}`, "MM/DD/YYYY hh:mm A");

    if (!combinedStartDateTime.isValid() || !combinedEndDateTime.isValid()) {
        return "00:00:00";
    }

    if (combinedStartDateTime.isAfter(combinedEndDateTime)) {
        return '00:00:00';
    }

    let durationMinutes = combinedEndDateTime.diff(combinedStartDateTime, 'minutes');

    if (durationMinutes < 0) {
        return '00:00:00';
    }

    const roundedDurationMinutes = Math.ceil(durationMinutes / 5) * 5;

    const hours = Math.floor(roundedDurationMinutes / 60);
    const minutes = roundedDurationMinutes % 60;
    const seconds = 0;

    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function convertDateToLocal(dt) {
    if (dt) {
        const inputDate = moment.utc(dt);
        let localTime = inputDate.local();
        return localTime.format("YYYY-MM-DD HH:mm:ss");
    } else {
        return null
    }
}

export function convertDateToUTC(inputDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (inputDate) {
        if (dateRegex.test(inputDate)) {
            const momentDate = moment(inputDate, "YYYY-MM-DD HH:mm:ss");
            const utcDate = momentDate.utc();
            return utcDate.format("YYYY-MM-DD HH:mm:ss");
        } else {
            return null
        }
    } else {
        return null
    }
}

export function convertAndSplitDateTime(startDate, startTime) {
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (startDate && startTime) {
        const extractedDate = startDate.split(' ')[0];
        const combinedDateTime = `${extractedDate} ${startTime}`;

        if (dateRegex.test(combinedDateTime)) {
            const momentDateTime = moment.utc(combinedDateTime, "YYYY-MM-DD HH:mm:ss");
            const localDateTime = momentDateTime.local();
            const localDate = localDateTime.format("YYYY-MM-DD");
            const localTime = localDateTime.format("HH:mm:ss");
            return { localDate, localTime };
        } else {
            return null
        }
    } else {
        return null
    }
}

export function convertToLocalUTC(dt, tm) {
    let dateTimeString = dt + " " + tm;
    let localDateTime = moment(dateTimeString, "MM/DD/YYYY h:mm A");

    let utcDateTime = localDateTime.utc();

    let dateFormatted = utcDateTime.format("YYYY-MM-DD");

    let timeFormatted = utcDateTime.format("HH:mm:ss");

    return {
        date: dateFormatted,
        time: timeFormatted
    };
}