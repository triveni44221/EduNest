import { fetchStudentsFromLocalDisk, updatePagination, filterAndRenderStudents, students, } from './studentsData.js';
import { calculatePageNumbers } from '../utils/uiUtils.js';
import { showEditStudent } from './students.js';
import { renderStudentForm } from './studentsForm.js';
import { currentPage, studentsPerPage, totalPages } from '../utils/uiUtils.js';
import { displayStudentData, renderRows, attachRowClickEvents } from './studentsUI.js';
import { toggleVisibility, getElementsByDataAttribute } from '../utils/uiUtils.js';
import { sortData } from '../utils/uiUtils.js';
import { deleteSelectedStudents } from './studentsEvents.js';


let elements = getElementsByDataAttribute('data-element');
let sortedStudents = [];


export function toggleVisibility({ show = [], hide = [] }) {
    show.forEach((element) => element?.classList.remove('hidden'));
    hide.forEach((element) => element?.classList.add('hidden'));
}

export function setActiveTab({ activeButton, inactiveButton, visibility = { show: [], hide: [] } }) {
    toggleVisibility(visibility);
    activeButton.classList.add('active');
    inactiveButton.classList.remove('active');
}

export async function showStudentsTab() {
    setActiveTab({
        activeButton: elements['allStudentsTabButton'],
        inactiveButton: elements['addStudentTabButton'],
        visibility: {
            show: [elements['allStudentsTab'], elements['filtersContainer'], elements['studentListContainer']],
            hide: [elements['addStudentTab'], elements['studentDataContainer']],
        },
    });

    elements['studentDataContainer'].innerHTML = '';
    await fetchStudentsFromLocalDisk();

    updatePagination();
}

export function showAddStudent() {
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

export function showEditStudent(studentData) {
    setActiveTab({
        activeButton: elements.addStudentTabButton,
        inactiveButton: elements.allStudentsTabButton,
        visibility: {
            show: [elements.addStudentTab],
            hide: [elements.allStudentsTab]
        }   
    });
}

export function displayStudentData(studentId) {
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

export handleEditButtonClick(event) {
    if (event.target.dataset.element === "editStudentButton") {
        const studentId = event.target.dataset.studentId;
        const student = students.find(student => student.studentId === parseInt(studentId, 10));
        if (student) {
            showEditStudent(student);
        }
    }
}

export function renderStudentList(students) {
    // Implement logic to render the student list table
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class Year</th>
                    <th>Group</th>
                </tr>
            </thead>
            <tbody data-element="studentTableBody">
            </tbody>
        </table>
    `;
    elements.studentListContainer.innerHTML = tableHTML;
    renderRows(students);
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
}

export function addPaginationControls() {
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.setAttribute('data-element', 'paginationContainer');
    elements.studentListContainer.parentNode.insertBefore(paginationContainer, elements.studentListContainer.nextSibling);

    elements = getElementsByDataAttribute('data-element');

    renderPaginationButtons();
}

export function renderPaginationButtons() {
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
    pageNumbers.forEach((pageNumber) => {
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

export function updatePagination() {
    addPaginationControls();
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
    return students
        .map(
            (student) => `
        <tr class="student-row" data-id="${student.studentId}">
            <td><input type="checkbox" class="select-student-checkbox" data-id="${student.studentId}"></td>
            <td>${student.studentId}</td>
            <td>${student.studentName}</td>
            <td>${student.admissionNumber}</td>
            <td>${student.fatherCell}</td>
            <td>${student.classYear}</td>
            <td>${student.groupName}</td>
        </tr>
    `
        )
        .join('');
}

export function updateTableBody(tbody, students) {
    tbody.innerHTML = renderRows(students);
    attachRowClickEvents();
}