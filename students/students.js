import { initializeElements } from '../utils/sharedElements.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import TabManager from '../utils/tabManager.js';
import { filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab } from './studentsUI.js';


export let studentTabManager;

export async function initializeStudentsPage() {
    // Ensure elements are ready
    initializeElements();

    const tabButtons = [
        document.querySelector('[data-element="allStudentsTabButton"]'),
        document.querySelector('[data-element="addStudentTabButton"]')
    ];
    const tabContents = [
        document.querySelector('[data-element="allStudentsTab"]'),
        document.querySelector('[data-element="addStudentTab"]')
    ];

    studentTabManager = new TabManager(tabButtons, tabContents);
    initializeEventListeners(studentTabManager);
    showStudentsTab(studentTabManager);

    // Render student list and pagination now that DOM is ready
    filterAndRenderStudents();
}

// Register initializer for when tab is activated
window.registerTabInitializer?.('students', initializeStudentsPage);
