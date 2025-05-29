import { elements, initializeElements } from '../utils/sharedElements.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import TabManager from '../utils/tabManager.js';
import { filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab, showAddStudent, createAllStudentsControls } from './studentsUI.js';
import { injectFilters } from '../utils/filters.js';




export let studentTabManager;

export async function initializeStudentsPage() {
    initializeElements();

    const tabButtons = [
        document.querySelector('[data-element="allStudentsTabButton"]'),
        document.querySelector('[data-element="pastStudentsTabButton"]'),
        document.querySelector('[data-element="dropOutsTabButton"]'),
        document.querySelector('[data-element="deletedStudentsTabButton"]')
    ];

    const tabContents = [
        document.querySelector('[data-element="allStudentsTab"]'),
        document.querySelector('[data-element="pastStudentsTab"]'),
        document.querySelector('[data-element="dropOutsTab"]'),
        document.querySelector('[data-element="deletedStudentsTab"]')
    ];


const contentLoaders = {
    allStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = ''; // Clear existing
        const controls = createAllStudentsControls(
            () => showAddStudent(),
            async (selectedIds) => {
                const result = await window.electron.invoke('deleteStudents', selectedIds);
                return result;
            },
            () => handlePromoteStudents(),
            () => handleDropStudents()
        );
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents();
    },
    
    pastStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
           injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
       } 
       filterAndRenderStudents();
    },

    dropOutsTabButton: (tabContent) =>  {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents();
    },
    
    deletedStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents();
    },
};

    studentTabManager = new TabManager(tabButtons, tabContents, undefined, contentLoaders);
    window.studentTabManager = studentTabManager; 

    initializeEventListeners(studentTabManager);
    showStudentsTab(studentTabManager);

    studentTabManager.reloadActiveTab();
}

// Register initializer for when tab is activated
window.registerTabInitializer?.('students', initializeStudentsPage);
