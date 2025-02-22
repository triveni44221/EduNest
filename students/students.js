(async () => {
    // Dynamically import required modules
    const { getElementsByDataAttribute } = await import('../utils/uiUtils.js');
    const { showStudentsTab, showAddStudent, setActiveTab } = await import('./studentsUI.js');
    const { filterAndRenderStudents } = await import('./studentsData.js');
    const { renderStudentForm } = await import('./studentsForm.js');
    const { handleFormSubmit } = await import('./studentsEvents.js');

    let elements = getElementsByDataAttribute('data-element');

    export function initializeStudentsPage() {
        const checkboxes = [
            elements.firstYearCheckbox,
            elements.secondYearCheckbox,
            elements.mpcCheckbox,
            elements.bipcCheckbox,
            elements.mecCheckbox,
            elements.cecCheckbox,
        ];
        checkboxes.forEach((checkbox) => {
            if (checkbox) checkbox.addEventListener('change', filterAndRenderStudents);
        });

        if (elements['allStudentsTabButton'] && elements['addStudentTabButton']) {
            elements['allStudentsTabButton'].addEventListener('click', showStudentsTab);
            elements['addStudentTabButton'].addEventListener('click', showAddStudent);
        } else {
            console.error('Tab buttons not found in the DOM.');
        }

        const formContainer = document.getElementById('studentFormContainer');
        if (formContainer) {
            renderStudentForm(formContainer, false);
        } else {
            console.error('Form container not found!');
        }
    }

    document.addEventListener('DOMContentLoaded', initializeStudentsPage);

    export function showAddStudent() {
        setActiveTab({
            activeButton: elements.addStudentTabButton,
            inactiveButton: elements.allStudentsTabButton,
            visibility: {
                show: [elements.addStudentTab],
                hide: [elements.allStudentsTab],
            },
        });
        renderStudentForm(elements.addStudentFormContainer);
    }

    export function showEditStudent(studentData) {
        setActiveTab({
            activeButton: elements.addStudentTabButton,
            inactiveButton: elements.allStudentsTabButton,
            visibility: {
                show: [elements.addStudentTab],
                hide: [elements.allStudentsTab],
            },
        });

        renderStudentForm(elements.addStudentFormContainer, true, studentData);
        const form = document.getElementById('editStudentForm');
        elements.editStudentForm.dataset.studentId = studentData.studentId;
        elements.editStudentForm.removeEventListener('submit', handleFormSubmit);
        elements.editStudentForm.addEventListener('submit', handleFormSubmit);
        console.log('Submit event listener attached to editStudentForm');
    }

    window.addEventListener('DOMContentLoaded', () => {
        elements = getElementsByDataAttribute('data-element');

        if (!studentData.admissionNumber && elements.admissionNumber) {
            elements.admissionNumber.disabled = true;
        }
    });
})();
