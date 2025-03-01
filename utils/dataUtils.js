// utils/dataUtils.js
export function calculateDateYearsAgo(yearsAgo) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().split('T')[0];
}

export function formatStudentData(student) {
    let formattedClassYear;
    if (student.classYear === 'first') {
        formattedClassYear = 'First';
    } else if (student.classYear === 'second') {
        formattedClassYear = 'Second';
    } else {
        formattedClassYear = student.classYear;
    }

    return {
        ...student,
        classYear: formattedClassYear,
        groupName: student.groupName ? student.groupName.toUpperCase() : ''
    };
}