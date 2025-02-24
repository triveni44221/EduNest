// students/studentsData.js
import { capitalizeFirstLetter } from '../utils/uiUtils.js';
import { getElementsByDataAttribute } from '../utils/uiUtils.js';
import { updatePagination, renderStudentList } from './studentsUI.js';
import { currentPage, studentsPerPage, totalStudents, totalPages } from '../utils/uiUtils.js';


export let students = [];

let elements = getElementsByDataAttribute('data-element');

export function createOptions(options) {
    return options.map((option) => ({
        value: option.toLowerCase().replace(/\s/g, ''),
        label: capitalizeFirstLetter(option),
    }));
}

export const YEAR_OPTIONS = createOptions(['First Year', 'Second Year']);
export const GROUP_OPTIONS = createOptions(['MPC', 'BiPC', 'MEC', 'CEC']);
export const MEDIUM_OPTIONS = createOptions(['English', 'Telugu']);
export const SECOND_LANGUAGE_OPTIONS = createOptions(['Sanskrit', 'Telugu', 'Hindi', 'English']);
export const NATIONALITY_OPTIONS = createOptions(['Indian', 'Others']);
export const SCHOLARSHIP_OPTIONS = createOptions(['Yes', 'No']);
export const PHYSICALLY_HANDICAPPED_OPTIONS = createOptions(['Yes', 'No']);
export const QUALIFYING_EXAM_OPTIONS = createOptions(['SSC', 'CBSE', 'ICSE', 'Others']);
export const PARENTS_INCOME_OPTIONS = [
    { value: '<1.4L', label: 'Less than 1.4 Lakh' },
    { value: '1.4-3Lakh', label: '1.4 - 3 Lakh' },
    { value: '3-8L', label: '3 - 8 Lakh' },
    { value: '8-12L', label: '8 - 12 Lakh' },
    { value: 'above', label: 'Above 12 Lakh' },
];
export const BATCH_YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => {
    const year = 2020 + i;
    return { value: `${year}-${year + 1}`, label: `${year}-${year + 1}` };
});

export function validateForm(studentData) {
    const errors = {};
    elements = getElementsByDataAttribute('data-element');

    // Validate Student ID if editing
    if (elements.editStudentForm) {
        if (!studentData.studentId) {
            errors.studentId = 'Student ID is required.';
        } else if (isNaN(studentData.studentId) || studentData.studentId < 10000 || studentData.studentId > 99999) {
            errors.studentId = 'Student ID must be a 5-digit number.';
        }
    }

    if (!studentData.studentName) {
        errors.studentName = 'Student Name is required.';
    }

    // Validate Aadhaar
    if (!studentData.aadhaar.match(/^\d{12}$/)) {
        errors.aadhaar = 'Aadhaar must be a 12-digit number.';
    }

    if (studentData.gpa === '' || studentData.gpa === null || isNaN(studentData.gpa)) {
        errors.gpa = 'GPA is required and must be a valid number.';
    } else if (studentData.gpa < 5 || studentData.gpa > 10) {
        errors.gpa = 'GPA must be between 5.0 and 10.0.';
    } else if (studentData.gpa.toString().split('.').length > 1 && studentData.gpa.toString().split('.')[1].length > 2) {
        errors.gpa = 'GPA can have at most two decimal places.';
    }

    // Nationality Validation
    if (studentData.nationality === 'others' && !studentData.otherNationality) {
        errors.otherNationality = "Nationality is required when 'Others' is selected.";
    }

    return errors;
}

export function gatherStudentData() {
    const getValue = (element) => element?.value?.trim() || '';
    const getNumber = (element) => Number(element?.value?.trim()) || null;
    const getSelectValue = (element) => {
        if (!element) {
            console.error(`Element '${element}' not found!`);
            return '';
        }
        const selectedOption = element.options[element.selectedIndex];
        if (!selectedOption) {
            console.warn(`No option selected for '${element}'`);
            return '';
        }
        return selectedOption.value;
    };
    const studentData = {
        studentName: getValue(elements.studentName),
        admissionNumber: getNumber(elements.admissionNumber),
        dateOfAdmission: getValue(elements.dateOfAdmission),
        classYear: getSelectValue(elements.classYear),
        groupName: getSelectValue(elements.groupName),
        medium: getSelectValue(elements.medium),
        secondLanguage: getSelectValue(elements.secondLanguage),
        batchYear: getSelectValue(elements.batchYear),
        fathersName: getValue(elements.fathersName),
        fatherCell: getValue(elements.fatherCell),
        mothersName: getValue(elements.mothersName),
        motherCell: getValue(elements.motherCell),
        dob: getValue(elements.dob),
        nationality: getValue(elements.nationality),
        religion: getValue(elements.religion),
        community: getValue(elements.community),
        motherTongue: getValue(elements.motherTongue),
        scholarship: getSelectValue(elements.scholarship),
        parentsIncome: getValue(elements.parentsIncome),
        physicallyHandicapped: getSelectValue(elements.physicallyHandicapped),
        aadhaar: getValue(elements.aadhaar),
        additionalCell: getValue(elements.additionalCell),
        identificationMark1: getValue(elements.identificationMark1),
        identificationMark2: getValue(elements.identificationMark2),
        hno: getValue(elements.hno),
        street: getValue(elements.street),
        village: getValue(elements.village),
        mandal: getValue(elements.mandal),
        district: getValue(elements.district),
        state: getValue(elements.state),
        pincode: getNumber(elements.pincode),
        qualifyingExam: getSelectValue(elements.qualifyingExam),
        yearOfExam: getNumber(elements.yearOfExam),
        hallTicketNumber: getValue(elements.hallTicketNumber),
        gpa: parseFloat(getValue(elements.gpa))
    };
    if (elements.editStudentForm) {
        studentData.studentId = getNumber(elements.studentId);
    }

    if (elements.otherNationality) {
        studentData.otherNationality = elements.otherNationality.value.trim();
    }

    return studentData;
}

export async function fetchStudentsFromLocalDisk() {
    try {
        const result = await window.electron.invoke('fetchStudents');
        if (result && result.length > 0) {
            students = result;
            totalStudents = students.length;
        } else {
            students = [];
            totalStudents = 0;
        }
    } catch (error) {
        console.error('Error fetching students from local disk:', error);
        students = [];
        totalStudents = 0;
    }
}

export async function initializeApp() {
    await fetchStudentsFromLocalDisk();
    updatePagination();
}

initializeApp();

export function getSelectedValues(checkboxes) {
    return checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
}

export function filterAndRenderStudents(page = currentPage, limit = studentsPerPage) {
    const selectedClassYears = getSelectedValues([elements.firstYearCheckbox, elements.secondYearCheckbox]);
    const selectedGroups = getSelectedValues([elements.mpcCheckbox, elements.bipcCheckbox, elements.mecCheckbox, elements.cecCheckbox]);

    let filteredStudents = students;
    if (selectedClassYears.length > 0) {
        filteredStudents = filteredStudents.filter((student) => selectedClassYears.includes(student.classYear));
    }
    if (selectedGroups.length > 0) {
        filteredStudents = filteredStudents.filter((student) => selectedGroups.includes(student.groupName));
    }

    totalStudents = filteredStudents.length;
    totalPages = Math.ceil(totalStudents / limit);

    const offset = (page - 1) * limit;
    const paginatedStudents = filteredStudents.slice(offset, offset + limit);

    if (paginatedStudents.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
    } else {
        renderStudentList(paginatedStudents);
    }
}