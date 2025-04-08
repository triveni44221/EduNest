// students/studentsData.js
import { elements, initializeElements } from '../utils/sharedElements.js';
import { capitalizeFirstLetter, normalizeString, toggleVisibility  } from '../utils/uiUtils.js';
import { renderStudentList } from './studentsUI.js';
import { initPagination, ensurePaginationContainer } from '../utils/paginationUtils.js'; // Import the setter function


let students = [];
const studentsPerPage = 4; // Or whatever number you want per page


export function createOptions(options) {
    return options.map((option) => ({
        value: normalizeString(option).replace(/\s/g, ''), 
        label: capitalizeFirstLetter(option),
    }));
}
export const YEAR_OPTIONS = [
    { label: 'First Year', value: 'first' },
    { label: 'Second Year', value: 'second' }
];
export const GENDER_OPTIONS = createOptions(['Male', 'Female', 'Others']);
export const GROUP_OPTIONS = createOptions(['MPC', 'BiPC', 'MEC', 'CEC']);
export const MEDIUM_OPTIONS = createOptions(['English', 'Telugu']);
export const SECOND_LANGUAGE_OPTIONS = createOptions(['Sanskrit', 'Telugu', 'Hindi', 'English']);
export const NATIONALITY_OPTIONS = createOptions(['Indian', 'Others']);
export const YES_NO_OPTIONS = createOptions(['Yes', 'No']);
export const SCHOLARSHIP_OPTIONS = YES_NO_OPTIONS;
export const PHYSICALLY_HANDICAPPED_OPTIONS = YES_NO_OPTIONS;
export const QUALIFYING_EXAM_OPTIONS = createOptions(['SSC', 'CBSE', 'ICSE', 'Others']);
export const OCCUPATION_OPTIONS = createOptions(['Professor', 'Doctor', 'Engineer', 'Farmer', 'Others'].sort() );
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

export const COACHING_OPTIONS = [
    { value: '', label: 'None' },
    { value: 'eapcet', label: 'EAPCET' },
    { value: 'neet', label: 'NEET' },
];

export function validateForm(studentData) {
    const errors = {};

    if (!studentData.studentName) {
        errors.studentName = 'Student Name is required.';
    }

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

    if (studentData.nationality === 'others' && !studentData.otherNationality) {
        errors.otherNationality = "Nationality is required when 'Others' is selected.";
    }

    if (studentData.perm_same === null) {
        errors.perm_same = "Please select whether the permanent address is the same as the present address.";
    }

    return errors;
}

export function gatherStudentData(perm_same) {
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
        gender: getSelectValue(elements.gender),
        admissionNumber: getNumber(elements.admissionNumber),
        dateOfAdmission: getValue(elements.dateOfAdmission),
        classYear: getSelectValue(elements.classYear),
        groupName: getSelectValue(elements.groupName),
        medium: getSelectValue(elements.medium),
        secondLanguage: getSelectValue(elements.secondLanguage),
        batchYear: getSelectValue(elements.batchYear),
        fathersName: getValue(elements.fathersName),
        fatherCell: getValue(elements.fatherCell),
        fatherOccupation: getSelectValue(elements.fatherOccupation),
        motherOccupation: getSelectValue(elements.motherOccupation),
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
        studentData.otherNationality = getValue(elements.otherNationality);
    } else {
        studentData.otherNationality = null;
    }
    studentData.perm_same = perm_same;
     if(studentData.perm_same === 0){
        studentData.perm_hno = getValue(elements.perm_hno);
        studentData.perm_street = getValue(elements.perm_street);
        studentData.perm_village = getValue(elements.perm_village);
        studentData.perm_mandal = getValue(elements.perm_mandal);
        studentData.perm_district = getValue(elements.perm_district);
        studentData.perm_state = getValue(elements.perm_state);
        studentData.perm_pincode = getNumber(elements.perm_pincode);
    } else {
        studentData.perm_hno = null;
        studentData.perm_street = null;
        studentData.perm_village = null;
        studentData.perm_mandal = null;
        studentData.perm_district = null;
        studentData.perm_state = null;
        studentData.perm_pincode = null;
    }

    return studentData;
}
export async function fetchStudentsFromDatabase() {
    console.log("Fetching updated students...");

    try {
        const result = await window.electron.invoke('fetchStudents');

        if (result && Array.isArray(result)) {
            
            students.length = 0;  // Clear the existing array
            students.push(...result);  // Push new values into the same array
            
            console.log("✅ Updated students:", students);
            return students;
        } else {
            console.warn("⚠️ No students found in DB.");
            students.length = 0;  // Clear the array instead of reassigning
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching students from local disk:', error);
        students.length = 0;  // Clear the array instead of reassigning
        return [];
    }
}

export function getSelectedValues(checkboxes) {
    if (!Array.isArray(checkboxes)) {
        checkboxes = [checkboxes]; // Convert single element to array
    }

    const selectedValues = checkboxes
        .filter((checkbox) => {
            return checkbox?.checked;
        })
        .map((checkbox) => {
            return normalizeString(checkbox.value);
        });
    return selectedValues;
}

export async function filterAndRenderStudents(page = 1, limit = studentsPerPage) {
    initializeElements();

    if (!elements?.studentListContainer) {
        console.error("Elements not initialized before calling filterAndRenderStudents");
        return;
    }

    if (typeof page !== "number") {
        console.warn("Received event instead of page number. Fixing...");
        page = 1;
    }

    page = Number(page) || 1;

    if (!students || students.length === 0) {
        students = await fetchStudentsFromDatabase();
    }

    const filters = {
        classYear: getSelectedValues([elements.firstYearCheckbox, elements.secondYearCheckbox]) || [],
        groupName: getSelectedValues([
            elements.mpcCheckbox,
            elements.bipcCheckbox,
            elements.mecCheckbox,
            elements.cecCheckbox,
        ]) || [],
    };

    const filteredStudents = students.filter((student) => {
        return (
            (filters.classYear.length === 0 || filters.classYear.includes(normalizeString(student.classYear))) &&
            (filters.groupName.length === 0 || filters.groupName.includes(normalizeString(student.groupName)))
        );
    });

    const total = filteredStudents.length;
    const validLimit = isNaN(limit) ? studentsPerPage : limit;
    const validPage = isNaN(page) ? 1 : Math.max(1, page);
    const offset = (validPage - 1) * validLimit;
    const paginatedStudents = filteredStudents.slice(offset, offset + validLimit);

    if (paginatedStudents.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
    } else {
        renderStudentList(paginatedStudents);
    }
    ensurePaginationContainer(elements.studentListContainer);

if (total > validLimit) {
    console.log("Container before:", elements.paginationContainer);
    initPagination({
        totalItems: total,
        itemsPerPage: validLimit,
        currentPage: validPage,
        onPageChange: (newPage) => filterAndRenderStudents(newPage),
        container: elements.paginationContainer,
    });
    console.log("After initPagination, buttons:", document.querySelectorAll(".pagination-container button"));
    toggleVisibility({ show: elements.paginationContainer });
} else {
    toggleVisibility({ hide: elements.paginationContainer });
}
}

