
    import { gatherStudentData, validateForm } from './studentsData.js';
    import { displayFormErrors } from './studentsForm.js';
    import { fetchStudentsFromLocalDisk, filterAndRenderStudents } from './studentsData.js';
    import { showStudentsTab, displayStudentData } from './studentsUI.js';
    import { elements, initializeElements } from './studentsElements.js';



    export async function handleFormSubmit(event) {
        event.preventDefault();
        if (!elements || Object.keys(elements).length === 0) {
            console.error("Elements object is not initialized!");
            alert("Form elements not initialized. Please try again.");
            return;
        }
       
        const studentData = gatherStudentData();
        console.log('studentData:', studentData);

        const errors = validateForm(studentData);
        console.log('errors:', errors);
        if (Object.keys(errors).length > 0) {
            displayFormErrors(errors);
            console.log('Validation errors found');
            return;
        }
        try {
            let result;
            if (event.target === elements.addStudentForm) {
                delete studentData.studentId;

                result = await window.electron.invoke('addStudent', studentData);
                if (result.success) {
                    alert('Student added successfully! ID: ' + result.studentId);
                    event.target.reset();
                    await fetchStudentsFromLocalDisk();
                    filterAndRenderStudents();
                    showStudentsTab();
                } else {
                    alert(result.message || 'Failed to add student.');
                }
            } else if (event.target === elements.editStudentForm) {
                const studentId = event.target.dataset.studentId;
                studentData.studentId = parseInt(studentId, 10);

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
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form.');
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
                    await fetchStudentsFromLocalDisk();
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