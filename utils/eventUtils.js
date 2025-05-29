import { elements, initializeElements } from './sharedElements.js';
import { showStudentsTab, showAddStudent} from '../students/studentsUI.js';


export function attachEventListeners(context, studentTabManager = null) {
    if (context === "students") {
        attachStudentEventListeners(studentTabManager);
    }
}

function attachStudentEventListeners(studentTabManager) {
    const tabActions = {
        allStudentsTabButton: () => showStudentsTab(studentTabManager),
        //addStudentTabButton: () => showAddStudent(studentTabManager),
    };

    Object.keys(tabActions).forEach(tabKey => {
        const tabButton = elements[tabKey];
        if (tabButton) {
            tabButton.removeEventListener("click", tabActions[tabKey]);
            tabButton.addEventListener("click", tabActions[tabKey]);
        } else {
            console.error(`❌ Tab button ${tabKey} not found in elements!`);
        }
    });
}

export function initializeEventListeners(studentTabManager = null) {
    initializeElements();
    setTimeout(() => {
        attachEventListeners("students", studentTabManager);
    }, 0); 
}