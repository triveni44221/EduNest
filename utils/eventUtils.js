import { elements, initializeElements } from './sharedElements.js';
import { filterAndRenderStudents } from '../students/studentsData.js';
import { showStudentsTab, showAddStudent} from '../students/studentsUI.js';


export function attachEventListeners(context, studentTabManager = null) {
    if (context === "students") {
        attachStudentEventListeners(studentTabManager);
    } else if (context === "filters") {
        attachFilterEventListeners();
    } 
    // More contexts can be added as needed
}


function attachStudentEventListeners(studentTabManager) {
    const tabActions = {
        allStudentsTabButton: () => showStudentsTab(studentTabManager),
        addStudentTabButton: () => showAddStudent(studentTabManager),
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


function attachFilterEventListeners() {
    const filterCheckboxes = [
        'firstYearCheckbox', 'secondYearCheckbox', 
        'mpcCheckbox', 'bipcCheckbox', 'mecCheckbox', 'cecCheckbox'
    ];

    filterCheckboxes.forEach(id => {
        const checkbox = elements[id];
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                filterAndRenderStudents(1);
            });
        } else {
            console.error(`❌ Checkbox ${id} not found in elements!`);
        }
    });
}
export function initializeEventListeners(studentTabManager = null) {
    initializeElements();
    setTimeout(() => {
        attachEventListeners("students", studentTabManager);
        attachEventListeners("filters");
    }, 0); 
}