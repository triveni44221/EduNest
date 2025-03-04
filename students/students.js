
import { showStudentsTab, showAddStudent, attachEventListeners } from './studentsUI.js';

import { initializeApp } from './studentsData.js';
import { initializeElements } from './studentsElements.js';

let isInitialized = false; 

export async function initializeStudentsPage() {
    initializeElements();  
isInitialized = true;
    showStudentsTab();
    attachEventListeners(); 
}

(async function initialize() {
    await initializeApp();
})();

window.registerTabInitializer?.('students', initializeStudentsPage);

initializeApp();