
import { gatherStudentData, validateForm, students } from './studentsData.js';
import { displayFormErrors } from './studentsForm.js';
import { fetchStudentById } from './studentsData.js';
import { displayStudentData } from './studentsUI.js';
import { elements, initializeElements } from '../utils/sharedElements.js';
import { studentTabManager } from './students.js';

export async function handleStudentFormSubmit(event) {
    event.preventDefault();
    console.log("handleStudentFormSubmit called for:", event.target.dataset.element || "addStudentForm");


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

    console.log("Data gathered:", studentData);



    try {
        let result;
        if (event.target === elements.addStudentForm) {
            console.log("Processing add student form.");
   
            delete studentData.studentId;

            result = await window.electron.invoke('addStudent', studentData);

            if (result.success) {
                studentData.studentId = result.studentId;
                alert("Student basic details added successfully!");
                event.target.reset();
                const updatedStudent = await fetchStudentById(studentData.studentId);
                console.log("Fetched updated student after add:", updatedStudent);
             
                if (updatedStudent) {
                    students.unshift(updatedStudent); // or push/sort if needed
                }
                
                if (!updatedStudent) {
                    console.error("âŒ New student not found in list after update!");
                }
                // Switch to the "all students" tab and display the student data
                studentTabManager.switchTab(elements.allStudentsTabButton); // Just switch tab, no render

                displayStudentData(studentData.studentId); // Show the new student details
                                
                return true;
            } else {
                alert(result.message || "Failed to add student.");
                return false;
            }
        } else if (event.target.dataset.element === "editStudentForm") {
            console.log("Processing edit student form.");
            console.log("Edit form element:", document.querySelector('[data-element="editStudentForm"]')); // Or your edit form's selector
console.log("Student Name input:", document.querySelector('#studentName_edit')); // Replace with the actual ID or selector

           
            initializeElements();

            const studentId = parseInt(event.target.dataset.studentId, 10);
            studentData.studentId = studentId;

            console.log("Student ID for update:", studentId);
            console.log("Data before update:", studentData);

    const errors = validateForm(studentData);
    if (Object.keys(errors).length > 0) {
        displayFormErrors(errors);
        return false;
    }


            // Ensure only one call to updateStudent
            if (!event.target.dataset.submitted) {
                event.target.dataset.submitted = "true";  // Prevent duplicate submission
                result = await window.electron.invoke('updateStudent', studentData);
                console.log("Update student result:", result);
           
            } else {
                console.warn("⚠️ Duplicate form submission prevented.");
                return false;
            }

            if (result?.success) {
                alert(`✅ Student details updated successfully!`);
                event.target.reset();
                const updatedStudent = await fetchStudentById(studentData.studentId);
                console.log("Fetched updated student after update:", updatedStudent);
               
                if (updatedStudent) {
                    students.unshift(updatedStudent); // or push/sort if needed
                }
                if (!updatedStudent) {
                    console.error("âŒ New student not found in list after update!");
                }
                displayStudentData(studentData.studentId); // Show the new student details

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