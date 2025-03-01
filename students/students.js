
import { showStudentsTab, showAddStudent } from './studentsUI.js';
import { filterAndRenderStudents } from './studentsData.js';
import { renderStudentForm } from './studentsForm.js';
import { initializeApp } from './studentsData.js';
import { elements, initializeElements } from './studentsElements.js';

export async function initializeStudentsPage() {
    initializeElements(); 
    showStudentsTab();

    const checkboxes = [
        elements.firstYearCheckbox,
        elements.secondYearCheckbox,
        elements.mpcCheckbox,
        elements.bipcCheckbox,
        elements.mecCheckbox,
        elements.cecCheckbox,
    ];
    checkboxes.forEach((checkbox) => {
        if (checkbox) {
            checkbox.addEventListener('change', () => filterAndRenderStudents(1)); 
        }
    });
    
    if (elements['allStudentsTabButton'] && elements['addStudentTabButton']) {
        elements['allStudentsTabButton'].addEventListener('click', showStudentsTab);
        elements['addStudentTabButton'].addEventListener('click', showAddStudent);
    } else {
        console.error('Tab buttons not found in the DOM.');
    }
    
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
        await initializeApp(); // Call initializeApp before initializeStudentsPage
        await initializeStudentsPage();
        await filterAndRenderStudents(1); // Call without arguments for initial rendering
        showStudentsTab();
    });
} else {
 
    await initializeApp(); // Call initializeApp before initializeStudentsPage
    await initializeStudentsPage();
    await filterAndRenderStudents(1); // Call without arguments for initial rendering
    showStudentsTab();
}