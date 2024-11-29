import { sortObjectsByAttribute } from "./sortFunctions";
import { customerPermissions } from "./staticdata";

/* eslint-disable eqeqeq */
export function getNumberBoolean(value) {
    return (value == "true" || value == true) ? 1 : 0
}

// export function getInitials(str) {
//     const arr = str.split(" ")
//     return `${arr[0][0]}${arr[arr.length - 1][0]}`.toUpperCase()
// }
export function getUserInitials(first_name, last_name) {
    return `${first_name ? first_name[0] : ""}${last_name ? last_name[0] : ""}`
}

export function getNameInitials(fname, lname) {
    return `${fname ? fname[0] : ""}${lname ? lname[0] : ""}`.toUpperCase()
}

export function getInitials(str) {
    const arr = str.split(" ");
    return `${arr[0][0]}${arr[arr.length - 1][0]}`.toUpperCase();
}

export function getUniqueValuesByKey(arr, key) {
    return arr?.reduce((uniqueObjects, item) => {
        const keyValue = item[key]?.id;
        const existingObject = uniqueObjects.find(obj => obj?.id === keyValue);

        if (!existingObject) { uniqueObjects.push(item[key]); }

        return uniqueObjects;
    }, []);
}

export function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result.split(',')[1]);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};

export function formatNumber(number) {
    const absNumber = Math.abs(number);

    if (absNumber >= 1e6) {
        // Millions
        return (number / 1e6).toFixed(1) + 'M';
    } else if (absNumber >= 1e3) {
        // Thousands
        return (number / 1e3).toFixed(1) + 'K';
    } else {
        return number.toString();
    }
}

export function uniqueArray(array) {
    return array.reduce((accumulator, currentValue) => {
        if (!accumulator.includes(currentValue)) {
            accumulator.push(currentValue);
        }
        return accumulator;
    }, [])
}

export function convertObject(obj) {
    const result = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && Array.isArray(obj[key]) && obj[key].length > 0) {
            result[key] = obj[key][0];
        }
    }

    return result;
}

export function isObjectNotEmpty(obj) {
    return Object.keys(obj).length > 0;
}

export function truncateText(text, maxLength) {
    if (text?.length > maxLength) {
        return text.substring(0, maxLength - 3) + '...';
    }
    return text;
}

export function calculatePageCount(totalCount, perPage) {
    return Math.ceil(totalCount / perPage);
}

export function calculateTotalCost(items, key) {
    return items.reduce((total, item) => {
        // Assuming the "cost" is a string, convert it to a float before adding
        if(item){
            total += parseFloat(item?.[key] || 0);
        }
        return total;
    }, 0).toFixed(2);  // Return the total with 2 decimal places
}

export function hideText(originalText, hideChar = "*") {
    var textToHide = typeof originalText === 'string' ? originalText : String(originalText);
    return textToHide.replace(/./g, hideChar);
}

export function convertObjectToFormData(formDataObject) {
    const formData = new FormData();

    for (const key in formDataObject) {
        if (formDataObject.hasOwnProperty(key)) {
            formData.append(key, formDataObject[key]);
        }
    }

    return formData;
}

export function updateCheckboxValues(currentValues, valueToAddOrRemove) {
    const currentArray = currentValues.split(',').map(Number);
    const index = currentArray.indexOf(valueToAddOrRemove);

    if (index === -1) {
        currentArray.push(valueToAddOrRemove);
    } else {
        currentArray.splice(index, 1);
    }

    const updatedValues = currentArray.join(',');

    return updatedValues;
}

export function isFieldMandatory(arr, field) {
    return arr.includes(field)
}

export function downloadFile(url, filename) {
    const link_ = document.createElement("a")
    link_.href = url
    link_.download = filename || "document";
    link_.target = "_blank"
    document.body.appendChild(link_)
    link_.click()
    setTimeout(() => {
        document.body.removeChild(link_)
    }, 500);
}

export function updateStateByKey(setStateCallback, keyArray, value) {
    setStateCallback(prev => prev.map(item => {
        let currentItem = { ...item };
        let nestedObject = currentItem;
        for (const key of keyArray.slice(0, -1)) {
            nestedObject = nestedObject[key];
        }
        nestedObject[keyArray[keyArray.length - 1]] = value;
        return currentItem;
    }));
}

export function updateStateByCondition(setStateCallback, conditionFunction, keyArray, value) {
    setStateCallback(prev => prev.map(item => {
        if (conditionFunction(item)) {
            let currentItem = { ...item };
            let nestedObject = currentItem;
            for (const key of keyArray.slice(0, -1)) {
                nestedObject = nestedObject[key];
            }
            nestedObject[keyArray[keyArray.length - 1]] = value;
            return currentItem;
        }
        return item;
    }));
}

export function calculatePageRange(currentPage, itemsPerPage, totalItems) {
    const parsedCurrentPage = parseInt(currentPage, 10);
    const parsedItemsPerPage = parseInt(itemsPerPage, 10);
    const parsedTotalItems = parseInt(totalItems, 10);

    if (isNaN(parsedCurrentPage) || isNaN(parsedItemsPerPage) || isNaN(parsedTotalItems)) { return "" }

    const startItem = (parsedCurrentPage - 1) * parsedItemsPerPage + 1;
    const endItem = Math.min(parsedCurrentPage * parsedItemsPerPage, parsedTotalItems);

    return `${startItem}-${endItem} of ${parsedTotalItems}`;
}

export function openPdfInNewTab(url) {
    const link_ = document.createElement("a");
    link_.href = url;
    link_.target = "_blank";
    document.body.appendChild(link_);
    
    setTimeout(() => {
        link_.click();
        document.body.removeChild(link_);
    }, 500);
}

export function checkPermission(module) {
    let permissions = localStorage.getItem("permittedmodules")
    let usertype = localStorage.getItem("usertype")
    if (usertype == 1) {
        return true
    } else if (usertype == 3) {
        return customerPermissions.includes(module)
    } else {
        if (permissions) {
            let arr = permissions.split(",")
            return arr.includes(module)
        } else {
            return false
        }
    }
}

export function generateNumberArray(start, end, step) {
    const result = [];

    for (let i = start; i <= end; i += step) {
        result.push(i);
    }

    return result;
}

export function joinHoursMinutes(hrs, mins, separator) {
    let hours = hrs ? hrs : "0"
    let minutes = mins ? mins : "0"
    return `${hours}${separator}${minutes}`
}

export function getUniquePropertyValues(data, propertyName) {
    if (data) {
        const uniqueValuesArray = data.reduce((accumulator, item) => {
            if (item && item[propertyName] && !accumulator.includes(item[propertyName])) {
                accumulator.push(item[propertyName]);
            }
            return accumulator;
        }, []);
        return uniqueValuesArray;
    } else {
        return []
    }
}

export function getUniqueValuesByFromString(arrayOfObjects, key) {
    let uniqueValues = [];
    uniqueValues = arrayOfObjects?.reduce((accumulator, obj) => {
        let value = obj[key];
        let valuesArray = typeof value === 'string' ? value?.split(',') : [value];
        valuesArray.forEach(val => {
            if (!uniqueValues.includes(val)) {
                accumulator.push(val?.trim());
            }
        });
        return accumulator;
    }, []);
    return uniqueValues;
}

export function removeDuplicatesAndUndefined(inputArray) {
    let uniqueValuesSet = new Set(inputArray ? inputArray.filter(value => value !== undefined) : []);
    let uniqueValuesArray = Array.from(uniqueValuesSet);
    return uniqueValuesArray;
}

export function extractFilename(response) {
    const contentDisposition = response?.headers['content-disposition'];
    const matches = contentDisposition?.match(/filename="(.+?)"/);
    if (matches && matches?.length > 1) {
        return matches[1];
    }
    return
}

export function convertToLink(text) {
    const urlRegex = /((https?:\/\/)|(www\.))[^\s]+/g;

    return text.replace(urlRegex, (url) => {
        if (text.indexOf('<a') === -1 || text.indexOf('<a') > text.indexOf(url)) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        }
        return url;
    });
};

export function getIconPath(url) {
    const fileExtension = url.split('.').pop().toLowerCase();

    const iconMap = {
        'pdf': 'PDF.svg',
        'doc': 'word.svg',
        'docx': 'word.svg',
        'xls': 'excel.svg',
        'xlsx': 'excel.svg',
        'ppt': 'ppt.svg',
        'pptx': 'ppt.svg',
        'txt': 'txt.svg',
        'csv': 'CSV.png',
        'ai': 'ai.png',
        'eps': 'eps.png',
        'mp4': 'mp4.svg',
    };

    if (iconMap.hasOwnProperty(fileExtension)) {
        return iconMap[fileExtension];
    } else {
        return 'default-file.svg';
    }
}

export function extractIntegerPart(number) {
    const stringValue = number?.toString();
    const integerValue = stringValue?.split('.')[0]; // Extracting the part before the decimal point
    return integerValue;
}

export function hoursRemaining(newValue, hoursUsed) {
    const [newHours, newMinutes] = (newValue || '0:00').split(':').map(parseFloat);
    const [usedHours, usedMinutes] = (hoursUsed || '0:00').split(':').map(parseFloat);

    const newTotalMinutes = newHours * 60 + newMinutes;
    const usedTotalMinutes = usedHours * 60 + usedMinutes;

    let remainingTotalMinutes = newTotalMinutes - usedTotalMinutes;
    remainingTotalMinutes = Math.max(remainingTotalMinutes, 0);

    const remainingHours = Math.floor(remainingTotalMinutes / 60);
    const remainingMinutes = remainingTotalMinutes % 60;

    const formattedHours = String(remainingHours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

export function convertToHHMM(timeValue) {
    const [hoursStr, minutesStr] = (timeValue || '').split('.');

    let hours = parseInt(hoursStr, 10) || 0;
    let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes %= 60;
    }

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
}

export function deletePropertiesIfExists(obj, props) {
    if (obj && Array.isArray(props)) {
        props.forEach(prop => {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                delete obj[prop];
            }
        });
    }
}

export function numberWithCommas(number) {
    let numberString = number.toString();

    let parts = numberString.split('.');
    let integerPart = parts[0];
    let fractionalPart = parts.length > 1 ? '.' + parts[1] : '';
    let integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return integerWithCommas + fractionalPart;
}

export function startsWithMinus(input) {
    if (input == null) {
        return false; // Return false for null input
    }
    let stringInput = String(input);
    return stringInput.startsWith("-");
}

export function separateAndTransformIds(array) {
    let userIds = [];
    let deptIds = [];
    if (array) {
        array.forEach(value => {
            if (value >= 0) {
                userIds.push(value);
            } else {
                deptIds.push(Math.abs(value));
            }
        });
    }

    return { userIds, deptIds };
}

export function separateAndTransformIdsWithZero(array) {
    let userIds = [];
    let deptIds = [];
    if (array) {
        array.forEach(value => {
            if (value > 0) {
                userIds.push(value);
            } else {
                deptIds.push(Math.abs(value));
            }
        });
    }

    return { userIds, deptIds };
}

export function numCheck(e) {
    const characters = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', ')', '(', '-', '=', '_', '+',
        '>', '<', '?', '/', ':', ';', '|', '\\', ']', '}', '[', '{', "'", '"', ' '
    ];
    if (characters.includes(e.key)) e.preventDefault();
}

export function saveFilterToLocal(section, value) {
    let data = localStorage.getItem("filters") ? JSON.parse(localStorage.getItem('filters')) : {};
    data[section] = value;
    localStorage.setItem("filters", JSON.stringify(data));
}

export function getFilterFromLocal(section) {
    let data = localStorage.getItem("filters");
    if (data) {
        data = JSON.parse(data);
        return data[section];
    } else {
        return {};
    }
}

export function removeNullFromArray(array) {
    if (array?.length > 0) {
        return array.filter(item => item !== null);
    } else {
        return []
    }
}

export function uniqueItemsFromArray(array) {
    return array.reduce((uniqueArray, currentItem) => {
        const isIdExists = uniqueArray.some(item => item.id === currentItem.id);

        if (!isIdExists) {
            uniqueArray.push(currentItem);
        }

        return uniqueArray;
    }, []);
}

export function moveSelectedToTop(options, attribute, arr) {
    const selectedOptions = [];
    const unselectedOptions = [];

    options.forEach((option) => {
        if (arr.includes(option.id)) {
            selectedOptions.push(option);
        } else {
            unselectedOptions.push(option);
        }
    });

    const sortedSelected = sortObjectsByAttribute(selectedOptions, attribute)
    const sortedUnselected = sortObjectsByAttribute(unselectedOptions, attribute)

    return [...sortedSelected, ...sortedUnselected];
}

export function saveSelectedOptionsToLocalStorage(section, subsection, options) {
    let selectedSection = JSON.parse(localStorage.getItem(section)) || {};
    if (!selectedSection[subsection]) {
        selectedSection[subsection] = {};
    }
    selectedSection[subsection] = options;
    localStorage.setItem(section, JSON.stringify(selectedSection));
}

export function getSelectedOptionsFromLocalStorage(section, subsection) {
    let selectedSection = JSON.parse(localStorage.getItem(section)) || {};
    if (selectedSection[subsection]) {
        return selectedSection[subsection] || [];
    } else {
        return [];
    }
}

export function processOptions(selectedOptions, data) {
    let selected = removeDuplicatesAndUndefined(selectedOptions ? selectedOptions?.map(option => option.id) : []);
    let filteredData = data.filter(item => !selected.includes(item.id));

    const sortedSelected = sortObjectsByAttribute(selectedOptions, "name")
    const sortedUnselected = sortObjectsByAttribute(filteredData, "name")

    return [...sortedSelected, ...sortedUnselected];
}