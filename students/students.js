import { elements, initializeElements, lastUsedStudentFilters, resetStudentFilters, currentView } from '../utils/sharedElements.js';
import { initializeEventListeners } from '../utils/eventUtils.js';
import TabManager from '../utils/tabManager.js';
import { filterAndRenderStudents } from './studentsData.js';
import { showStudentsTab, showAddStudent, createStudentsListControls } from './studentsUI.js';
import { restoreFilterCheckboxStates, injectFilters } from '../utils/filters.js';
import { normalizeFilterValues } from '../utils/dataUtils.js';

import { toggleVisibility } from '../utils/uiUtils.js';


export let studentTabManager;
export let currentActiveStudentTypeTabLabel = "Active Students"; // Export this variable

export async function initializeStudentsPage() {

    if (!currentActiveStudentTypeTabLabel) {
        resetStudentFilters();
    }
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
        const newTabLabel = elements[buttonId].textContent;

        if (currentActiveStudentTypeTabLabel !== newTabLabel) {
            Object.keys(lastUsedStudentFilters).forEach(key => delete lastUsedStudentFilters[key]);
            console.log('Filters cleared on tab switch:', JSON.stringify(lastUsedStudentFilters));
            const filtersContainer = tabContent.querySelector('[data-element="filtersContainer"]');
            if (filtersContainer) {
                restoreFilterCheckboxStates(filtersContainer, {});
            }
        }
        
        currentActiveStudentTypeTabLabel = newTabLabel;
        // ... rest of the function ...
        elements.controlsContainer.innerHTML = '';

        // ✅ Custom controls for Active tab only
        if (buttonId === 'activeStudentsTabButton') {
            toggleVisibility({
                show: currentView === 'list' ? [
                    elements.studentListContainer,
                    elements.filtersContainer,
                    elements.controlsContainer,
                    elements.paginationContainer
                ] : [
                    elements.studentListContainer,
                    elements.controlsContainer,
                    elements.paginationContainer
                ],
                hide: [
                    elements.addStudentFormContainer,
                    elements.studentDataContainer,
                ]
            });

            elements.controlsContainer.innerHTML = '';
            createStudentsListControls(
                () => showAddStudent(),
                (selectedIds) => handleRetainStudents(selectedIds),
                (selectedIds) => handlePromoteStudents(selectedIds),
                (selectedIds) => handleDropStudents(selectedIds),
                async (selectedIds) => {
                    const result = await window.electron.invoke('deleteStudents', selectedIds);
                    return result;
                }
            );
        }

        // Inject filters only for list view
if (currentView === 'list' && !tabContent.querySelector('.filters-wrapper')) {
    injectFilters(tabContent, 'class', () => studentTabManager.reloadActiveTab());
    const normalizedFilters = normalizeFilterValues(lastUsedStudentFilters);
    restoreFilterCheckboxStates(
        tabContent.querySelector('[data-element="filtersContainer"]'),
        normalizedFilters
    );
}
        // ✅ Render using active filters + status
        filterAndRenderStudents({ filters: { ...lastUsedStudentFilters, status } });
    };
}


    studentTabManager = new TabManager(tabButtons, tabContents, undefined, contentLoaders);
    window.studentTabManager = studentTabManager; 
    window.currentActiveStudentTypeTabLabel = currentActiveStudentTypeTabLabel; // Make it globally accessible

    initializeEventListeners(studentTabManager);
    showStudentsTab(studentTabManager);

    studentTabManager.reloadActiveTab();
}

// Register initializer for when tab is activated
window.registerTabInitializer?.('students', initializeStudentsPage);
