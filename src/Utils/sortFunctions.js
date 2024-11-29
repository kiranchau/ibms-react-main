import moment from 'moment'

export function sortByString(nestedFields) {
    return (a, b) => {
        const getField = (obj, fields) => {
            return fields.reduce((acc, field) => (acc && acc[field] !== undefined ? acc[field] : undefined), obj);
        };
        const valueA = String(getField(a, nestedFields)).toUpperCase();
        const valueB = String(getField(b, nestedFields)).toUpperCase();
        if (valueA < valueB) { return -1 }
        if (valueA > valueB) { return 1 }
        return 0
    }
}

export function sortByNumber(nestedFields) {
    return (a, b) => {
        const getField = (obj, fields) => {
            return fields.reduce((acc, field) => (acc && acc[field] !== undefined ? acc[field] : undefined), obj);
        };
        const valueA = Number(getField(a, nestedFields));
        const valueB = Number(getField(b, nestedFields));
        if (valueA < valueB) { return -1 }
        if (valueA > valueB) { return 1 }
        return 0
    }
}


export function sortByDate(nestedFields) {
    return (a, b) => {
        const getField = (obj, fields) => {
            return fields.reduce((acc, field) => (acc && acc[field] !== undefined ? acc[field] : undefined), obj);
        };
        const dateA = new Date(getField(a, nestedFields));
        const dateB = new Date(getField(b, nestedFields));
        if (dateA < dateB) { return -1 }
        if (dateA > dateB) { return 1 }
        return 0
    }
}

export function sortByConcatenatedString(dataArray, keysArray, order = 'asc') {
    return dataArray.sort((a, b) => {
        // const concatenateKeys = (obj, keys) => keys.map(key => obj[key] || '').join(' ')?.trim();
        const concatenateKeys = (obj, keys) => keys.map(key => (obj[key] || '').toString().toLowerCase()).join(' ')?.trim();

        const aValue = concatenateKeys(a, keysArray);
        const bValue = concatenateKeys(b, keysArray);

        let comparison = 0;

        if (aValue < bValue) {
            comparison = -1;
        } else if (aValue > bValue) {
            comparison = 1;
        }

        return order === 'desc' ? comparison * -1 : comparison;
    });
}

export function sortObjectsByAttribute(objects, attribute = "name") {
    if (objects) {
        return objects.sort((a, b) => {
            const valA = a[attribute]?.toString()?.toLowerCase();
            const valB = b[attribute]?.toString()?.toLowerCase();
            if (valA < valB) {
                return -1;
            }
            if (valA > valB) {
                return 1;
            }
            return 0;
        });
    } else {
        return []
    }
}

export function sortByDateTime(nestedFields) {
    return (a, b) => {
        const getField = (obj, fields) => {
            return fields.reduce((acc, field) => (acc && acc[field] !== undefined ? acc[field] : undefined), obj);
        };
        
        const parseDateTime = (dateTimeStr) => {
            return dateTimeStr ? moment(dateTimeStr).toDate() : null;
        };

        const dateTimeA = parseDateTime(getField(a, nestedFields));
        const dateTimeB = parseDateTime(getField(b, nestedFields));

        if (dateTimeA == null && dateTimeB == null) { return 0; }
        if (dateTimeA == null || dateTimeA === undefined) { return 1; }
        if (dateTimeB == null || dateTimeB === undefined) { return -1; }
        
        if (dateTimeA < dateTimeB) { return -1; }
        if (dateTimeA > dateTimeB) { return 1; }
        return 0;
    };
}