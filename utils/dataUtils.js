// utils/dataUtils.js

export function calculateDateYearsAgo(yearsAgo) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().split('T')[0];
}

export function formatStudentData(student) {
    return {
        ...student,
        classYear: capitalizeFirstLetter(normalizeString(student.classYear)), 
        groupName: student.groupName ? student.groupName.toUpperCase() : "",
        gender: normalizeString(student.gender) // Ensure gender is always lowercase for comparisons
    };
}

export function capitalizeFirstLetter(str) {
    return str ? str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";
}

export function normalizeString(str) {
    return str ? str.trim().toLowerCase() : "";
}


export function normalizeBooleans(data, booleanFields = []) {
    const normalized = { ...data };
    for (const key of booleanFields) {
        normalized[key] = data[key] === 1;
    }
    return normalized;
}

export function normalizeFilterValues(filters) {
    const normalized = {};
    for (const key in filters) {
        const value = filters[key];
        normalized[key] = Array.isArray(value) ? value : [value];
    }
    return normalized;
}
