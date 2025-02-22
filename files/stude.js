function initializeStudentsPage() {

const studentsTab = document.getElementById("studentsTab");
const studentListContainer = document.getElementById("studentListContainer");    
const allStudentsTabButton = document.getElementById("allStudentsTabButton");
const addStudentTabButton = document.getElementById("addStudentTabButton");
const addStudentTab = document.getElementById("addStudentTab");
const allStudentsTab = document.getElementById("allStudentsTab");
const addStudentFormContainer = document.getElementById("addStudentFormContainer");
const filtersContainer = document.getElementById("filtersContainer");

const firstYearCheckbox = document.getElementById("firstYearCheckbox");
const secondYearCheckbox = document.getElementById("secondYearCheckbox");
const mpcCheckbox = document.getElementById("mpcCheckbox");
const bipcCheckbox = document.getElementById("bipcCheckbox");
const mecCheckbox = document.getElementById("mecCheckbox");
const cecCheckbox = document.getElementById("cecCheckbox");

const checkboxes = [firstYearCheckbox, secondYearCheckbox, mpcCheckbox, bipcCheckbox, mecCheckbox, cecCheckbox];
checkboxes.forEach(checkbox => checkbox.addEventListener("change", filterAndRenderStudents));
const studentDataContainer = document.getElementById('studentDataContainer');
  

function hideAllTabs() {
           document.getElementById("allStudentsTab").classList.add("hidden"); 
        document.getElementById("addStudentTab").classList.add("hidden");  
    }
    
function showStudentsTab() {
     hideAllTabs();
     console.log('Before showing All Students Tab:', allStudentsTab.classList);
     console.log('Before showing Filters Container:', filtersContainer.classList);
     console.log('Before showing Student List Container:', studentListContainer.classList);
     
// Unhide All Students Tab, Filters, and Student List Container
allStudentsTab.classList.remove("hidden");
filtersContainer.classList.remove("hidden");
studentListContainer.classList.remove("hidden"); // Ensure this is visible

// Hide student details and clear previous data
console.log('Before hiding student data container:', studentDataContainer.classList);
studentDataContainer.classList.add("hidden");  // Make sure student details are hidden
studentDataContainer.innerHTML = ""; 
console.log('After hiding student data container:', studentDataContainer.classList);

// Highlight active tab
allStudentsTabButton.classList.add("active");
addStudentTabButton.classList.remove("active");

filterAndRenderStudents();   
}

async function showAllStudentsContent() {
    if (allStudentsTab && addStudentTab) {
        allStudentsTab.classList.remove("hidden");
        addStudentTab.classList.add("hidden");
        allStudentsTabButton.classList.add("active");
        addStudentTabButton.classList.remove("active");
        studentDataContainer.innerHTML = ""; 

        try {
            students = await window.electron.invoke('fetchStudents'); 
                     filterAndRenderStudents();  
        } catch (error) {
            console.error("Error loading student data:", error);
            studentListContainer.innerHTML = '<p>Error loading student data. Please try again.</p>';
        }
    }
}


function showAddStudent() {
        if (addStudentTab && allStudentsTab) {
        addStudentTab.classList.remove("hidden");
        allStudentsTab.classList.add("hidden");

        addStudentTabButton.classList.add("active");
        allStudentsTabButton.classList.remove("active");
        renderAddStudentForm();
    } 
}
if (allStudentsTabButton && addStudentTabButton) {
    allStudentsTabButton.addEventListener("click", showStudentsTab);
    addStudentTabButton.addEventListener("click", () => {
        console.log('Add Student Tab Button Clicked');
        showAddStudent();
    });
    console.log('After setting event listener on Add Student Tab Button:', addStudentTabButton);

} else {
    console.error("Tab buttons not found in the DOM.");
}

function renderAddStudentForm() {
        if (!addStudentFormContainer) {
            console.error("Add Student Form Container not found!");
            return;
        }
        console.log("Rendering Add Student Form...");
        addStudentFormContainer.innerHTML = `
<form id="addStudentForm">
    <div class="form-row">
        <div class="form-group small">
            <label for="studentId">Student ID</label>
            <input type="text" id="studentId" required minlength="5" maxlength="5">
            <span class="error-message" id="studentIdError"></span>
        </div>
        <div class="form-group large">
            <label for="studentName">Name of the Student</label>
            <input type="text" id="studentName" required>
            <span class="error-message" id="studentNameError"></span>
        </div>
    </div>
    <div class="form-row">
        <div class="form-group small">
            <label for="admissionNumber">Admission No.</label>
            <input type="text" id="admissionNumber" required minlength="4" maxlength="4">
            <span class="error-message" id="admissionNumberError"></span>
        </div>
        <div class="form-group large">
<label for="contactNumber">Contact Number</label>
<input type="text" id="contactNumber" required pattern="^[1-9][0-9]{9}$">
<span class="error-message" id="contactNumberError"></span>
</div>

    </div>
    <div class="form-row">
        <div class="form-group large">
            <label for="year">Year:</label>
            <select id="year" required>
                <option value="" disabled selected>Select Year</option>
                <option value="first">First Year</option>
                <option value="second">Second Year</option>
            </select>
            <span class="error-message" id="yearError"></span>
        </div>
        <div class="form-group large">
            <label for="group">Group:</label>
            <select id="group" required>
                <option value="" disabled selected>Select Group</option>
                <option value="mpc">MPC</option>
                <option value="bipc">BiPC</option>
                <option value="mec">MEC</option>
                <option value="cec">CEC</option>
            </select>
            <span class="error-message" id="groupError"></span>
        </div>
        <div class="form-group large">
            <label for="medium">Medium:</label>
            <select id="medium" required>
                <option value="english" selected>English</option>
                <option value="telugu">Telugu</option>
            </select>
        </div>
        <div class="form-group large">
            <label for="batchYear">Batch Year:</label>
            <select id="batchYear" required>
                <option value="" disabled selected>Select Batch Year</option>
            </select>
        </div>
    </div>
    <div class="form-container">
        <button type="submit" class="submit-button">Submit</button>
    </div>
</form>
`;

        const batchYearSelect = document.getElementById("batchYear");
        populateBatchYearDropdown(batchYearSelect, 2020, 2035);
    
        console.log('After rendering Add Student Form:', addStudentFormContainer.innerHTML);
    
    }

    function populateBatchYearDropdown(dropdown, startYear, endYear) {
        for (let year = startYear; year <= endYear; year++) {
            const nextYear = (year + 1).toString().slice(-2);
            const batchValue =`${year}-${nextYear}`;
            const option = document.createElement("option");
            option.value = batchValue;
            option.textContent = batchValue;
            dropdown.appendChild(option);
        }
    }

    document.addEventListener('submit', async function (event) {
        if (event.target && event.target.id === 'addStudentForm') {
            event.preventDefault();         

            const studentData = {
                studentId: document.getElementById("studentId").value.trim(),
                studentName: document.getElementById("studentName").value.trim(),
                admissionNumber: document.getElementById("admissionNumber").value.trim(),
                contactNumber: document.getElementById("contactNumber").value.trim(),
                year: document.getElementById("year").value,
                group: document.getElementById("group").value,
                medium: document.getElementById("medium").value,
                batchYear: document.getElementById("batchYear").value,
            };
    
       
            if (Object.values(studentData).some(val => val === "")) {
                alert("Please fill in all the fields.");
                console.error("All fields are required.");
                return; 
            }

            if (window.electron) {
                window.electron.send('addStudent', studentData);
            } else {
                console.error("IPC communication is not set up. Ensure the preload script defines 'window.electron'.");
            }
 
            // Refresh data from backend instead of manually adding
        await fetchStudentsFromLocalDisk();
        filterAndRenderStudents();

            studentListContainer.innerHTML = "";
            showStudentsTab(); 
        }
    });

if (window.electron) {
    window.electron.receive('error', (errorMessage) => {
        alert("Error: " + errorMessage); 
    });
}

let students = [];
async function fetchStudentsFromLocalDisk() {
      try {
        console.log('Fetching students from local disk...');
        students = await window.electron.invoke('fetchStudents'); 
        console.log('Fetched students:', students);
        filterAndRenderStudents();
    } catch (error) {
        console.error("Error fetching students from local disk:", error);
        students = [];
    }
}

async function initializeApp() {
    console.log('Initializing app...');
    await fetchStudentsFromLocalDisk(); 
    console.log('After fetching students from disk');
    displayStudents(); 
}

function displayStudents() {
}
initializeApp();
function filterAndRenderStudents() {
const selectedYears = getSelectedYears();
const selectedGroups = getSelectedGroups();

if (selectedYears.length === 0) {

    if (selectedGroups.length === 0) {
        renderStudentList(students);
    } else {
        const filteredStudents = students.filter(student =>
            selectedGroups.includes(student.group)
        );
        renderStudentList(filteredStudents);
    }
    return;
}
if (selectedGroups.length === 0) {
    const filteredStudents = students.filter(student =>
        selectedYears.includes(student.year)
    );
    renderStudentList(filteredStudents);
    return;
}
const filteredStudents = students.filter(student => {
    const yearMatch = selectedYears.includes(student.year);
    const groupMatch = selectedGroups.includes(student.group);
    return yearMatch && groupMatch;
});

renderStudentList(filteredStudents);
}


function getSelectedYears() {
const selectedYears = [];
if (firstYearCheckbox.checked) selectedYears.push('first');
if (secondYearCheckbox.checked) selectedYears.push('second');
return selectedYears;
}

function getSelectedGroups() {
const selectedGroups = [];
if (mpcCheckbox.checked) selectedGroups.push('mpc');
if (bipcCheckbox.checked) selectedGroups.push('bipc');
if (mecCheckbox.checked) selectedGroups.push('mec');
if (cecCheckbox.checked) selectedGroups.push('cec');
return selectedGroups;
}

function renderStudentList(students) {
    studentListContainer.innerHTML = ''; 
    studentDataContainer.classList.remove("hidden"); 
    filtersContainer.classList.remove("hidden");  
       if (students.length === 0) {
        studentListContainer.innerHTML = '<p>No students found.</p>';
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
    studentListContainer.innerHTML = ''; 
    studentListContainer.appendChild(deleteButton);
    studentListContainer.appendChild(studentTable);
    studentTable.querySelectorAll('th').forEach((header) => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            if (column === sortedColumn) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortOrder = 'asc';
                sortedColumn = column;
            }
            students.sort(compareValues(column, sortOrder));
            studentTable.querySelector('tbody').innerHTML = renderRows(students);
            attachRowClickEvents();
            
        });
    });
     // Select All Checkbox Event
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
    // Individual Checkbox Click Event
    document.querySelectorAll('.select-student-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent row click event when clicking the checkbox
        });
    });
}
function displayStudentData(studentId) {
    const student = students.find(student => student.studentId === studentId);
    studentListContainer.classList.add("hidden");
    studentDataContainer.classList.remove("hidden");
    filtersContainer.classList.add("hidden"); 
    studentDataContainer.innerHTML = `
        <h3>Student Details</h3>
        <p><strong>ID:</strong> ${student.studentId}</p>
        <p><strong>Name:</strong> ${student.studentName}</p>
        <p><strong>Admission No:</strong> ${student.admissionNumber}</p>
        <p><strong>Contact:</strong> ${student.contactNumber}</p>
        <p><strong>Year:</strong> ${student.year}</p>
        <p><strong>Group:</strong> ${student.group}</p>
        <p><strong>Medium:</strong> ${student.medium}</p>
        <p><strong>Batch Year:</strong> ${student.batchYear}</p>
    `;
}
function renderRows(students) {
    return students
        .map(student => {
            return `
                <tr class="student-row" data-id="${student.studentId}">
                    <td><input type="checkbox" class="select-student-checkbox" data-id="${student.studentId}"></td>
                    <td>${student.studentId}</td>
                    <td>${student.studentName}</td>
                    <td>${student.admissionNumber}</td>
                    <td>${student.contactNumber}</td>
                    <td>${student.year}</td>
                    <td>${student.group}</td>
                </tr>
            `;
        })
        .join("");
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
            const index = Array.from(header.parentElement.children).indexOf(header);
            const isAscending = header.classList.contains("sorted-asc");

            headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));

            header.classList.toggle("sorted-asc", !isAscending);
            header.classList.toggle("sorted-desc", isAscending);

            sortTable(table, index, !isAscending);
        });
    });
});

function sortTable(table, columnIndex, ascending) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        return ascending
            ? aText.localeCompare(bText, undefined, { numeric: true })
            : bText.localeCompare(aText, undefined, { numeric: true });
    });

    rows.forEach(row => tbody.appendChild(row));
}
function deleteSelectedStudents(students) {
    console.log('Deleting students...');
     // Check what students are selected for deletion
     const selectedStudents = students.filter(student => student.selected);
     console.log('Selected students for deletion:', selectedStudents);
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
      console.log('After deletion, checking Add Student Form:', addStudentFormContainer);

}   
window.electron.receive('updateSuccess', () => {
    window.electron.invoke('fetchStudents')
        .then(updatedStudents => {
            renderStudentList(updatedStudents);
        })
        .catch(error => {
            console.error('Error fetching updated students:', error);
            alert('Failed to fetch the updated student list. Please try again.');
        });
});


}

initializeStudentsPage();