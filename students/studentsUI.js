import { fetchStudentsFromLocalDisk, filterAndRenderStudents } from './studentsData.js';
import TabManager, { createTabButton, createTabContent } from '../utils/tabManager.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import { showEditStudent } from './studentsForm.js';
import { renderStudentForm } from './studentsForm.js';
import { toggleVisibility, sortData, normalizeString, capitalizeFirstLetter, displayStudentPhoto, renderPaginationControls} from '../utils/uiUtils.js';
import { elements, initializeElements } from '../utils/sharedElements.js';
import { formatStudentData } from '../utils//dataUtils.js';
import { deleteSelectedStudents } from './studentsEvents.js' ;
import { studentTabManager, initializeStudentsPage } from './students.js';

let students = [];

export async function showStudentsTab(studentTabManager) {
    initializeEventListeners(studentTabManager);

    if (!elements.allStudentsTabButton || !elements.addStudentTabButton) {
        console.error('Students tab elements not found.');
        return;
    }
    // ✅ Ensure tabManager is initialized before switching tabs
    if (studentTabManager) {
        studentTabManager.switchTab(elements.allStudentsTabButton);
    } else {
        console.error('❌ studentTabManager is not initialized.');
    }

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
}

export function showAddStudent(studentTabManager) {
    initializeElements();
    console.log("showaddstudent called");

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

   // Switch to the "Add Student" tab using TabManager
   if (studentTabManager) {
    studentTabManager.switchTab(elements.addStudentTabButton);
} else {
    console.error('❌ studentTabManager is not initialized.');
}
    saveFormData();
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

export function formatStudentDetails(student) {
    const formattedData = new Map();

    Object.entries(student).forEach(([key, value]) => {
        let formattedValue = value || "N/A";

        if (["classYear", "gender"].includes(key)) {
            formattedValue = capitalizeFirstLetter(normalizeString(value));
        } else if (key === "groupName") {
            formattedValue = value ? value.toUpperCase() : "";
        }

        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        formattedData.set(normalizeString(key), { label, value: formattedValue });
    });

    if (student.nationality === "others" && student.otherNationality) {
        const nationalityItem = formattedData.get("nationality");
        if (nationalityItem) {
            nationalityItem.value = student.otherNationality;
        }
    }

    if(student.perm_hno){
        formattedData.set("perm_hno", {label: "Permanent House Number", value: student.perm_hno});
        formattedData.set("perm_street", {label: "Permanent Street", value: student.perm_street});
        formattedData.set("perm_village", {label: "Permanent Village", value: student.perm_village});
        formattedData.set("perm_mandal", {label: "Permanent Mandal", value: student.perm_mandal});
        formattedData.set("perm_district", {label: "Permanent District", value: student.perm_district});
        formattedData.set("perm_state", {label: "Permanent State", value: student.perm_state});
        formattedData.set("perm_pincode", {label: "Permanent Pincode", value: student.perm_pincode});
    }

    return formattedData;
}

function renderStudentSections(formattedData, photoHtml) {
    const sections = {
        "Admission Details": ["studentId", "studentName", "admissionNumber", "dateOfAdmission", "classYear", "groupName", "medium", "secondLanguage", "batchYear"],
        "Academic Details": ["qualifyingExam", "gpa", "yearOfExam", "hallTicketNumber"],
        "Personal Details": ["dob", "nationality", "religion", "community", "motherTongue", "additionalCell", "scholarship", "parentsIncome", "physicallyHandicapped", "aadhaar", "identificationMark1", "identificationMark2"],
        "Parent Details": ["fathersName", "mothersName", "fatherCell", "motherCell", "fatherOccupation", "motherOccupation"],
        "Address Details": ["hno", "perm_hno", "street", "perm_street", "village", "perm_village", "mandal", "perm_mandal", "district", "perm_district", "state", "perm_state", "pincode", "perm_pincode"],
    };

    return Object.entries(sections)
        .map(([sectionName, keys]) => {
            const sectionHtml = keys
                .map(key => {
                    const item = formattedData.get(key.toLowerCase());
                    if (!item) return "";

                    if (key === "identificationMark1" || key === "identificationMark2") {
                        return `
                            <div class="identification-mark-row">
                                <dt class="identification-label">${item.label}:</dt>
                                <dd class="identification-value">${item.value}</dd>
                            </div>
                        `;
                    }

                    return `<dt>${item.label}:</dt><dd>${item.value}</dd>`;
                })
                .join("");

            if (sectionName === "Admission Details") {
                return `
                    <div class="student-section admission-container">
                        <h4>${sectionName}</h4>
                        <div class="admission-details">
                            <dl>${sectionHtml}</dl>
                            <div class="photo-container">
                                ${photoHtml}
                            </div>
                        </div>
                    </div>
                `;
            }
            return sectionHtml ? `<div class="student-section student-details"><h4>${sectionName}</h4><dl>${sectionHtml}</dl></div>` : "";
        })
        .join("");
}

export function handleEditButtonClick(event) {
    if (event.target.dataset.element === "editStudentButton") {
        const studentId = event.target.dataset.studentId;
        const student = students.find(student => student.studentId === parseInt(studentId, 10));
        if (student) {
            console.log("Calling showEditStudent with:", studentTabManager);
            showEditStudent(studentTabManager, student);
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
    renderPaginationControls();

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
export function displayStudentData(studentId) {
    const student = students.find(student => String(student.studentId) === String(studentId));

    if (!student) {
        console.error("Student not found for ID:", studentId);
        elements.studentDataContainer.innerHTML = "<p>Student data not found.</p>";
        return;
    }

    // Hide filters and student list, show student details
    toggleVisibility({
        show: [elements.studentDataContainer],
        hide: [elements.studentListContainer, elements.filtersContainer, elements.paginationContainer]
    });

    // Initialize student tabs (which will load basic details when clicked)
    displayStudentTabs(student);
}

function displayStudentTabs(student) {
    console.log("📌 Running displayStudentTabs for student:", student);

    const studentDataContainer = elements.studentDataContainer;
    if (!studentDataContainer) {
        console.error("❌ studentDataContainer not found!");
        return;
    }

    // Clear previous content
    studentDataContainer.innerHTML = "";

    // Create a container for tabs and tab content
    const tabContainer = document.createElement("div");
    tabContainer.classList.add("tab-container");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("tab-content-container");

    // Tab configuration (IDs should match existing logic)
    const tabConfig = [
        { id: 'basicDetailsTab', label: 'Basic Details' },
        { id: 'feeTab', label: 'Fee' },
        { id: 'academicsTab', label: 'Academics' },
        { id: 'attendanceTab', label: 'Attendance' },
        { id: 'certificatesTab', label: 'Certificates' }
    ];

    // Generate tabs and contents
    const tabButtons = [];
    const tabContents = [];

    tabConfig.forEach(({ id, label }) => {
        const button = createTabButton(id, label);
        tabButtons.push(button);
        tabContainer.appendChild(button);

        const content = createTabContent(id + "Content");
        tabContents.push(content);
        contentContainer.appendChild(content);
    });

    // Append tabs and content to the container
    studentDataContainer.appendChild(tabContainer);
    studentDataContainer.appendChild(contentContainer);

    // Initialize TabManager for dynamic switching
    new TabManager(tabButtons, tabContents, tabButtons[0]);

    // Load Basic Details content when the tab is clicked
    tabButtons[0].addEventListener("click", () => loadBasicDetailsContent(student, tabContents[0]));

    // Auto-click Basic Details to load content on render
    tabButtons[0].click();
}

function loadBasicDetailsContent(student, contentContainer) {
    if (contentContainer.innerHTML.trim() !== "") return; // Prevent reloading

    const formattedData = formatStudentDetails(student);
    const photoContainer = document.createElement('div');

    displayStudentPhoto(student, photoContainer).then(() => {
        const photoHtml = photoContainer.innerHTML;

        contentContainer.innerHTML = `
            <div class="student-details-header">
                <h3>Student Details</h3>
                <button data-element="editStudentButton" class="edit-button" data-student-id="${student.studentId}">Edit</button>
            </div>
            ${renderStudentSections(formattedData, photoHtml)}
        `;
    });
}

function handleRowClick(event) {
    const row = event.currentTarget;
    const studentId = row.getAttribute('data-id');
    console.log(`🖱 Row clicked! Student ID: ${studentId}`);
    if (!students || students.length === 0) {
        console.error("❌ No students found! Check if data is loaded.");
        return;
    }

    const student = students.find(s => String(s.studentId) === String(studentId));

    if (!student) {
        console.warn(`⚠️ Student not found for ID: ${studentId}`);
        return;
    }
    console.log("📌 Calling displayStudentTabs...");

    displayStudentData(studentId); // Pass the full student object to display tabs

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