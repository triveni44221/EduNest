import { elements, initializeElements } from './sharedElements.js';
import { showStudentsTab, handleEditButtonClick} from '../students/studentsUI.js';



export function attachEventListeners(context, studentTabManager = null) {
    if (context === "students") {
        attachStudentEventListeners(studentTabManager);
    }
}

function attachStudentEventListeners(studentTabManager) {

    const studentContainer = elements.studentDataContainer || document.getElementById('basicDetailsTabContent');
    if (studentContainer) {
        studentContainer.removeEventListener("click", handleEditButtonClick); // Defensive: avoid duplicate bindings
        studentContainer.addEventListener("click", handleEditButtonClick);
        console.log("✅ Bound handleEditButtonClick to student container:", studentContainer);
    } else {
        console.warn("❗ Student container not found. Cannot bind edit button click handler.");
    }
}

export function initializeEventListeners(studentTabManager = null) {
    initializeElements();
    setTimeout(() => {
        attachEventListeners("students", studentTabManager);
    }, 0); 
}