import { fetchStudentsFromLocalDisk, filterAndRenderStudents } from './studentsData.js';
import { showEditStudent } from './studentsForm.js';
import { renderStudentForm } from './studentsForm.js';
import { toggleVisibility} from '../utils/uiUtils.js';
import { elements, initializeElements } from './studentsElements.js';
import { formatStudentData } from '../utils//dataUtils.js';
import { deleteSelectedStudents } from './studentsEvents.js' ;

export function setActiveTab({ activeButton, inactiveButton, visibility = { show: [], hide: [] } }) {
    toggleVisibility(visibility);
    activeButton.classList.add('active');
    inactiveButton.classList.remove('active');
}
let students = [];

export function attachEventListeners() {
    console.log('studentsUI.js: attachEventListeners() start');
    const filterCheckboxes = [
        'firstYearCheckbox', 'secondYearCheckbox', 
        'mpcCheckbox', 'bipcCheckbox', 'mecCheckbox', 'cecCheckbox'
    ];

    filterCheckboxes.forEach(id => {
        const checkbox = elements[id];
        if (checkbox) {
            checkbox.removeEventListener('change', filterAndRenderStudents);
            checkbox.addEventListener('change', () => filterAndRenderStudents(1));
        }
    });

    const tabButtons = {
        allStudentsTabButton: showStudentsTab,
        addStudentTabButton: showAddStudent
    };

    Object.entries(tabButtons).forEach(([id, handler]) => {
        if (elements[id]) {
            elements[id].removeEventListener('click', handler);
            elements[id].addEventListener('click', handler);
        } else {
            console.error(`❌ Element ${id} not found.`);
        }
    });
    console.log('studentsUI.js: attachEventListeners() end');
}

export async function showStudentsTab() {
    console.log('studentsUI.js: showStudentsTab() start');
        attachEventListeners();

    if (!elements.allStudentsTabButton || !elements.addStudentTabButton) {
        console.error('Students tab elements not found.');
        return;
    }

    setActiveTab({
        activeButton: elements.allStudentsTabButton,
        inactiveButton: elements.addStudentTabButton,
        visibility: {
            show: [elements.allStudentsTab, elements.filtersContainer, elements.studentListContainer],
            hide: [elements.addStudentTab, elements.studentDataContainer],
        },
    });

    if (elements.studentDataContainer) {
        elements.studentDataContainer.innerHTML = '';
    }
    try {
        students = await fetchStudentsFromLocalDisk(); // Ensure students is global

        if (!students || students.length === 0) {
            console.warn("⚠️ No students found after fetching.");
        } else {
            renderStudentList(students); // Renders the table
            attachRowClickEvents(); // Attach listeners AFTER data loads
        }
    } catch (error) {
        console.error('❌ Error fetching students:', error);
    }
    console.log('studentsUI.js: showStudentsTab() end');
}

export function showAddStudent() {
    console.log('studentsUI.js: showAddStudent() start');
    initializeElements();

    if (!elements.addStudentTabButton || !elements.allStudentsTabButton) {
        console.error('Add student tab elements not found.');
        return;
    }

    const currentForm = elements.addStudentFormContainer.querySelector('form');
    const isEditForm = currentForm && currentForm.dataset.formType === 'edit';

    if (isEditForm) {
        // Clear only if switching from edit to add
        elements.addStudentFormContainer.innerHTML = '';
        renderStudentForm(elements.addStudentFormContainer);
    } else if (!currentForm) {
        // Render if no form exists
        renderStudentForm(elements.addStudentFormContainer);
    }

    // Restore form data unconditionally
    restoreFormData();

    setActiveTab({
        activeButton: elements.addStudentTabButton,
        inactiveButton: elements.allStudentsTabButton,
        visibility: {
            show: [elements.addStudentTab],
            hide: [elements.allStudentsTab],
        },
    });

    saveFormData();
    console.log('studentsUI.js: showAddStudent() end');
}

export function saveFormData() {
    const formData = {};
    document.querySelectorAll("[data-form-field]").forEach(field => {
        formData[field.name] = field.value;
    });
    localStorage.setItem("addStudentFormData", JSON.stringify(formData));
}
export function restoreFormData() {
    const formData = JSON.parse(localStorage.getItem("addStudentFormData") || "{}");
    document.querySelectorAll("[data-form-field]").forEach(field => {
        if (formData[field.name]) {
            field.value = formData[field.name];
        }
    });
}

export function displayStudentData(studentId) {
       const student = students.find(student => String(student.studentId) === String(studentId));

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

export function handleEditButtonClick(event) {
    if (event.target.dataset.element === "editStudentButton") {
        const studentId = event.target.dataset.studentId;
        const student = students.find(student => student.studentId === parseInt(studentId, 10));
        if (student) {
            showEditStudent(student);
        }
    }
}

let sortedStudents = [];

export function renderStudentList(students) {
 
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
 
    const selectAllCheckbox = studentTable.querySelector('input[data-element="selectAllCheckbox"]');

if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (event) => {
        const checkboxes = document.querySelectorAll('.select-student-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
    });
} else {
    console.error("Select all checkbox not found in the table.");
}
    attachRowClickEvents();

}

export function attachRowClickEvents() {
    const rows = document.querySelectorAll('.student-row');

    rows.forEach((row) => {
        row.removeEventListener('click', handleRowClick);
        row.addEventListener('click', handleRowClick);
    });

    document.querySelectorAll('.select-student-checkbox').forEach((checkbox) => {
        checkbox.removeEventListener('click', stopPropagation);
        checkbox.addEventListener('click', stopPropagation);
    });
    elements.studentDataContainer.addEventListener("click", handleEditButtonClick); //Add event listener here
}
function handleRowClick(event) {
    const row = event.currentTarget;
    const studentId = row.getAttribute('data-id');

    if (!students || students.length === 0) {
        console.error("❌ No students found! Check if data is loaded.");
        return;
    }

    const student = students.find(s => String(s.studentId) === String(studentId));

    if (!student) {
        console.warn(`⚠️ Student not found for ID: ${studentId}`);
        return;
    }

    displayStudentData(student.studentId);  // Pass the full student object
}

function stopPropagation(event) {
    event.stopPropagation();
}

function renderRows(students) {
   
    const rowsHtml = students
        .map((student) => {
            const formattedStudent = formatStudentData(student);

            return `
                <tr class="student-row" data-id="${formattedStudent.studentId}">
                    <td><input type="checkbox" class="select-student-checkbox" data-id="${formattedStudent.studentId}"></td>
                    <td>${formattedStudent.studentId}</td>
                    <td>${formattedStudent.studentName}</td>
                    <td>${formattedStudent.admissionNumber || '—'}</td>
                    <td>${formattedStudent.fatherCell}</td>
                    <td>${formattedStudent.classYear}</td>
                    <td>${formattedStudent.groupName}</td>
                </tr>
            `;
        })
        .join('');
    return rowsHtml;
}

export function updateTableBody(tbody, students) {
    const formattedStudents = students.map(formatStudentData); // Apply formatting to all students
    tbody.innerHTML = renderRows(formattedStudents);
    attachRowClickEvents();
}