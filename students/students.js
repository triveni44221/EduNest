import { initializeElements } from '../utils/sharedElements.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import  TabManager  from '../utils/tabManager.js';
import { initializeApp } from './studentsData.js';
import { showStudentsTab} from './studentsUI.js';

let isInitialized = false; 

export let studentTabManager;

export async function initializeStudentsPage() {
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

    isInitialized = true;
    showStudentsTab(studentTabManager);

}
 
(async function initialize() {
    await initializeApp();
})();

window.registerTabInitializer?.('students', initializeStudentsPage);