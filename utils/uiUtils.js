    // utils/uiUtils.js

    export function getElementsByDataAttribute(attribute = 'data-element') {
        try {
            const elements = document.querySelectorAll(`[${attribute}]`);
            return Array.from(elements).reduce((acc, el) => {
                const key = el.getAttribute(attribute);
                if (key) acc[key] = el;
                return acc;
            }, {});
        } catch (error) {
            console.error("Error in getElementsByDataAttribute:", error);
            return {}; // Return an empty object in case of error
        }
    }

    export function capitalizeFirstLetter(str) {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    export function toggleVisibility({ show = [], hide = [] }) {
        show.forEach((element) => element?.classList.remove('hidden'));
        hide.forEach((element) => element?.classList.add('hidden'));
    }

    export let currentPage = 1;
    export const studentsPerPage = 30;
    export let totalPages = 1;
    let totalStudents = 0;

    export function getTotalStudents() {
        return totalStudents;
    }
    export function setTotalStudents(count) {
        totalStudents = count;
        setTotalPages(Math.ceil(totalStudents / studentsPerPage));  // Use setter
    }

    export function setTotalPages(value) {
        totalPages = value;
    }

    export function calculatePageNumbers() {
        const pageNumbers = [];
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const middleButton = Math.floor(maxPageButtons / 2);

            if (currentPage <= middleButton) {
                for (let i = 1; i <= maxPageButtons; i++) {
                    pageNumbers.push(i);
                }
                if (maxPageButtons < totalPages) {
                    pageNumbers.push('...');
                    pageNumbers.push(totalPages);
                }
            } else if (currentPage >= totalPages - middleButton) {
                if (totalPages - maxPageButtons > 0) {
                    pageNumbers.push(1);
                    pageNumbers.push('...');
                }
                for (let i = totalPages - maxPageButtons + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - middleButton; i <= currentPage + middleButton; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    }

    export function renderPaginationControls() {
        if (!elements.studentListContainer || !elements.studentListContainer.parentNode) {
            console.error("studentListContainer or its parent is undefined.");
            return;
        }
    
        let paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination-container';
            paginationContainer.setAttribute('data-element', 'paginationContainer');
            elements.studentListContainer.parentNode.insertBefore(paginationContainer, elements.studentListContainer.nextSibling);
        }
        
        elements.paginationContainer = paginationContainer; // Ensure it's set
        renderPaginationButtons();
    }
    
    export function renderPaginationButtons() {
        if (!elements.paginationContainer) {
            console.error("Pagination container is undefined. Ensure it is created before calling this function.");
            return;
        }
    
        elements.paginationContainer.innerHTML = '';
        totalPages = totalPages || 1;
    
        function createButton(label, isDisabled, onClick) {
            if (label === '...') {
                const span = document.createElement('span');
                span.textContent = '...';
                return span; // Return non-clickable span for '...'
            }
            
            const button = document.createElement('button');
            button.textContent = label;
            button.disabled = isDisabled;
            button.addEventListener('click', (event) => {
                event.preventDefault();
                onClick(Number(label));
            });
            return button;
        }
    
        const buttons = [
            createButton('First', currentPage === 1, () => updatePagination(1)),
            createButton('Previous', currentPage === 1, () => updatePagination(currentPage - 1))
        ];
    
        calculatePageNumbers().forEach((pageNumber) => {
            buttons.push(createButton(pageNumber, pageNumber === currentPage, () => updatePagination(Number(pageNumber))));
        });
    
        buttons.push(
            createButton('Next', currentPage === totalPages, () => updatePagination(currentPage + 1)),
            createButton('Last', currentPage === totalPages, () => updatePagination(totalPages))
        );
    
        buttons.forEach((button) => elements.paginationContainer.appendChild(button));
    
        const totalPagesSpan = document.createElement('span');
        totalPagesSpan.textContent = ` / ${totalPages}`;
        elements.paginationContainer.appendChild(totalPagesSpan);
    }
    
    function updatePagination(newPage) {
        if (newPage instanceof Event) {
            console.error("Event received instead of page number. Fixing...");
            return;
        }
    
        newPage = Number(newPage) || 1; // Convert to number, default to 1 if invalid
    
        if (isNaN(newPage)) {
            console.error("Invalid page number:", newPage);
            return;
        }
    
        // Ensure totalPages is valid before proceeding
        if (isNaN(totalPages) || totalPages < 1) {
            console.warn("No valid pages available. Skipping pagination update.");
            return;
        }
    
        // Prevent unnecessary updates
        if (newPage === currentPage) {
                        return;
        }
    
        // Ensure newPage is within valid range
        currentPage = Math.max(1, Math.min(newPage, totalPages));
    
        // Re-render only if a valid page change occurred
        filterAndRenderStudents(currentPage, studentsPerPage);
        renderPaginationButtons();
    }
    

    export function sortData(data, key, ascending = true) {
        return data.sort((a, b) => {
            const valueA = parseFloat(a[key] || 0);
            const valueB = parseFloat(b[key] || 0);
            const comparison = isNaN(valueA) || isNaN(valueB)
                ? (a[key] || '').toString().toLowerCase().localeCompare((b[key] || '').toString().toLowerCase())
                : valueA - valueB;
            return ascending ? comparison : -comparison;
        });
    }


