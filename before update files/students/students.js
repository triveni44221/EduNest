import { elements, initializeElements } from '../utils/sharedElements.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import TabManager from '../utils/tabManager.js';
import { filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab, showAddStudent, createStudentsListControls } from './studentsUI.js';
import { injectFilters } from '../utils/filters.js';

export let studentTabManager;

export async function initializeStudentsPage() {
    initializeElements();

    const tabButtons = [
        document.querySelector('[data-element="activeStudentsTabButton"]'),
        document.querySelector('[data-element="retainedStudentsTabButton"]'),
        document.querySelector('[data-element="pastStudentsTabButton"]'),
        document.querySelector('[data-element="dropOutsTabButton"]'),
        document.querySelector('[data-element="deletedStudentsTabButton"]')

    ];

    const tabContents = [
        document.querySelector('[data-element="activeStudentsTab"]'),
        document.querySelector('[data-element="retainedStudentsTab"]'),
        document.querySelector('[data-element="pastStudentsTab"]'),
        document.querySelector('[data-element="dropOutsTab"]'),
        document.querySelector('[data-element="deletedStudentsTab"]')

    ];

    const tabStatusMap = {
        activeStudentsTabButton: 'active',
        retainedStudentsTabButton: 'retained',
        pastStudentsTabButton: 'past',
        dropOutsTabButton: 'dropped',
        deletedStudentsTabButton: 'deleted',
    };
    
    const contentLoaders = {};
    
    for (const [buttonId, status] of Object.entries(tabStatusMap)) {
        contentLoaders[buttonId] = (tabContent) => {
            elements.controlsContainer.innerHTML = '';
    
            // For the Active tab, add the custom controls
            if (buttonId === 'activeStudentsTabButton') {
                createStudentsListControls(
                    () => showAddStudent(),
                    async (selectedIds) => {
                        const result = await window.electron.invoke('deleteStudents', selectedIds);
                        return result;
                    },
                    (selectedIds) => handleRetainStudents(selectedIds),
                    (selectedIds) => handlePromoteStudents(selectedIds),
                    (selectedIds) => handleDropStudents(selectedIds)
                );
            }
    
            if (!tabContent.querySelector('.filters-wrapper')) {
                injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
            }
    
            filterAndRenderStudents({ filters: { status } });
        };
    }
    

/*
const contentLoaders = {
    activeStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = ''; // Clear existing
        const controls = createStudentsListControls(
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
        filterAndRenderStudents({ filters: { status: 'active' } });
    },
    
    pastStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
           injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
       } 
       filterAndRenderStudents({ filters: { status: 'past' } });
    },

    dropOutsTabButton: (tabContent) =>  {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents({ filters: { status: 'dropped' } });
    },
    
    deletedStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents({ filters: { status: 'deleted' } });
    },

    retainedStudentsTabButton: (tabContent) => {
        elements.controlsContainer.innerHTML = '';
        if (!tabContent.querySelector('.filters-wrapper')) {
            injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
        }
        filterAndRenderStudents({ filters: { status: 'reappear' } });
    },
};
*/

    studentTabManager = new TabManager(tabButtons, tabContents, undefined, contentLoaders);
    window.studentTabManager = studentTabManager; 

    initializeEventListeners(studentTabManager);
    showStudentsTab(studentTabManager);

    studentTabManager.reloadActiveTab();
}

// Register initializer for when tab is activated
window.registerTabInitializer?.('students', initializeStudentsPage);
