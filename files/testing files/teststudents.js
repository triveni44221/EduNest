function getElementsByIds(ids) {
    return ids.reduce((acc, id) => {
        acc[id] = document.getElementById(id);
        return acc;
    }, {});
}
function initializeStudentsPage() {
    console.log("students.js is loaded!");

const elements = getElementsByIds([
    "studentsTab", "studentListContainer", "allStudentsTabButton", 
    "addStudentTabButton", "addStudentTab", "allStudentsTab", 
    "addStudentFormContainer", "filtersContainer", "studentDataContainer", 
    "firstYearCheckbox", "secondYearCheckbox", "mpcCheckbox", 
    "bipcCheckbox", "mecCheckbox", "cecCheckbox"
]);

const checkboxes = [
    elements.firstYearCheckbox, elements.secondYearCheckbox,
    elements.mpcCheckbox, elements.bipcCheckbox,elements.mecCheckbox, elements.cecCheckbox];
checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterAndRenderStudents));

function toggleVisibility({ show = [], hide = [] }) {
    show.forEach(element => element?.classList.remove("hidden"));
    hide.forEach(element => element?.classList.add("hidden"));
}
function setActiveTab({ activeButton, inactiveButton, visibility = { show: [], hide: [] } }) {
    toggleVisibility(visibility);
    activeButton.classList.add("active");
    inactiveButton.classList.remove("active");
}
async function showStudentsTab() {
    setActiveTab({
        activeButton: elements.allStudentsTabButton,
        inactiveButton: elements.addStudentTabButton,
        visibility: {
            show: [elements.allStudentsTab, elements.filtersContainer, elements.studentListContainer],
            hide: [elements.addStudentTab, elements.studentDataContainer]
        }
    });
    elements.studentDataContainer.innerHTML = "";
await fetchStudentsFromLocalDisk();
filterAndRenderStudents();
}
if (elements.allStudentsTabButton && elements.addStudentTabButton) {
    elements.allStudentsTabButton.addEventListener("click", showStudentsTab);
    elements.addStudentTabButton.addEventListener("click", showAddStudent);
} else {
    console.error("Tab buttons not found in the DOM.");
}
function createFormField({ label, id, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = "" }) {

    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');

    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', id);
    labelElement.textContent = label;
    formGroup.appendChild(labelElement);

    let inputElement;
    if (type === 'select') {
        inputElement = document.createElement('select');
        inputElement.id = id; // *** THIS IS THE CRUCIAL FIX ***
        inputElement.name = id;
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
        inputElement.id = id; // Other input types need ID too
        inputElement.required = required;

        if (pattern) inputElement.pattern = pattern;
if (minLength !== "") inputElement.minLength = minLength;
if (maxLength !== "") inputElement.maxLength = maxLength;
if (min !== "") inputElement.min = min;
if (max !== "") inputElement.max = max;
if (type === "number") inputElement.step = "1";
inputElement.value = value || ""; 
}

formGroup.appendChild(inputElement);
const errorMessage = document.createElement('span');
errorMessage.classList.add('error-message');
errorMessage.id = `${id}Error`;
formGroup.appendChild(errorMessage);
return formGroup;
}

function renderStudentForm(container, isEdit = false, studentData = {}) {
    if (!container) {
        console.error("Form container not found!");
        return;
    }

    const currentYear = new Date().getFullYear();
const threeYearsAgo = new Date();
threeYearsAgo.setFullYear(currentYear - 3);
const fiveYearsBack = new Date();
fiveYearsBack.setFullYear(currentYear - 5);
threeYearsAgo.setHours(0, 0, 0, 0);

const today = new Date();
today.setHours(23, 59, 59, 999);

const formFields = [
    // Admission Details
    { label: 'Student ID', id: 'studentId', type: 'number', required: true, min: 10000, max: 99999, value: studentData.studentId || '' },
    { label: 'Name of the Student', id: 'studentName', type: 'text', required: true, minLength: 3, value: studentData.studentName || '' },
    { label: 'Admission No.', id: 'admissionNumber', type: 'number', required: false, min: 1000, max: 9999, value: studentData.admissionNumber || '' },
    { label: 'Date of Admission', id: 'dateOfAdmission', type: 'date', required: true, min: threeYearsAgo.toISOString().split('T')[0], max: today.toISOString().split('T')[0], value: studentData.dateOfAdmission || '' },
    
    { label: 'Year', id: 'year', type: 'select', required: true, options: [
        { value: 'first', label: 'First Year' },
        { value: 'second', label: 'Second Year' }
    ], value: studentData.year || 'first' },

    { label: 'Group', id: 'groupName', type: 'select', required: true, options: [
        { value: 'mpc', label: 'MPC' },
        { value: 'bipc', label: 'BiPC' },
        { value: 'mec', label: 'MEC' },
        { value: 'cec', label: 'CEC' }
    ], value: studentData.groupName || '' },

    { label: 'Medium', id: 'medium', type: 'select', required: true, options: [
        { value: 'english', label: 'English' },
        { value: 'telugu', label: 'Telugu' }
    ], value: studentData.medium || 'english' },

    { label: 'Second Language', id: 'secondLanguage', type: 'select', required: true, options: [
        { value: 'sanskrit', label: 'Sanskrit' },
        { value: 'telugu', label: 'Telugu' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'english', label: 'English' }
    ], value: studentData.secondLanguage || 'sanskrit' },

    { label: 'Batch Year', id: 'batchYear', type: 'select', required: true, options: [
        { value: `${currentYear}-${currentYear + 1}`, label: `${currentYear}-${currentYear + 1}` }
    ], value: studentData.batchYear || `${currentYear}-${currentYear + 1}` },

    // Parent Details
    { label: "Father's Name", id: 'fathersName', type: 'text', required: true, minLength: 3, value: studentData.fathersName || '' },
    { label: "Father's Cell No.", id: 'fatherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.fatherCell || '' },

    { label: "Mother's Name", id: 'mothersName', type: 'text', required: true, minLength: 3, value: studentData.mothersName || '' },
    { label: "Mother's Cell No.", id: 'motherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.motherCell || '' },

    // Personal Details
    { label: 'Date of Birth', id: 'dob', type: 'date', required: true, min: '2004-01-01', max: fiveYearsBack.toISOString().split('T')[0], value: studentData.dob || '' },
    { label: 'Nationality', id: 'nationality', type: 'text', required: true, value: studentData.nationality || '' },
    { label: 'Religion', id: 'religion', type: 'text', required: true, value: studentData.religion || '' },
    { label: 'Community', id: 'community', type: 'text', required: true, value: studentData.community || '' },
    { label: 'Mother Tongue', id: 'motherTongue', type: 'text', required: true, value: studentData.motherTongue || '' },

    { label: 'Scholarship', id: 'scholarship', type: 'select', required: true, options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
    ], value: studentData.scholarship || '' },

    { label: "Parent's Annual Income", id: 'parentsIncome', type: 'number', required: true, value: studentData.parentsIncome || '' },
    { label: 'Physically Handicapped', id: 'physicallyHandicapped', type: 'select', required: true, options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
    ], value: studentData.physicallyHandicapped || '' },

    { label: 'Aadhaar (UID)', id: 'aadhaar', type: 'text', required: true, pattern: '\\d{12}', maxLength: 12, value: studentData.aadhaar || '' },
    { label: 'Additional Contact No.', id: 'additionalCell', type: 'text', pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.additionalCell || '' },

    { label: 'Identification Mark 1', id: 'identificationMark1', type: 'text', required: true, value: studentData.identificationMark1 || '' },
    { label: 'Identification Mark 2', id: 'identificationMark2', type: 'text', value: studentData.identificationMark2 || '' },

    // Address Details
    { label: 'House Number', id: 'hno', type: 'text', required: true, value: studentData.hno || '' },
    { label: 'Street', id: 'street', type: 'text', required: true, value: studentData.street || '' },
    { label: 'Village', id: 'village', type: 'text', required: true, value: studentData.village || '' },
    { label: 'Mandal', id: 'mandal', type: 'text', required: true, value: studentData.mandal || '' },
    { label: 'District', id: 'district', type: 'text', required: true, value: studentData.district || '' },
    { label: 'State', id: 'state', type: 'text', required: true, value: studentData.state || '' },
    { label: 'Pincode', id: 'pincode', type: 'text', pattern: '\\d{6}', maxLength: 6, required: true, value: studentData.pincode || '' },

    // Academic Details
    { label: 'Qualifying Exam', id: 'qualifyingExam', type: 'select', required: true, options: [
        { value: 'ssc', label: 'SSC' },
        { value: 'cbse', label: 'CBSE' },
        { value: 'icse', label: 'ICSE' },
        { value: 'others', label: 'Others' }
    ], value: studentData.qualifyingExam || '' },

    { label: 'Year of Exam', id: 'yearOfExam', type: 'number', min: 1900, max: 2100, required: true, value: studentData.yearOfExam || '' },
    { label: 'Hall Ticket Number', id: 'hallTicketNumber', type: 'text', required: true, value: studentData.hallTicketNumber || '' },
    { label: 'GPA', id: 'gpa', type: 'text', required: true, value: studentData.gpa || '' }
];
const form = document.getElementById(isEdit ? 'editStudentForm' : 'addStudentForm') || document.createElement('form');
    form.id = isEdit ? 'editStudentForm' : 'addStudentForm';
    form.removeEventListener('submit', handleFormSubmit);

    container.innerHTML = '';
    form.innerHTML = ''; // Clear existing content

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

    // *** KEY CHANGES AND DEBUGGING ***

    // 1. Populate and Set Values *After* Appending and in a separate function
    function initializeFormValues() {
        formFields.forEach(field => {
            const inputElement = form.querySelector(`#${field.id}`);
            if (inputElement) {
                if (field.type === 'select') {
                    if(field.options) {
                      field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        inputElement.appendChild(optionElement);
                      });
                    }
                    inputElement.value = studentData[field.id] || field.value || ''; // Set value
                } else {
                    inputElement.value = studentData[field.id] || '';
                }
            }
        });

        const batchYearSelect = form.querySelector("#batchYear");
        if (batchYearSelect) {
            populateBatchYearDropdown(batchYearSelect, 2020, 2035);
            batchYearSelect.value = studentData.batchYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        }
    }

    // Call the function to initialize values *after* appending
    setTimeout(initializeFormValues, 0); // Use setTimeout to ensure DOM is ready

    // 2. Event Listener *After* Initialization
    form.addEventListener('submit', handleFormSubmit);

    // *** END OF KEY CHANGES AND DEBUGGING ***
}

function populateBatchYearDropdown(dropdown, startYear, endYear) {
    dropdown.innerHTML = "";
    for (let year = startYear; year <= endYear; year++) {
        const nextYear = (year + 1).toString().slice(-2);
        const batchValue = `${year}-${(year + 1)}`;
        const option = document.createElement("option");
        option.value = batchValue;
        option.textContent = batchValue;
        dropdown.appendChild(option);
    }
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

}
async function handleFormSubmit(event) {
    event.preventDefault();

    const studentData = gatherStudentData(); 


    // Improved Validation (Example - Expand as needed)
    const errors = validateForm(studentData); // See validateForm function below
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors); // See displayFormErrors function below
        return;
    }


    try {
        let result;
        if (event.target.id === 'addStudentForm') {
            result = await window.electron.invoke('addStudent', studentData);
            if (result.success) {
                alert("Student added successfully! ID: " + result.studentId); // Access result.studentId
                event.target.reset();
                await fetchStudentsFromLocalDisk();
                filterAndRenderStudents();
                showStudentsTab();
            } else {
                alert(result.message || "Failed to add student."); // Access result.message
            }
        } else if (event.target.id === 'editStudentForm') {
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

    if (!studentData.studentId) {
        errors.studentId = "Student ID is required.";
    } else if (isNaN(studentData.studentId) || studentData.studentId < 10000 || studentData.studentId > 99999) {
        errors.studentId = "Student ID must be a 5-digit number.";
    }

    if (!studentData.studentName) {
        errors.studentName = "Student Name is required.";
    }

    if (!studentData.aadhaar.match(/^\d{12}$/)) {
        errors.aadhaar = "Aadhaar must be a 12-digit number.";
    }
    if (studentData.parentsIncome !== null && studentData.parentsIncome < 0) {
        errors.parentsIncome = "Annual income cannot be negative.";
    }


    return errors;
}

function displayFormErrors(errors) {
    for (const field in errors) {
        const errorElement = document.getElementById(`${field}Error`); // Assumes error span has id like fieldIdError
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    }
}

function gatherStudentData() {
    const getValue = (id) => document.getElementById(id)?.value?.trim() || "";
    const getNumber = (id) => Number(document.getElementById(id)?.value?.trim()) || null;
    const getSelectValue = (id) => {
        const element = document.getElementById(id);
        if (!element) {  // Debugging: Check if element is found
            console.error(`Element with ID '${id}' not found!`);
            return "";
        }
        const selectedOption = element.options[element.selectedIndex];
        if (!selectedOption) { // Debugging: Check if an option is selected
            console.warn(`No option selected for element with ID '${id}'`);
            return "";
        }
        return selectedOption.value;
    };

    const studentData = {
        studentId: getNumber("studentId"),
        studentName: getValue("studentName"),
        admissionNumber: getNumber("admissionNumber"),
        dateOfAdmission: getValue("dateOfAdmission"),
        year: getSelectValue("year"),
        groupName: getSelectValue("groupName"),
        medium: getSelectValue("medium"),
        secondLanguage: getSelectValue("secondLanguage"),
        batchYear: getSelectValue("batchYear"),
        fathersName: getValue("fathersName"),
        fatherCell: getValue("fatherCell"),
        mothersName: getValue("mothersName"),
        motherCell: getValue("motherCell"),
        dob: getValue("dob"),
        nationality: getValue("nationality"),
        religion: getValue("religion"),
        community: getValue("community"),
        motherTongue: getValue("motherTongue"),
        scholarship: getSelectValue("scholarship"),
        parentsIncome: getNumber("parentsIncome"),
        physicallyHandicapped: getSelectValue("physicallyHandicapped"),
        aadhaar: getValue("aadhaar"),
        additionalCell: getValue("additionalCell"),
        identificationMark1: getValue("identificationMark1"),
        identificationMark2: getValue("identificationMark2"),
        hno: getValue("hno"),
        street: getValue("street"),
        village: getValue("village"),
        mandal: getValue("mandal"),
        district: getValue("district"),
        state: getValue("state"),
        pincode: getNumber("pincode"),
        qualifyingExam: getSelectValue("qualifyingExam"),
        yearOfExam: getNumber("yearOfExam"),
        hallTicketNumber: getValue("hallTicketNumber"),
        gpa: getNumber("gpa"),
    };
    return studentData;
}


if (window.electron) {
    window.electron.receive('error', (errorMessage) => {
        alert("Error: " + errorMessage);
    });
}

let students = [];

async function fetchStudentsFromLocalDisk() {
    try {
        students = await window.electron.invoke('fetchStudents');
        filterAndRenderStudents();
    } catch (error) {
        console.error("Error fetching students from local disk:", error);
        students = [];
    }
}
async function initializeApp() {
    await fetchStudentsFromLocalDisk();
    displayStudents();
}
function displayStudents() {}
initializeApp();

function getSelectedValues(checkboxes) {
    return checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
}
function filterAndRenderStudents() {
    const selectedYears = getSelectedValues([elements.firstYearCheckbox, elements.secondYearCheckbox]);
    const selectedGroups = getSelectedValues([elements.mpcCheckbox, elements.bipcCheckbox, elements.mecCheckbox, elements.cecCheckbox]);

    let filteredStudents = students;
    if (selectedYears.length > 0) {
        filteredStudents = filteredStudents.filter(student => selectedYears.includes(student.year));
    }
    if (selectedGroups.length > 0) {
        filteredStudents = filteredStudents.filter(student => selectedGroups.includes(student.groupName));
    }
    if (filteredStudents.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
    } else {
        renderStudentList(filteredStudents);
    }
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
                <th class="no-sort"><input type="checkbox" id="selectAllCheckbox"></th>
                <th data-column="studentId">ID No</th>
                <th data-column="studentName">Name</th>
                <th data-column="admissionNumber">Admn No</th>
                <th data-column="fatherCell">Contact</th>
                <th data-column="year">Year</th>
                <th data-column="groupName">Group</th>
            </tr>
        </thead>
    `;
    studentTable.innerHTML = headerRow; 
    const tbody = document.createElement('tbody');
    studentTable.appendChild(tbody);

    elements.studentListContainer.appendChild(deleteButton);
    elements.studentListContainer.appendChild(studentTable);

    sortedStudents = [...students]; // Initialize sortedStudents with all students
        updateTableBody(tbody, sortedStudents); // Render initial table

        studentTable.querySelectorAll('th[data-column]').forEach((header) => { // Select sortable headers
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                let sortOrder = header.dataset.sortOrder || 'asc';
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                header.dataset.sortOrder = sortOrder;

                const ascending = sortOrder === 'asc';
                sortedStudents = sortData(sortedStudents, column, ascending); // Sort the stored array
                updateTableBody(tbody, sortedStudents);
            });
        });

        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        selectAllCheckbox.addEventListener('change', (event) => {
            const checkboxes = document.querySelectorAll('.select-student-checkbox');
            checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
        });

        attachRowClickEvents();
    }
    
function attachRowClickEvents() {
    document.querySelectorAll('.student-row').forEach(row => {
        row.addEventListener('click', () => {
            const studentId = row.getAttribute('data-id');
            console.log(`Row clicked: Student ID = ${studentId}`); // Debugging log
            if (studentId) displayStudentData(studentId);
        });
    });
    document.querySelectorAll('.select-student-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
}
function attachRowClickEvents() {
    const rows = document.querySelectorAll('.student-row'); // Get rows *after* they are in the DOM

    rows.forEach(row => {
        // Remove old listener to avoid multiple triggers
        row.removeEventListener('click', handleRowClick); // Clean up old listeners
        row.addEventListener('click', handleRowClick);
    });

    document.querySelectorAll('.select-student-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('click', stopPropagation);
        checkbox.addEventListener('click', stopPropagation);
    });
}
function handleRowClick(event) {
    const row = event.currentTarget; // Use event.currentTarget for the clicked row
    const studentId = row.getAttribute('data-id');
    console.log(`Row clicked: Student ID = ${studentId}`);
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
            <td>${student.year}</td>
            <td>${student.groupName}</td>
        </tr>
    `).join("");
}
function sortData(data, key, ascending = true) {
    const isNumeric = data.every(item => !isNaN(item[key]));
    return data.sort((a, b) => {
        const valueA = isNumeric ? parseFloat(a[key] || 0) : (a[key] || "").toString().toLowerCase();
        const valueB = isNumeric ? parseFloat(b[key] || 0) : (b[key] || "").toString().toLowerCase();
        const comparison = isNumeric ? valueA - valueB : valueA.localeCompare(valueB);
        return ascending ? comparison : -comparison;
    });
}

function updateTableBody(tbody, students) {
    tbody.innerHTML = renderRows(students);
    attachRowClickEvents();
}
function displayStudentData(studentId) {
    console.log(`Displaying student data for ID: ${studentId}`);
    const studentIdNumber = parseInt(studentId, 10); // Convert to number

    const student = students.find(student => student.studentId === studentIdNumber); // Compare as numbers

    if (!student) {
        console.error("Student not found for ID:", studentId); // Important debug log
        elements.studentDataContainer.innerHTML = "<p>Student data not found.</p>"; // Display a message
        return;
    }

    toggleVisibility({ show: [elements.studentDataContainer], hide: [elements.studentListContainer, elements.filtersContainer]});
    elements.studentDataContainer.innerHTML = `
        <h3>Student Details</h3>
        <p><strong>ID:</strong> ${student.studentId}</p>
        <p><strong>Name:</strong> ${student.studentName}</p>
        <p><strong>Admission No:</strong> ${student.admissionNumber}</p>
        <p><strong>Contact:</strong> ${student.fatherCell}</p>
        <p><strong>Year:</strong> ${student.year}</p>
        <p><strong>Group:</strong> ${student.groupName}</p>
        <p><strong>Medium:</strong> ${student.medium}</p>
        <p><strong>Batch Year:</strong> ${student.batchYear}</p>
        <button id="editStudentButton" class="edit-button" data-student-id="${student.studentId}">Edit</button>
    `;
    const editButton = document.getElementById("editStudentButton");

    if (editButton) {
        editButton.removeEventListener("click", showEditStudent); // Ensure no previous listener
        editButton.addEventListener("click", () => showEditStudent(student)); // Directly call showEditStudent
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
        const result = await window.electron.invoke('deleteStudents', selectedIds); // Send the array!

        if (result.success) {
            alert(`${selectedIds.length} student(s) deleted successfully.`);
            await fetchStudentsFromLocalDisk();
            filterAndRenderStudents();
        } else {
            alert(result.message || "Failed to delete students."); // Show the error message from main
        }

    } catch (error) {
        console.error("Error deleting students:", error);
        alert(`An error occurred while deleting students: ${error.message}`);
    }
}
}
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