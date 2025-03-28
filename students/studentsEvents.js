
import { gatherStudentData, validateForm } from './studentsData.js';
import { displayFormErrors } from './studentsForm.js';
import { fetchStudentsFromDatabase, filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab, displayStudentData } from './studentsUI.js';
import { elements, initializeElements } from '../utils/sharedElements.js';
import { studentTabManager } from './students.js';
import { fetchFeeDetailsFromDatabase, gatherFeeData } from "../fees/fees.js";



export async function handleStudentFormSubmit(event) {
    event.preventDefault();
    console.log("Form submitted");

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
    const feeData = gatherFeeData();
    studentData.perm_same = perm_same;

    console.log("Student Data:", studentData);
    console.log("Fee Data:", feeData);

    const errors = validateForm(studentData);
    if (Object.keys(errors).length > 0) {
        console.log("Validation errors found:", errors);
        displayFormErrors(errors);
        return;
    }

    try {
        let result;
        if (event.target === elements.addStudentForm) {
            delete studentData.studentId;
            console.log("Adding new student...");

            result = await window.electron.invoke('addStudent', studentData);
            if (result.success) {
                feeData.studentId = result.studentId; 
                console.log("Adding fees for new student with ID:", result.studentId);

                const feeResult = await window.electron.invoke('addStudentFees', feeData);
                if (feeResult.success) {
                    alert(`Student and Fee details added successfully! ID: ${result.studentId}`);
                } else {
                    alert("Student added successfully, but failed to add fee details.");
                }

                event.target.reset();
                await fetchStudentsFromDatabase();
                filterAndRenderStudents();
                showStudentsTab(studentTabManager);
            } else {
                alert(result.message || "Failed to add student.");
            }
        } else if (event.target === elements.editStudentForm) {
                const studentId = parseInt(event.target.dataset.studentId, 10);
                studentData.studentId = studentId;
            
                let feeData;
                if (elements.admissionFees) { // If fee form is rendered, gather input values
                    feeData = gatherFeeData();
                } else { // If fee form is NOT rendered, fetch existing data
                    console.log("Fee form not rendered. Fetching existing fee data...");
                    feeData = await fetchFeeDetailsFromDatabase(studentId);
                }
            
                console.log("Updating student with ID:", studentId);
                console.log("Final Fee Data to be updated:", feeData);
            
                const result = await window.electron.invoke('updateStudent', studentData);
                console.log("Update Student Result:", result);

                const feeResult = await window.electron.invoke('updateStudentFees', { studentId, ...feeData });
                console.log("Update Student Fees Result:", feeResult);

                if (result.success && feeResult.success) {
                    alert(`Student and Fee details updated successfully!`);
                    await fetchStudentsFromDatabase();
                    filterAndRenderStudents();
                    displayStudentData(studentId);
                    showStudentsTab(studentTabManager);
                } else {
                    alert(result.message || "Failed to update student or fee details.");
                }
            }
            
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form.");
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