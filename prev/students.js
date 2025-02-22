function getElementsByDataAttribute(attribute = "data-element") {
    const elements = document.querySelectorAll(`[${attribute}]`);
    return Array.from(elements).reduce((acc, el) => {
        const key = el.getAttribute(attribute);
        if (key) acc[key] = el;
        return acc;
    }, {});
}
let elements = getElementsByDataAttribute("data-element"); // Declare it once globally
 
function initializeStudentsPage() {
   

    const checkboxes = [
    elements.firstYearCheckbox, elements.secondYearCheckbox,
    elements.mpcCheckbox, elements.bipcCheckbox,elements.mecCheckbox, elements.cecCheckbox];
    checkboxes.forEach(checkbox => {
        if (checkbox) checkbox.addEventListener("change", filterAndRenderStudents);
    });

function createOptions(options) {
    return options.map(option => ({ 
        value: option.toLowerCase().replace(/\s/g, ''), 
        label: capitalizeFirstLetter(option) 
    }));
}

const YEAR_OPTIONS = createOptions(['First Year', 'Second Year']);
const GROUP_OPTIONS = createOptions(['MPC', 'BiPC', 'MEC', 'CEC']);
const MEDIUM_OPTIONS = createOptions(['English', 'Telugu']);
const SECOND_LANGUAGE_OPTIONS = createOptions(['Sanskrit', 'Telugu', 'Hindi', 'English']);
const NATIONALITY_OPTIONS = createOptions(['Indian', 'Others']);
const SCHOLARSHIP_OPTIONS = createOptions(['Yes', 'No']);
const PHYSICALLY_HANDICAPPED_OPTIONS = createOptions(['Yes', 'No']);
const QUALIFYING_EXAM_OPTIONS = createOptions(['SSC', 'CBSE', 'ICSE', 'Others']);
const PARENTS_INCOME_OPTIONS = [
    { value: '<1.4L', label: 'Less than 1.4 Lakh' },
    { value: '1.4-3Lakh', label: '1.4 - 3 Lakh' },
    { value: '3-8L', label: '3 - 8 Lakh' },
    { value: '8-12L', label: '8 - 12 Lakh' },
    { value: 'above', label: 'Above 12 Lakh' }
];

const BATCH_YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => {
    const year = 2020 + i;
    return { value: `${year}-${year + 1}`, label: `${year}-${year + 1}` };
});

function capitalizeFirstLetter(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function toggleVisibility({ show = [], hide = [] }) {
    show.forEach(element => element?.classList.remove("hidden"));
    hide.forEach(element => element?.classList.add("hidden"));
}
function setActiveTab({ activeButton, inactiveButton, visibility = { show: [], hide: [] } }) {
    toggleVisibility(visibility);
    activeButton.classList.add("active");
    inactiveButton.classList.remove("active");
}
let currentPage = 1; 
const studentsPerPage = 30;
let totalStudents = 0; 
let totalPages = 0; 

async function showStudentsTab() {
    setActiveTab({
        activeButton: elements["allStudentsTabButton"],
        inactiveButton: elements["addStudentTabButton"],
        visibility: {
            show: [elements["allStudentsTab"], elements["filtersContainer"], elements["studentListContainer"]],
            hide: [elements["addStudentTab"], elements["studentDataContainer"]]
        }
    });
    
    elements["studentDataContainer"].innerHTML = "";
    await fetchStudentsFromLocalDisk();

    totalStudents = students.length; 
    totalPages = Math.ceil(totalStudents / studentsPerPage);
    filterAndRenderStudents(currentPage, studentsPerPage);
    addPaginationControls();
}

if (elements["allStudentsTabButton"] && elements["addStudentTabButton"]) {
    elements["allStudentsTabButton"].addEventListener("click", showStudentsTab);
    elements["addStudentTabButton"].addEventListener("click", showAddStudent);
} else {
    console.error("Tab buttons not found in the DOM.");
}

function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = "" }) {
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', elementName);
    labelElement.textContent = label;
    formGroup.appendChild(labelElement);

    let inputElement;
    if (type === 'select') {
        inputElement = document.createElement('select');
        inputElement.setAttribute('data-element', elementName);
        inputElement.name = elementName;
        inputElement.required = required;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = `Select ${label}`;
        inputElement.appendChild(defaultOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === value) optionElement.selected = true;
            inputElement.appendChild(optionElement);
        });
    } else {
        inputElement = document.createElement('input');
        inputElement.type = type;
        inputElement.setAttribute('data-element', elementName);
        inputElement.required = required;

        if (pattern) inputElement.pattern = pattern;
        if (minLength !== "") inputElement.minLength = minLength;
        if (maxLength !== "") inputElement.maxLength = maxLength;
        if (min !== "") inputElement.min = min;
        if (max !== "") inputElement.max = max;
        if (type === "number") inputElement.step = "0.01";
        inputElement.value = value || ""; 

        if (type === 'text') {
            inputElement.addEventListener('input', function() {
                this.value = capitalizeFirstLetter(this.value);
            });
        }
    }

    formGroup.appendChild(inputElement);

    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message');
    errorMessage.setAttribute('data-element', `${elementName}Error`);
    formGroup.appendChild(errorMessage);

    return formGroup;
}

function calculateDateYearsAgo(yearsAgo) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().split('T')[0];
}

function renderStudentForm(container, isEdit = false, studentData = {}) {
    if (!container) {
        console.error("Form container not found!");
        return;
    }
const currentYear = new Date().getFullYear();


const formFields = [
    // Admission Details
    { label: 'Name of the Student', elementName: 'studentName', type: 'text', required: true, minLength: 3, value: studentData.studentName || '' },
    ...(isEdit ? [{ label: 'Student ID', elementName: 'studentId', type: 'number', required: true, value: studentData.studentId || '', disabled: true }] : []),
          
    { label: 'Admission No.', elementName: 'admissionNumber', type: 'number', min: 1000, max: 9999, value: studentData.admissionNumber || '', disabled: true },
    { label: 'Date of Admission', elementName: 'dateOfAdmission', type: 'date', required: true,min: calculateDateYearsAgo(10), max: new Date().toISOString().split('T')[0], value: studentData.dateOfAdmission || '', ...(isEdit ? { disabled: true } : {})},
    { label: 'Class Year', elementName: 'classYear', type: 'select', required: true, options: YEAR_OPTIONS, value: studentData.classYear || 'first' },
    { label: 'Group', elementName: 'groupName', type: 'select', required: true, options: GROUP_OPTIONS, value: studentData.groupName || '' },
    { label: 'Medium', elementName: 'medium', type: 'select', required: true, options: MEDIUM_OPTIONS, value: studentData.medium || 'english' },
    { label: 'Second Language', elementName: 'secondLanguage', type: 'select', required: true, options: SECOND_LANGUAGE_OPTIONS, value: studentData.secondLanguage || 'sanskrit' },
    { label: 'Batch Year', elementName: 'batchYear', type: 'select', required: true, options: BATCH_YEAR_OPTIONS, value: studentData.batchYear || `${currentYear}-${currentYear + 1}` },

    // Parent Details
    { label: "Father's Name", elementName: 'fathersName', type: 'text', required: true, minLength: 3, value: studentData.fathersName || '' },
    { label: "Father's Cell No.", elementName: 'fatherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.fatherCell || '' },
    { label: "Mother's Name", elementName: 'mothersName', type: 'text', required: true, minLength: 3, value: studentData.mothersName || '' },
    { label: "Mother's Cell No.", elementName: 'motherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.motherCell || '' },

    // Personal Details
    { label: 'Date of Birth', elementName: 'dob', type: 'date', required: true, min: calculateDateYearsAgo(25), max: calculateDateYearsAgo(10), value: studentData.dob || '' },
    { label: 'Nationality', elementName: 'nationality', type: 'select', required: true, options: NATIONALITY_OPTIONS, value: studentData.nationality || 'indian' },
    { label: 'Religion', elementName: 'religion', type: 'text', required: true, value: studentData.religion || '' },
    { label: 'Community', elementName: 'community', type: 'text', required: true, value: studentData.community || '' },
    { label: 'Mother Tongue', elementName: 'motherTongue', type: 'text', required: true, value: studentData.motherTongue || '' },
    { label: 'Scholarship', elementName: 'scholarship', type: 'select', required: true, options: SCHOLARSHIP_OPTIONS, value: studentData.scholarship || '' },
    { label: "Parent's Annual Income", elementName: 'parentsIncome', type: 'select', required: true,options: PARENTS_INCOME_OPTIONS, value: studentData.parentsIncome || '' },
    { label: 'Physically Handicapped', elementName: 'physicallyHandicapped', type: 'select', required: true, options: PHYSICALLY_HANDICAPPED_OPTIONS, value: studentData.physicallyHandicapped || '' },
    { label: 'Aadhaar (UID)', elementName: 'aadhaar', type: 'text', required: true, pattern: '\\d{12}', maxLength: 12, value: studentData.aadhaar || '' },
    { label: 'Additional Contact No.', elementName: 'additionalCell', type: 'text', pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.additionalCell || '' },
    { label: 'Identification Mark 1', elementName: 'identificationMark1', type: 'text', required: true, value: studentData.identificationMark1 || '' },
    { label: 'Identification Mark 2', elementName: 'identificationMark2', type: 'text', value: studentData.identificationMark2 || '' },

    // Address Details
    { label: 'House Number', elementName: 'hno', type: 'text', required: true, value: studentData.hno || '' },
    { label: 'Street', elementName: 'street', type: 'text', required: true, value: studentData.street || '' },
    { label: 'Village', elementName: 'village', type: 'text', required: true, value: studentData.village || '' },
    { label: 'Mandal', elementName: 'mandal', type: 'text', required: true, value: studentData.mandal || '' },
    { label: 'District', elementName: 'district', type: 'text', required: true, value: studentData.district || '' },
    { label: 'State', elementName: 'state', type: 'text', required: true, value: studentData.state || '' },
    { label: 'Pincode', elementName: 'pincode', type: 'text', pattern: '\\d{6}', maxLength: 6, required: true, value: studentData.pincode || '' },

    // Academic Details
    { label: 'Qualifying Exam', elementName: 'qualifyingExam', type: 'select', required: true, options: QUALIFYING_EXAM_OPTIONS, value: studentData.qualifyingExam || '' },
    { label: 'Year of Exam', elementName: 'yearOfExam', type: 'number', required: true, min: 2020, max: currentYear, value: studentData.yearOfExam || '' },  
    { label: 'Hall Ticket Number', elementName: 'hallTicketNumber', type: 'text', required: true, value: studentData.hallTicketNumber || '' },
    { label: 'GPA', elementName: 'gpa', type: 'number', required: true, min: 5, max: 10, step: 0.01, value: studentData.gpa || '' }
];
const form = document.createElement('form');
form.setAttribute('data-element', isEdit ? 'editStudentForm' : 'addStudentForm');
form.removeEventListener('submit', handleFormSubmit);

container.innerHTML = '';
form.innerHTML = '';

formFields.forEach(field => {
    const formField = createFormField(field);
    form.appendChild(formField);
});

const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.className = 'submit-button';
submitButton.textContent = isEdit ? 'Update' : 'Submit';
form.appendChild(submitButton);

container.appendChild(form);

const studentIdField = form.querySelector('[data-element="studentId"]');
if (!isEdit && studentIdField) {
    studentIdField.parentElement.remove();
} else if (isEdit && studentIdField) {
    studentIdField.disabled = true;
}

function initializeFormValues() { 
    // Ensure elements are fetched before using them
    Object.assign(elements, getElementsByDataAttribute("data-element"));

    console.log("Elements object:", elements); // Debugging line

    const nationalitySelect = elements.nationality;
    
    if (!nationalitySelect) {
        console.error("Nationality select not found!");
        return; // Stop execution if not found
    }

    nationalitySelect.addEventListener('change', function() {
        let nationalityOtherField = elements.otherNationalityField;

        if (this.value === 'others') {
            if (!nationalityOtherField) {
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true
                });

                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                this.parentNode.after(otherNationalityField);

                // 🔹 **Update elements list**
                elements = getElementsByDataAttribute("data-element");
                console.log("Updated elements:", elements); // Debugging line
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                // 🔹 **Update elements list**
                elements = getElementsByDataAttribute("data-element");
                console.log("Updated elements after removal:", elements); // Debugging line
            }
        }
    });

    console.log("Nationality select successfully initialized!");
}


setTimeout(initializeFormValues, 0);

const nationalitySelect = elements.nationality;
if (nationalitySelect) {
    nationalitySelect.addEventListener('change', function() {
        let nationalityOtherField = elements.otherNationalityField; // Existing reference
        
        if (this.value === 'others') {
            if (!nationalityOtherField) { // Field doesn't exist, create it
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true
                });
                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                
                this.parentNode.after(otherNationalityField);

                // 🔹 **Re-fetch `elements` to include new field**
                elements = getElementsByDataAttribute("data-element");
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                // 🔹 **Re-fetch `elements` after removing**
                elements = getElementsByDataAttribute("data-element");
            }
        }
    });
} else {
    console.error("Nationality select not found!");
}

form.addEventListener('submit', handleFormSubmit); 

return form; 
}

function showAddStudent() {
    setActiveTab({
        activeButton: elements.addStudentTabButton,
        inactiveButton: elements.allStudentsTabButton,
        visibility: {
            show: [elements.addStudentTab],
            hide: [elements.allStudentsTab]
        }
    });
    renderStudentForm(elements.addStudentFormContainer);
}
function showEditStudent(studentData) {
        setActiveTab({
        activeButton: elements.addStudentTabButton,
        inactiveButton: elements.allStudentsTabButton,
        visibility: {
            show: [elements.addStudentTab],
            hide: [elements.allStudentsTab]
        }   
    });
    
    renderStudentForm(elements.addStudentFormContainer, true, studentData);
    const form = document.getElementById('editStudentForm');
    elements.editStudentForm.dataset.studentId = studentData.studentId;
    elements.editStudentForm.removeEventListener('submit', handleFormSubmit);
    elements.editStudentForm.addEventListener('submit', handleFormSubmit); 
    console.log("Submit event listener attached to editStudentForm"); 
}
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log("handleFormSubmit called");

    const studentData = gatherStudentData();
    console.log("studentData:", studentData);

    const errors = validateForm(studentData);
    console.log("errors:", errors);
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors);
        console.log("Validation errors found");
        return;
    } 
    try {
        let result;
        if (event.target === elements.addStudentForm) {
            delete studentData.studentId; 

            result = await window.electron.invoke('addStudent', studentData);
            if (result.success) {
                alert("Student added successfully! ID: " + result.studentId);
                event.target.reset();
                await fetchStudentsFromLocalDisk();
                filterAndRenderStudents();
                showStudentsTab();
            } else {
                alert(result.message || "Failed to add student.");
            }
        } else if (event.target === elements.editStudentForm) {
            const studentId = event.target.dataset.studentId; 
            studentData.studentId = parseInt(studentId, 10); 

            result = await window.electron.invoke('updateStudent', studentData); 
            if (result.success) {
                alert('Student updated successfully!');
                await fetchStudentsFromLocalDisk();
                filterAndRenderStudents();
                displayStudentData(studentData.studentId);
                showStudentsTab();
            } else {
                alert(result.message || 'Failed to update student.');
            }
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert('An error occurred while submitting the form.');
    }
}

function validateForm(studentData) {
    const errors = {};
    elements = getElementsByDataAttribute("data-element");

    // Validate Student ID if editing
    if (elements.editStudentForm) { 
        if (!studentData.studentId) {
            errors.studentId = "Student ID is required.";
        } else if (isNaN(studentData.studentId) || studentData.studentId < 10000 || studentData.studentId > 99999) {
            errors.studentId = "Student ID must be a 5-digit number.";
        }
    }

    if (!studentData.studentName) {
        errors.studentName = "Student Name is required.";
    }

    // Validate Aadhaar
    if (!studentData.aadhaar.match(/^\d{12}$/)) {
        errors.aadhaar = "Aadhaar must be a 12-digit number.";
    }

    if (studentData.gpa === "" || studentData.gpa === null || isNaN(studentData.gpa)) {
        errors.gpa = "GPA is required and must be a valid number.";
    } else if (studentData.gpa < 5 || studentData.gpa > 10) {
        errors.gpa = "GPA must be between 5.0 and 10.0.";
    } else if (studentData.gpa.toString().split('.').length > 1 && studentData.gpa.toString().split('.')[1].length > 2) {
        errors.gpa = "GPA can have at most two decimal places.";
    }

    // Nationality Validation
    if (studentData.nationality === 'others' && !studentData.otherNationality) {
        errors.otherNationality = "Nationality is required when 'Others' is selected.";
    }

    return errors;
}

window.addEventListener('DOMContentLoaded', () => {
    elements = getElementsByDataAttribute("data-element");

    if (!studentData.admissionNumber && elements.admissionNumber) { 
        elements.admissionNumber.disabled = true;
    }
});

function displayFormErrors(errors) {
    elements = getElementsByDataAttribute("data-element");

    for (const field in errors) {
        const errorElement = elements[`${field}Error`]; 
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    }
}

function gatherStudentData() {
    const getValue = (element) => element?.value?.trim() || "";
    const getNumber = (element) => Number(element?.value?.trim()) || null;
    const getSelectValue = (element) => {
        if (!element) {  
            console.error(`Element '${element}' not found!`);
            return "";
        }
        const selectedOption = element.options[element.selectedIndex];
        if (!selectedOption) { 
            console.warn(`No option selected for '${element}'`);
            return "";
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

// Handle Electron error messages
if (window.electron) {
    window.electron.receive('error', (errorMessage) => {
        alert("Error: " + errorMessage);
    });
}

let students = [];

async function fetchStudentsFromLocalDisk() {
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
        console.error("Error fetching students from local disk:", error);
        students = [];
        totalStudents = 0;
    }
}

async function initializeApp() {
    await fetchStudentsFromLocalDisk();
}
initializeApp();

function getSelectedValues(checkboxes) {
    return checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
}

function filterAndRenderStudents(page = 1, limit = 30) {
    const selectedClassYears = getSelectedValues([elements.firstYearCheckbox, elements.secondYearCheckbox]);
    const selectedGroups = getSelectedValues([elements.mpcCheckbox, elements.bipcCheckbox, elements.mecCheckbox, elements.cecCheckbox]);

    let filteredStudents = students;
    if (selectedClassYears.length > 0) {
        filteredStudents = filteredStudents.filter(student => selectedClassYears.includes(student.classYear));
    }
    if (selectedGroups.length > 0) {
        filteredStudents = filteredStudents.filter(student => selectedGroups.includes(student.groupName));
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

function addPaginationControls() {
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.setAttribute("data-element", "paginationContainer"); // Ensure it's recognized
    elements.studentListContainer.parentNode.insertBefore(paginationContainer, elements.studentListContainer.nextSibling);

    elements = getElementsByDataAttribute("data-element");

    renderPaginationButtons();
}

function renderPaginationButtons() {
    elements.paginationContainer.innerHTML = ''; 

    const firstButton = document.createElement('button');
    firstButton.textContent = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        currentPage = 1;
        filterAndRenderStudents(currentPage, studentsPerPage);
        renderPaginationButtons();
    });
    elements.paginationContainer.appendChild(firstButton);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        filterAndRenderStudents(currentPage, studentsPerPage);
        renderPaginationButtons();
    });
    elements.paginationContainer.appendChild(prevButton);

    const pageNumbers = calculatePageNumbers();
    pageNumbers.forEach(pageNumber => {
        const pageButton = document.createElement('button');
        pageButton.textContent = pageNumber;
        pageButton.classList.add('page-number');
        pageButton.disabled = pageNumber === currentPage;
        pageButton.addEventListener('click', () => {
            currentPage = pageNumber;
            filterAndRenderStudents(currentPage, studentsPerPage);
            renderPaginationButtons();
        });
        elements.paginationContainer.appendChild(pageButton);
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        filterAndRenderStudents(currentPage, studentsPerPage);
        renderPaginationButtons();
    });
    elements.paginationContainer.appendChild(nextButton);

    const lastButton = document.createElement('button');
    lastButton.textContent = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        currentPage = totalPages;
        filterAndRenderStudents(currentPage, studentsPerPage);
        renderPaginationButtons();
    });
    elements.paginationContainer.appendChild(lastButton);

    // Total Pages Display:
    const totalPagesSpan = document.createElement('span');
    totalPagesSpan.textContent = ` / ${totalPages || 1}`; 
    elements.paginationContainer.appendChild(totalPagesSpan);
}

function calculatePageNumbers() {
    const pageNumbers = [];
    const maxPageButtons = 5;

    if (totalPages <= maxPageButtons) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        const middleButton = Math.floor(maxPageButtons / 2);

        if (currentPage <= middleButton) {
            for (let i = 1; i <= maxPageButtons; i++) {
                pageNumbers.push(i);
            }
            if (maxPageButtons < totalPages) {
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            }
        } else if (currentPage >= totalPages - middleButton) {
            if (totalPages - maxPageButtons > 0) {
                pageNumbers.push(1);
                pageNumbers.push("...");
            }
            for (let i = totalPages - maxPageButtons + 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            pageNumbers.push("...");
            for (let i = currentPage - middleButton; i <= currentPage + middleButton; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push("...");
            pageNumbers.push(totalPages);
        }
    }
    return pageNumbers;
}

let sortedStudents = [];

function renderStudentList(students) {
    elements.studentListContainer.innerHTML = '';
    toggleVisibility({ show: [elements.studentListContainer, elements.filtersContainer], hide: [elements.studentDataContainer] });

    if (students.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
        return;
    }

    let sortOrder = 'asc';
    let sortedColumn = null;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Selected';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => deleteSelectedStudents(students));

    const studentTable = document.createElement('table');
    studentTable.className = 'student-table';
    const headerRow = `
        <thead>
            <tr>
                <th class="no-sort"><input type="checkbox" data-element="selectAllCheckbox"></th>
                <th data-column="studentId">ID No</th>
                <th data-column="studentName">Name</th>
                <th data-column="admissionNumber">Admn No</th>
                <th data-column="fatherCell">Contact</th>
                <th data-column="classYear">Year</th>
                <th data-column="groupName">Group</th>
            </tr>
        </thead>
    `;
    studentTable.innerHTML = headerRow;
    const tbody = document.createElement('tbody');
    studentTable.appendChild(tbody);

    elements.studentListContainer.appendChild(deleteButton);
    elements.studentListContainer.appendChild(studentTable);

    sortedStudents = [...students];
    updateTableBody(tbody, sortedStudents);

    studentTable.querySelectorAll('th[data-column]').forEach((header) => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            let sortOrder = header.dataset.sortOrder || 'asc';
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            header.dataset.sortOrder = sortOrder;

            const ascending = sortOrder === 'asc';
            sortedStudents = sortData(sortedStudents, column, ascending);
            updateTableBody(tbody, sortedStudents);
        });
    });
    elements = getElementsByDataAttribute("data-element");
    if (elements.selectAllCheckbox) {
        elements.selectAllCheckbox.addEventListener('change', (event) => {
            const checkboxes = document.querySelectorAll('.select-student-checkbox');
            checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
        });
    } else {
        console.error("selectAllCheckbox is undefined. Check if the element exists in the DOM.");
    }

    attachRowClickEvents();
}

function attachRowClickEvents() {
    const rows = document.querySelectorAll('.student-row');

    rows.forEach(row => {
        row.removeEventListener('click', handleRowClick);
        row.addEventListener('click', handleRowClick);
    });

    document.querySelectorAll('.select-student-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('click', stopPropagation);
        checkbox.addEventListener('click', stopPropagation);
    });
}

function handleRowClick(event) {
    const row = event.currentTarget;
    const studentId = row.getAttribute('data-id');
    if (studentId) displayStudentData(studentId);
}

function stopPropagation(event) {
    event.stopPropagation();
}

function renderRows(students) {
    return students.map(student => `
        <tr class="student-row" data-id="${student.studentId}">
            <td><input type="checkbox" class="select-student-checkbox" data-id="${student.studentId}"></td>
            <td>${student.studentId}</td>
            <td>${student.studentName}</td>
            <td>${student.admissionNumber}</td>
            <td>${student.fatherCell}</td>
            <td>${student.classYear}</td>
            <td>${student.groupName}</td>
        </tr>
    `).join("");
}

function sortData(data, key, ascending = true) {
    return data.sort((a, b) => {
        const valueA = parseFloat(a[key] || 0);
        const valueB = parseFloat(b[key] || 0);
        const comparison = isNaN(valueA) || isNaN(valueB)
            ? (a[key] || "").toString().toLowerCase().localeCompare((b[key] || "").toString().toLowerCase())
            : valueA - valueB;
        return ascending ? comparison : -comparison;
    });
}

function updateTableBody(tbody, students) {
    tbody.innerHTML = renderRows(students);
    attachRowClickEvents();
}

function displayStudentData(studentId) {
    const studentIdNumber = parseInt(studentId, 10);
    const student = students.find(student => student.studentId === studentIdNumber);

    if (!student) {
        console.error("Student not found for ID:", studentId);
        elements.studentDataContainer.innerHTML = "<p>Student data not found.</p>";
        return;
    }

    toggleVisibility({
        show: [elements.studentDataContainer],
        hide: [elements.studentListContainer, elements.filtersContainer]
    });

    elements.studentDataContainer.innerHTML = `
        <h3>Student Details</h3>
        <p><strong>ID:</strong> ${student.studentId}</p>
        <p><strong>Name:</strong> ${student.studentName}</p>
        <p><strong>Admission No:</strong> ${student.admissionNumber}</p>
        <p><strong>Contact:</strong> ${student.fatherCell}</p>
        <p><strong>Class Year:</strong> ${student.classYear}</p>
        <p><strong>Group:</strong> ${student.groupName}</p>
        <p><strong>Medium:</strong> ${student.medium}</p>
        <p><strong>Batch Year:</strong> ${student.batchYear}</p>
        <button data-element="editStudentButton" class="edit-button" data-student-id="${student.studentId}">Edit</button>
    `;
}

// Ensure the edit button is dynamically fetched from elements
elements.studentDataContainer.addEventListener("click", handleEditButtonClick);

function handleEditButtonClick(event) {
    if (event.target.dataset.element === "editStudentButton") {
        const studentId = event.target.dataset.studentId;
        const student = students.find(student => student.studentId === parseInt(studentId, 10));
        if (student) {
            showEditStudent(student);
        }
    }
}

async function deleteSelectedStudents(students) {
    const selectedCheckboxes = document.querySelectorAll('.select-student-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        alert('No students selected for deletion.');
        return;
    }

    const confirmation = confirm('Are you sure you want to delete the selected students? This action cannot be undone.');

    if (confirmation) {
        const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

        try {
            const result = await window.electron.invoke('deleteStudents', selectedIds);

            if (result.success) {
                alert(`${selectedIds.length} student(s) deleted successfully.`);
                await fetchStudentsFromLocalDisk();
                filterAndRenderStudents();
            } else {
                alert(result.message || "Failed to delete students.");
            }
        } catch (error) {
            console.error("Error deleting students:", error);
            alert(`An error occurred while deleting students: ${error.message}`);
        }
    }
}

// Listen for updates from Electron and re-fetch students
window.electron.receive('updateSuccess', () => {
    window.electron.invoke('fetchStudents')
        .then(updatedStudents => {
            renderStudentList(updatedStudents);
            initializeStudentsPage();
        })
        .catch(error => {
            console.error('Error fetching updated students:', error);
            alert('Failed to fetch the updated student list. Please try again.');
        });
});

}
initializeStudentsPage();   