// utils/uiUtils.js
export function getElementsByDataAttribute(attribute = 'data-element') {
    const elements = document.querySelectorAll(`[${attribute}]`);
    return Array.from(elements).reduce((acc, el) => {
        const key = el.getAttribute(attribute);
        if (key) acc[key] = el;
        return acc;
    }, {});
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
export let totalStudents = 0;
export let totalPages = 0;

export function addPaginationControls() {
    // Implement logic to add pagination controls
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    elements.studentListContainer.after(paginationContainer);
    renderPaginationButtons();
}

export function renderPaginationButtons() {
    // Implement logic to render pagination buttons
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const pageNumbers = calculatePageNumbers();
    pageNumbers.forEach(page => {
        const button = document.createElement('button');
        button.textContent = page;
        button.addEventListener('click', () => {
            currentPage = page;
            filterAndRenderStudents(currentPage, studentsPerPage);
        });
        paginationContainer.appendChild(button);
    });
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

