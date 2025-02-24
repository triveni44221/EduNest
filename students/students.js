
import { getElementsByDataAttribute } from '../utils/uiUtils.js';
import { showStudentsTab, showAddStudent } from './studentsUI.js';
import { filterAndRenderStudents } from './studentsData.js';
import { renderStudentForm } from './studentsForm.js';
import { setActiveTab } from './studentsUI.js';
import { handleFormSubmit } from './studentsEvents.js';


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

window.addEventListener('DOMContentLoaded', () => {
    elements = getElementsByDataAttribute('data-element');

    if (!studentData.admissionNumber && elements.admissionNumber) {
        elements.admissionNumber.disabled = true;
    }
});