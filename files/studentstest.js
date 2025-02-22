function getElementsByIds(ids) {
    return ids.reduce((acc, id) => {
        acc[id] = document.getElementById(id);
        return acc;
    }, {});
}
function initializeStudentsPage() {
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
async function showAllStudentsContent() {
    setActiveTab({
        activeButton: elements.allStudentsTabButton,
        inactiveButton: elements.addStudentTabButton,
        visibility: {
            show: [elements.allStudentsTab],
            hide: [elements.addStudentTab]
        }
    });
    elements.studentDataContainer.innerHTML = "";
    try {
        students = await window.electron.invoke('fetchStudents');
        filterAndRenderStudents();
    } catch (error) {
        console.error("Error loading student data:", error);
        elements.studentListContainer.innerHTML = '<p>Error loading student data. Please try again.</p>';
    }
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
        inputElement.id = id;
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
        inputElement.id = id;
        inputElement.required = required;

        if (pattern) inputElement.pattern = pattern;
        if (minLength) inputElement.minLength = minLength;
        if (maxLength) inputElement.maxLength = maxLength;
        if (min) inputElement.min = min;
        if (max) inputElement.max = max;
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

    const formFields = [
        { label: 'Student ID', id: 'studentId', type: 'number', required: true, min: 10000, max: 99999, value: studentData.studentId || '' },
        { label: 'Name of the Student', id: 'studentName', type: 'text', required: true, value: studentData.studentName || '' },
        { label: 'Admission No.', id: 'admissionNumber', type: 'number', required: true, min: 1000, max: 9999, value: studentData.admissionNumber || '' },
        { label: 'Contact Number', id: 'contactNumber', type: 'text', required: true, pattern: '^[6-9]\\d{9}$', minLength: 10, maxLength: 10, value: studentData.contactNumber || '' },
        { label: 'Year', id: 'year', type: 'select', required: true, options: [
            { value: 'first', label: 'First Year' },
            { value: 'second', label: 'Second Year' }
        ], value: studentData.year || '' },
        { label: 'Group', id: 'group', type: 'select', required: true, options: [
            { value: 'mpc', label: 'MPC' },
            { value: 'bipc', label: 'BiPC' },
            { value: 'mec', label: 'MEC' },
            { value: 'cec', label: 'CEC' }
        ], value: studentData.group || '' },
        { label: 'Medium', id: 'medium', type: 'select', required: true, options: [
            { value: 'english', label: 'English' },
            { value: 'telugu', label: 'Telugu' }
        ], value: studentData.medium || '' },
        { label: 'Batch Year', id: 'batchYear', type: 'select', required: true, options: [], value: studentData.batchYear || '' }
    ];

    const form = document.getElementById(isEdit ? 'editStudentForm' : 'addStudentForm') || document.createElement('form');
        form.id = isEdit ? 'editStudentForm' : 'addStudentForm';
        form.addEventListener('submit', handleFormSubmit);
        if (!form.parentNode) {
            formFields.forEach(field => {
                const formField = createFormField(field);
                form.appendChild(formField);
            });

            const submitButton = document.createElement('button');
            submitButton.type = 'submit';
            submitButton.className = 'submit-button';
            submitButton.textContent = isEdit ? 'Update' : 'Submit';
            form.appendChild(submitButton);

            container.innerHTML = ''; 
            container.appendChild(form);
        } else {
            formFields.forEach(field => {
                const inputElement = form.querySelector(`#${field.id}`);
                if (inputElement) {
                    inputElement.value = studentData[field.id] || '';
                }
            });
        }

    const batchYearSelect = document.getElementById("batchYear");
    populateBatchYearDropdown(batchYearSelect, 2020, 2035);

if (studentData.batchYear) {
    batchYearSelect.value = studentData.batchYear;
}
}

function populateBatchYearDropdown(dropdown, startYear, endYear) {
    for (let year = startYear; year <= endYear; year++) {
        const nextYear = (year + 1).toString().slice(-2);
        const batchValue = `${year}-${nextYear}`;
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
function handleFormSubmit(event) {
    event.preventDefault();

    if (event.target.id === 'addStudentForm') {
        const studentData = gatherStudentData();
        if (Object.values(studentData).some(val => val === "")) {
            alert("Please fill in all the fields.");
            return;
        }
        window.electron.send('addStudent', studentData);
    } else if (event.target.id === 'editStudentForm') {
        const studentData = gatherStudentData();

        if (Object.values(studentData).some(val => val === "")) {
            alert("Please fill in all the fields.");
            return;
        }

        window.electron.invoke('updateStudent', studentData)
            .then(response => {
                if (response.success) {
                    alert('Student updated successfully!');
                    fetchStudentsFromLocalDisk()
                        .then(() => {
                            filterAndRenderStudents(); // Re-render the student list
                            displayStudentData(studentData.studentId); // Display the updated student details
                            showStudentsTab(); // Switch back to the student list tab.
                        });
                } else {
                    console.error('Failed to update student:', response.message);
                    alert('Failed to update student.');
                }
            })
            .catch(error => {
                console.error("Error updating student:", error);
                alert('An error occurred while updating the student.');
            });
    }
}

function gatherStudentData() {
    return {
        studentId: document.getElementById("studentId").value.trim(),
        studentName: document.getElementById("studentName").value.trim(),
        admissionNumber: document.getElementById("admissionNumber").value.trim(),
        contactNumber: document.getElementById("contactNumber").value.trim(),
        year: document.getElementById("year").value,
        group: document.getElementById("group").value,
        medium: document.getElementById("medium").value,
        batchYear: document.getElementById("batchYear").value,
    };
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
        filteredStudents = filteredStudents.filter(student => selectedGroups.includes(student.group));
    }
    if (filteredStudents.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
    } else {
        renderStudentList(filteredStudents);
    }
}
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
                <th data-column="contactNumber">Contact</th>
                <th data-column="year">Year</th>
                <th data-column="group">Group</th>
            </tr>
        </thead>
    `;
    studentTable.innerHTML = headerRow + `<tbody>${renderRows(students)}</tbody>`;
    elements.studentListContainer.innerHTML = '';
    elements.studentListContainer.appendChild(deleteButton);
    elements.studentListContainer.appendChild(studentTable);
    studentTable.querySelectorAll('th').forEach((header) => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            if (column === sortedColumn) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortOrder = 'asc';
                sortedColumn = column;
            }
            const ascending = sortOrder === 'asc';
            const sortedStudents = sortData(students, column, ascending);
            studentTable.querySelector('tbody').innerHTML = renderRows(sortedStudents);
            attachRowClickEvents();
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
            displayStudentData(studentId);
        });
    });
    document.querySelectorAll('.select-student-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
}
function renderRows(students) {
    return students.map(student => `
        <tr class="student-row" data-id="${student.studentId}">
            <td><input type="checkbox" class="select-student-checkbox" data-id="${student.studentId}"></td>
            <td>${student.studentId}</td>
            <td>${student.studentName}</td>
            <td>${student.admissionNumber}</td>
            <td>${student.contactNumber}</td>
            <td>${student.year}</td>
            <td>${student.group}</td>
        </tr>
    `).join("");
}
function compareValues(key, order = 'asc') {
    return function (a, b) {
        const varA = a[key] ? a[key].toString().toLowerCase() : '';
        const varB = b[key] ? b[key].toString().toLowerCase() : '';
        const isNumeric = !isNaN(varA) && !isNaN(varB);

        let comparison = 0;
        if (isNumeric) {
            comparison = parseFloat(varA) - parseFloat(varB);
        } else {
            comparison = varA.localeCompare(varB);
        }

        return order === 'desc' ? comparison * -1 : comparison;
    };
}
document.addEventListener("DOMContentLoaded", () => {
    const headers = document.querySelectorAll(".student-table th");
        headers.forEach(header => {
        header.addEventListener("click", () => {
            const table = header.closest("table");
            const columnIndex = Array.from(header.parentElement.children).indexOf(header);
            const columnKey = header.getAttribute("data-column");
            const isAscending = header.classList.contains("sorted-asc");

            headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));

            header.classList.toggle("sorted-asc", !isAscending);
            header.classList.toggle("sorted-desc", isAscending);

            const sortedRows = sortData(Array.from(table.querySelector("tbody").rows), columnKey, !isAscending);
            const tbody = table.querySelector("tbody");
            tbody.innerHTML = sortedRows.map(row => row.outerHTML).join("");
        });
    });
});
    function sortData(data, key, ascending = true) {
    const isNumeric = data.every(item => !isNaN(item[key]));
    return data.sort((a, b) => {
        const valueA = isNumeric ? parseFloat(a[key] || 0) : (a[key] || "").toString().toLowerCase();
        const valueB = isNumeric ? parseFloat(b[key] || 0) : (b[key] || "").toString().toLowerCase();
        const comparison = isNumeric ? valueA - valueB : valueA.localeCompare(valueB);
        return ascending ? comparison : -comparison;
    });
}   
function displayStudentData(studentId) {
    const student = students.find(student => student.studentId === studentId);
    if (!student) {
        return;
    }

    toggleVisibility({ show: [elements.studentDataContainer], hide: [elements.studentListContainer, elements.filtersContainer]});
    elements.studentDataContainer.innerHTML = `
        <h3>Student Details</h3>
        <p><strong>ID:</strong> ${student.studentId}</p>
        <p><strong>Name:</strong> ${student.studentName}</p>
        <p><strong>Admission No:</strong> ${student.admissionNumber}</p>
        <p><strong>Contact:</strong> ${student.contactNumber}</p>
        <p><strong>Year:</strong> ${student.year}</p>
        <p><strong>Group:</strong> ${student.group}</p>
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

function deleteSelectedStudents(students) {
    const selectedCheckboxes = document.querySelectorAll('.select-student-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('No students selected for deletion.');
        return;
    }
        const confirmation = confirm('Are you sure you want to delete the selected students? This action cannot be undone.');

    if (confirmation) {
        const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

        const remainingStudents = students.filter(student => !selectedIds.includes(student.studentId));
    window.electron.send('updateStudents', remainingStudents);
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