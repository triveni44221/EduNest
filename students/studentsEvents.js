
import { gatherStudentData, validateForm } from './studentsData.js';
import { displayFormErrors } from './studentsForm.js';
import { fetchStudentsFromDatabase, filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab, displayStudentData, students } from './studentsUI.js';
import { elements, initializeElements } from '../utils/sharedElements.js';
import { studentTabManager } from './students.js';

export async function handleStudentFormSubmit(event) {
    event.preventDefault();
    console.log("handleStudentFormSubmit called");

    if (!elements || Object.keys(elements).length === 0) {
        console.error("Elements object is not initialized! Attempting to initialize...");
        initializeElements();

        if (!elements || Object.keys(elements).length === 0) {
            alert("Form elements could not be initialized. Please refresh the page and try again.");
            return;
        }
    }

    const sameAsPresentRadio = document.querySelector('input[name="sameAsPresent"]:checked');
    let perm_same = sameAsPresentRadio ? (sameAsPresentRadio.value === 'yes' ? 1 : 0) : null;

    const studentData = gatherStudentData(perm_same);
    studentData.perm_same = perm_same;

    console.log("Student Data:", studentData);

    const errors = validateForm(studentData);
    if (Object.keys(errors).length > 0) {
        console.log("Validation errors found:", errors);
        displayFormErrors(errors);
        return false;
    }

    try {
        let result;
        if (event.target === elements.addStudentForm) {
            delete studentData.studentId;

            result = await window.electron.invoke('addStudent', studentData);
            console.log("addStudent result:", result); // Log the result

            if (result.success) {
                studentData.studentId = result.studentId;
                alert("Student basic details added successfully!");
                event.target.reset();
                await fetchStudentsFromDatabase();  // Ensure students is updated

                const updatedStudent = students.find(s => String(s.studentId) === String(studentData.studentId));

                if (!updatedStudent) {
                    console.error("âŒ New student not found in list after update!");
                }
                // Switch to the "all students" tab and display the student data
                await showStudentsTab(studentTabManager); // Ensure tab is switched

                displayStudentData(studentData.studentId);
                
                return true;
            } else {
                alert(result.message || "Failed to add student.");
                return false;
            }
        } else if (event.target.dataset.element === "editStudentForm") {
            const studentId = parseInt(event.target.dataset.studentId, 10);
            studentData.studentId = studentId;

            // Ensure only one call to updateStudent
            if (!event.target.dataset.submitted) {
                event.target.dataset.submitted = "true";  // Prevent duplicate submission
                result = await window.electron.invoke('updateStudent', studentData);
            } else {
                console.warn("⚠️ Duplicate form submission prevented.");
                return false;
            }

            if (result?.success) {
                alert(`✅ Student details updated successfully!`);
                event.target.reset();
                await fetchStudentsFromDatabase();

                const updatedStudent = students.find(s => String(s.studentId) === String(studentData.studentId));

                if (!updatedStudent) {
                    console.error("âŒ New student not found in list after update!");
                }
                // Switch to the "all students" tab and display the student data
                await showStudentsTab(studentTabManager); // Ensure tab is switched

                displayStudentData(studentData.studentId);
                return true; // Indicate success
            } else {
                alert(result.message || "Failed to update student details.");
                return false; // Indicate failure
            }
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form.");
        return false; // Indicate failure
    }
}


export async function deleteSelectedStudents(students) {
    const selectedCheckboxes = document.querySelectorAll('.select-student-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        alert('No students selected for deletion.');
        return;
    }

    const confirmation = confirm('Are you sure you want to delete the selected students? This action cannot be undone.');

    if (confirmation) {
        const selectedIds = Array.from(selectedCheckboxes).map((checkbox) => checkbox.getAttribute('data-id'));

        try {
            const result = await window.electron.invoke('deleteStudents', selectedIds);

            if (result.success) {
                alert(`${selectedIds.length} student(s) deleted successfully.`);
                await fetchStudentsFromDatabase();
                filterAndRenderStudents(1);
            } else {
                alert(result.message || 'Failed to delete students.');
            }
        } catch (error) {
            console.error('Error deleting students:', error);
            alert(`An error occurred while deleting students: ${error.message}`);
        }
    }
}