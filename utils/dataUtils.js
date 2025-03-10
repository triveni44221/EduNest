// utils/dataUtils.js
import { normalizeString, capitalizeFirstLetter } from './uiUtils.js';

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
