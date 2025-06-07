import { normalizeString } from './dataUtils.js';

export function getElementsByDataAttribute(attribute = "data-element") {
    try {
        const elements = document.querySelectorAll(`[${attribute}]`);
        return Array.from(elements).reduce((acc, el) => {
            const key = el.getAttribute(attribute);
            if (key) acc[key] = el;
            return acc;
        }, {});
    } catch (error) {
        console.error("Error in getElementsByDataAttribute:", error);
        return {}; 
    }
}
    
 export function toggleVisibility({ show = [], hide = [] }) {

        const showList = Array.isArray(show) ? show : [show];
        const hideList = Array.isArray(hide) ? hide : [hide];
    
        showList.forEach((el) => {
            if (el) {
                el.classList.remove('hidden');
                el.style.removeProperty('display'); // let CSS take over
            }
        });
    
        hideList.forEach((el) => {
            if (el) {
                el.classList.add('hidden');
                el.style.removeProperty('display'); // remove any inline override
            }
        });
    }

    
    export function sortData(data, key, ascending = true) {
        return data.sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];
    
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                // Numeric comparison
                return ascending ? valueA - valueB : valueB - valueA;
            } else {
                // String comparison (using localeCompare for better handling of accented characters)
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return ascending
                        ? normalizeString(valueA).localeCompare(normalizeString(valueB))
                        : normalizeString(valueB).localeCompare(normalizeString(valueA));
                } else {
                    // Handle cases where values are not both numbers or both strings
                    const strA = String(valueA);
                    const strB = String(valueB);
                    return ascending
                        ? normalizeString(strA).localeCompare(normalizeString(strB))
                        : normalizeString(strB).localeCompare(normalizeString(strA));
                }
            }
        });
    }
  
    /**
 * @param {Array<Object>} path An array of objects, each with a 'label' and optional 'onClick' function.
 * Example: [{ label: 'Home', onClick: () => navigateTo('/') }, { label: 'Category' }]
 * @param {HTMLElement} container The DOM element where the breadcrumbs should be rendered.
 */

// src/utils/navigationUtils.js
export function renderBreadcrumbs(path, container) {
    if (!container) {
        console.error("Breadcrumb container not found!");
        return;
    }

    container.innerHTML = ""; // Clear any existing breadcrumbs

    path.forEach((item, index) => {
        const itemSpan = document.createElement("span");
        itemSpan.classList.add("breadcrumb-item");

        if (index < path.length - 1 && item.onClick) {
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = item.label;
            link.addEventListener("click", (event) => {
                event.preventDefault();
                item.onClick();
            });
            itemSpan.appendChild(link);
        } else {
            itemSpan.textContent = item.label;
            itemSpan.classList.add("current-page");
        }

        container.appendChild(itemSpan);

        if (index < path.length - 1) {
            const separatorSpan = document.createElement("span");
            separatorSpan.classList.add("breadcrumb-item", "separator");
            separatorSpan.textContent = ">";
            container.appendChild(separatorSpan);
        }
    });
}

export function updateStudentDetailBreadcrumbs(elements, activeDetailTabLabel) {
    const activeMainTabLabel = window.currentActiveStudentTypeTabLabel || "Active Students";

    const breadcrumbPath = [
        {
            label: "Students",
            onClick: () => {
                console.log("Breadcrumb click: Navigating back to main Students view.");
                toggleVisibility({
                    show: [
                        elements.studentListContainer,
                        elements.filtersContainer,
                        elements.controlsContainer,
                        elements.paginationContainer,
                        elements.studentTypeTabs
                    ],
                    hide: [
                        elements.studentDataContainer,
                        elements.breadcrumbContainer,
                        elements.addStudentFormContainer
                    ]
                });
                // Reset filters when navigating to main Students view
                Object.keys(lastUsedStudentFilters).forEach(key => delete lastUsedStudentFilters[key]);
                if (window.studentTabManager) {
                    window.studentTabManager.switchTab(elements.activeStudentsTabButton);
                }
            }
        },
        {
            label: activeMainTabLabel,
            onClick: () => {
                console.log(`Breadcrumb click: Navigating back to ${activeMainTabLabel} tab.`);
                toggleVisibility({
                    show: [
                        elements.studentListContainer,
                        elements.filtersContainer,
                        elements.controlsContainer,
                        elements.paginationContainer,
                        elements.studentTypeTabs
                    ],
                    hide: [
                        elements.studentDataContainer,
                        elements.breadcrumbContainer,
                        elements.addStudentFormContainer
                    ]
                });

                if (window.studentTabManager) {
                    const buttonToClick = Array.from(elements.studentTypeTabs.children).find(btn => btn.textContent === activeMainTabLabel);
                    if (buttonToClick) {
                        window.studentTabManager.switchTab(buttonToClick);
                    } else {
                        console.warn(`Could not find button for tab label: ${activeMainTabLabel}. Falling back to default.`);
                        if (elements.activeStudentsTabButton) {
                            window.studentTabManager.switchTab(elements.activeStudentsTabButton);
                        }
                    }
                }
            }
        },
        {
            label: activeDetailTabLabel || "Basic Details"
        }
    ];

    renderBreadcrumbs(breadcrumbPath, elements.breadcrumbContainer);
}