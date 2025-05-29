import { filterAndRenderStudents, students } from './studentsData.js';
import TabManager, { createTabButton, createTabContent } from '../utils/tabManager.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import { renderStudentForm, showEditStudent } from './studentsForm.js';
import { toggleVisibility, sortData } from '../utils/uiUtils.js';
import { elements, updateElements } from '../utils/sharedElements.js';
import { formatStudentData } from '../utils//dataUtils.js';
import { createAddStudentButton , createDeleteButton} from '../utils//formUtils.js';
import { loadFeeDetailsContent, showEditFeeForm } from "../fees/fees.js";
import { studentTabManager } from './students.js';
import { capitalizeFirstLetter, normalizeString } from '../utils/dataUtils.js';
import { removeFiltersFromAllTabs } from '../utils/filters.js';


let sortedStudents = [];

export async function showStudentsTab(studentTabManager) {
    initializeEventListeners(studentTabManager);

    if (!elements.allStudentsTabButton) {
        console.error('Students tab button not found.');
        return;
    }
    if (studentTabManager) {
        studentTabManager.switchTab(elements.allStudentsTabButton);
    } else {
        console.error('❌ studentTabManager is not initialized.');
    }

    if (elements.studentDataContainer) {
        elements.studentDataContainer.innerHTML = '';
    }
    try {
        await filterAndRenderStudents();
        attachRowClickEvents();
    } catch (error) {
        console.error('❌ Error fetching students:', error);
    }
    
}

export function showAddStudent() {
    updateElements();
    removeFiltersFromAllTabs();

    
    const currentForm = elements.addStudentFormContainer.querySelector('form');
    const isEditForm = currentForm && currentForm.dataset.formType === 'edit';

    if (!currentForm || isEditForm) {
        elements.addStudentFormContainer.innerHTML = '';
        renderStudentForm(elements.addStudentFormContainer);
    }
    
    toggleVisibility({
        show: [elements.studentDataContainer, elements.addStudentFormContainer],
        hide: [elements.studentListContainer, elements.studentsFiltersContainer,elements.controlsContainer, elements.paginationContainer]
    });
    
    restoreFormData();
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

        if (key === "classYear") {
            formattedValue = formatOrdinalClassYear(value);
        } else if (key === "gender") {
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

function formatOrdinalClassYear(year) {
    const ordinalMap = {
        "first": "1<sup>st</sup>",
        "second": "2<sup>nd</sup>",
        "third": "3<sup>rd</sup>",
        "fourth": "4<sup>th</sup>"
    };
    const normalizedYear = normalizeString(year);
    const ordinal = ordinalMap[normalizedYear] ? ordinalMap[normalizedYear] : year;

    return `<span class="ordinal-year">${ordinal}</span>`;
}

export function renderStudentList(students) {
    elements.studentListContainer.innerHTML = '';

    toggleVisibility({ 
        show: [elements.studentListContainer, elements.studentsFiltersContainer, elements.controlsContainer], 
        hide: [elements.studentDataContainer, elements.addStudentFormContainer] 
    });

    if (students.length === 0) {
        elements.studentListContainer.innerHTML = '<p>No students found.</p>';
        return;
    }

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
        updateElements();
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

export function handleEditButtonClick(event) {
    const { element: targetElement, studentId } = event.target.dataset;
    if (!studentId) return;

    const student = students.find(s => s.studentId === parseInt(studentId, 10));
    if (!student) return;

    if (targetElement === "editStudentButton") {
        showEditStudent(studentTabManager, student);
    } else if (targetElement === "editFeeButton") {
        showEditFeeForm(student, showEditFeeForm);
    }
}

export function displayStudentData(studentId) {
    removeFiltersFromAllTabs();  
    const student = students.find(student => String(student.studentId) === String(studentId));

    if (!student) {
        console.error("Student not found for ID:", studentId);
        elements.studentDataContainer.innerHTML = "<p>Student data not found.</p>";
        return;
    }
    updateElements();

    toggleVisibility({
        show: [elements.studentDataContainer],
        hide: [elements.studentListContainer,elements.addStudentFormContainer, elements.studentsFiltersContainer,elements.controlsContainer, elements.paginationContainer]
    });
    displayStudentTabs(student);
}

export function displayStudentTabs(student) {

    const studentDataContainer = elements.studentDataContainer;
    if (!studentDataContainer) {
        console.error("❌ studentDataContainer not found!");
        return;
    }

    studentDataContainer.innerHTML = "";

    // Create tab container
    const tabContainer = document.createElement("div");
    tabContainer.classList.add("tab-container");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("tab-content-container");

    // Format student details
    const formattedData = formatStudentDetails(student);
    const studentName = formattedData.get("studentname")?.value || "N/A";
    const classYear = formattedData.get("classyear")?.value || "N/A";
    const groupName = formattedData.get("groupname")?.value || "N/A";
    const studentId = student.studentId || "N/A";

    const studentPrimaryContainer = document.createElement("div");
studentPrimaryContainer.classList.add("student-primary-container");

studentPrimaryContainer.innerHTML = `
    <div class="student-info-container">
        <span class="student-id">${studentId}</span>
        <span class="infoSeparator">-</span>
        <span class="student-name">${studentName}</span>
        <span class="infoSeparator">-</span>
        <span class="student-class">${formatOrdinalClassYear(classYear)} Year ${groupName}</span>
    </div>
`;

    const tabConfig = [
        { id: 'basicDetailsTab', label: 'Basic Details', loader: loadBasicDetailsContent },
        { id: 'feeTab', label: 'Fee', loader: loadFeeDetailsContent },
        { id: 'academicsTab', label: 'Academics', loader: loadAcademicsContent },
        { id: 'attendanceTab', label: 'Attendance', loader: loadAttendanceContent },
        { id: 'certificatesTab', label: 'Certificates', loader: loadCertificatesContent }
    ];

    const tabButtons = [];
    const tabContents = [];
    const contentLoaders = {};

    tabConfig.forEach(({ id, label, loader }) => {
        const button = createTabButton(id, label);
        tabButtons.push(button);
        tabContainer.appendChild(button);

        const content = createTabContent(id + "Content");
        tabContents.push(content);
        contentContainer.appendChild(content);

        if (loader) {
            contentLoaders[id] = (container) => loader(student, container);
        }
    });

    // Append elements in order: Tabs → Student Info → Tab Content
    studentDataContainer.appendChild(tabContainer);
    studentDataContainer.appendChild(studentPrimaryContainer);
    studentDataContainer.appendChild(contentContainer);

    // Initialize TabManager
    new TabManager(tabButtons, tabContents, tabButtons[0], contentLoaders);

    // Auto-click first tab
    tabButtons[0].click();
    updateElements();
}

export function renderStudentSections(formattedData, photoHtml) {
    const sections = {
        "Admission Details": ["studentId", "studentName", "admissionNumber", "dateOfAdmission", "classYear", "groupName", "medium", "secondLanguage", "batchYear"],
        "Academic Details": ["qualifyingExam", "gpa", "yearOfExam", "hallTicketNumber"],
        "Personal Details": ["dob", "nationality", "religion", "community", "motherTongue", "additionalCell", "scholarship", "parentsIncome", "physicallyHandicapped", "aadhaar", "identificationMark1", "identificationMark2"],
        "Parents' Details": ["fathersName", "mothersName", "fatherCell", "motherCell", "fatherOccupation", "motherOccupation"],
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

export async function loadStudentSection({
    student,contentContainer,section,title,fetchDataFn,formatDataFn,editButtonId,renderIfEmptyFn = null, forceReload = false}) 
{
   
    if (!forceReload && contentContainer && contentContainer.querySelector(`.${section}-details`)) {
        return;
    }
    contentContainer.innerHTML = `<p>Loading ${title.toLowerCase()}...</p>`;

    try {
        const sectionData = await fetchDataFn(student.studentId);

        if ((!sectionData || Object.keys(sectionData).length === 0) && renderIfEmptyFn) {
            contentContainer.innerHTML = '';

            await renderIfEmptyFn(contentContainer, false, student); // isEdit = false
            return;
        }

        const formattedHtml = await formatDataFn(sectionData, student);

        contentContainer.innerHTML = `
            <div class="student-details-header">
                <h3>${title}</h3>
                <button 
                    class="edit-button" 
                    data-element="${editButtonId}" 
                    data-student-id="${student.studentId}" 
                    data-section="${section}"
                >
                    Edit
                </button>
            </div>
            ${formattedHtml}
        `;
        updateElements();
    } catch (error) {
        console.error(`Error loading ${title.toLowerCase()}:`, error);
        contentContainer.innerHTML = `<p>Error fetching ${title.toLowerCase()}.</p>`;
    }
}

export async function loadBasicDetailsContent(student, contentContainer) {
    await loadStudentSection({
        student,
        contentContainer,
        section: 'basic',
        title: 'Student Details',
        fetchDataFn: async (studentId) => {
            return await window.electron.invoke('getStudentById', studentId);
        },
        formatDataFn: async (data, student) => {
            const formattedData = formatStudentDetails(data);
            const photoContainer = document.createElement("div");
            try {
                await displayStudentPhoto(data, photoContainer);
            } catch (error) {
                console.error("❌ Error loading student photo:", error);
                photoContainer.innerHTML = "<p>Photo unavailable</p>";
            }
            return renderStudentSections(formattedData, photoContainer.innerHTML);
        },
        editButtonId: "editStudentButton"
    });
}

function loadAcademicsContent(student, contentContainer) {
    contentContainer.innerHTML = `<h2>Academics</h2><p>Loading academic details...</p>`;
}

function loadAttendanceContent(student, contentContainer) {
    contentContainer.innerHTML = `<h2>Attendance</h2><p>Loading attendance records...</p>`;
}

function loadCertificatesContent(student, contentContainer) {
    contentContainer.innerHTML = `<h2>Certificates</h2><p>Loading certificates...</p>`;
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

    displayStudentData(studentId); 

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
    updateElements(); 
}

  export function displayStudentPhoto(student, container, defaultPhoto = 'assets/default-photo.png') {
    
        return new Promise((resolve) => {  // Wrap function in a Promise
            if (!student || !student.studentId) {
                container.innerHTML = `<img src="${defaultPhoto}" alt="Default Student Photo" 
                    style="width: 150px; height: 150px; object-fit: cover; float: right; border: 1px dashed #ccc;">`;
                resolve();  // Resolve immediately for missing student
                return;
            }
    
            if (student.gender && student.gender.toLowerCase() === 'male') {
                defaultPhoto = 'assets/default-boy.png';
            } else if (student.gender && student.gender.toLowerCase() === 'female') {
                defaultPhoto = 'assets/default-girl.png';
            }
    
// Extract the year from the student ID
const studentIdString = String(student.studentId); // Ensure studentId is a string
const yearPrefix = studentIdString.substring(0, 2); // Get the first two digits (e.g., "23", "24")
const fullYear = `20${yearPrefix}`; // Convert to a full year (e.g., "2023", "2024")

const jpegPhotoPath = `http://localhost:3000/student-data/${fullYear}/${student.studentId}/photo.jpeg?t=${Date.now()}`;

            fetch(jpegPhotoPath, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        container.innerHTML = `<img src="${jpegPhotoPath}" alt="Student Photo" 
                            style="width: 150px; height: 150px; object-fit: cover; float: right; border: 1px dashed #ccc;">`;
                    } else {
                        container.innerHTML = `<img src="${defaultPhoto}" alt="Default Student Photo" 
                            style="width: 150px; height: 150px; object-fit: cover; float: right; border: 1px dashed #ccc;">`;
                    }
                    resolve();  // Ensure Promise is resolved
                })
                .catch((error) => {
                    console.error("Error fetching photo:", error);
                    container.innerHTML = `<img src="${defaultPhoto}" alt="Default Student Photo" 
                        style="width: 150px; height: 150px; object-fit: cover; float: right; border: 1px dashed #ccc;">`;
                    resolve();  // Resolve even on error
                });
        });
    }
    
    export function createStudentPhotoSection(studentData) {
        const photoDiv = document.createElement('div');
        photoDiv.classList.add('student-photo-container');
        displayStudentPhoto(studentData, photoDiv);
        return photoDiv;
    }

export function createAllStudentsControls(onAdd, onDelete, onPromote, onDrop) {
        const controlsWrapper = document.querySelector('[data-element="controlsContainer"]');
        controlsWrapper.innerHTML = '';
    
        const addButton = createAddStudentButton(onAdd);
        addButton.classList.add('controls-button'); 
        addButton.innerHTML = `<i class="fa-solid fa-user-plus button-icon"></i> Add Student`;
    
        const deleteButton = createDeleteButton({
            items: [], 
            checkboxClass: 'select-student-checkbox',
            deleteHandler: onDelete,
            entityName: 'students',
            refreshCallback: () => filterAndRenderStudents()
        });
    
        const deleteActualButton = deleteButton.querySelector('button') || deleteButton;
        deleteActualButton.classList.add('controls-button');
        deleteActualButton.innerHTML = `<i class="fa-solid fa-trash button-icon"></i> Delete`;
    
        const promoteButton = document.createElement('button');
        promoteButton.className = 'controls-button';
        promoteButton.innerHTML = `<i class="fa-solid fa-arrow-up button-icon"></i> Promote`;
        promoteButton.addEventListener('click', onPromote);
    
        const dropButton = document.createElement('button');
        dropButton.className = 'controls-button';
        dropButton.innerHTML = `<i class="fa-solid fa-user-slash button-icon"></i> Drop`;
        dropButton.addEventListener('click', onDrop);
    
        controlsWrapper.append(addButton, deleteButton, promoteButton, dropButton);
    }