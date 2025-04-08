// paginationUtils.js
import { elements } from "./sharedElements.js";

export function initPagination({ 
    container, 
    totalItems, 
    itemsPerPage = 10, 
    onPageChange, 
    currentPage = 1 
}) {
    if (!container || !container.parentNode) {
        console.error("❌ Invalid container passed to initPagination.");
        return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.style.display = 'block';
    container.innerHTML = '';

    function render() {
        console.log("Rendering page", currentPage);
        container.innerHTML = '';

        const maxVisiblePages = 7;
        const buffer = Math.floor(maxVisiblePages / 2);

        const createButton = (label, isActive, callback, extraClass = '') => {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.disabled = false;
            if (isActive) {
                btn.classList.add("active");
                console.log(`👉 Active class added to: ${label}`);
            }
            if (extraClass) btn.classList.add(extraClass);
            btn.addEventListener("click", callback);
            return btn;
        };

        const createEllipsis = () => {
            const span = document.createElement("span");
            span.textContent = "...";
            span.classList.add("ellipsis");
            return span;
        };

        const renderPageButton = (page) => {
            const isActive = page === currentPage;
            container.appendChild(
                createButton(page, isActive, () => {
                    currentPage = page;
                    onPageChange(page);
                })
            );
        };

        // « First
        if (currentPage > 1) {
            container.appendChild(
                createButton("«", false, () => {
                    currentPage = 1;
                    onPageChange(currentPage);
                })
            );
        }

        // ‹ Skip -10
        if (currentPage > 10) {
            container.appendChild(
                createButton("‹", false, () => {
                    currentPage = Math.max(1, currentPage - 10);
                    onPageChange(currentPage);
                })
            );
        }

        // Always show first page
        renderPageButton(1);

        let start = Math.max(2, currentPage - buffer);
        let end = Math.min(totalPages - 1, currentPage + buffer);

        // Adjust if we are near the start or end
        if (currentPage <= buffer + 1) {
            start = 2;
            end = Math.min(totalPages - 1, maxVisiblePages);
        } else if (currentPage >= totalPages - buffer) {
            start = Math.max(2, totalPages - maxVisiblePages + 1);
            end = totalPages - 1;
        }

        if (start > 2) container.appendChild(createEllipsis());

        for (let i = start; i <= end; i++) {
            renderPageButton(i);
        }

        if (end < totalPages - 1) container.appendChild(createEllipsis());

        // Always show last page if totalPages > 1
        if (totalPages > 1) {
            renderPageButton(totalPages);
        }

        // › Skip +10
        if (currentPage < totalPages - 9) {
            container.appendChild(
                createButton("›", false, () => {
                    currentPage = Math.min(totalPages, currentPage + 10);
                    onPageChange(currentPage);
                })
            );
        }

        // » Last
        if (currentPage < totalPages) {
            container.appendChild(
                createButton("»", false, () => {
                    currentPage = totalPages;
                    onPageChange(currentPage);
                })
            );
        }
    }

    render(currentPage);
}

export function ensurePaginationContainer(afterElement) {
    if (!elements.container) {
        const container = document.createElement("div");
        container.className = "pagination-container";
        container.setAttribute("data-element", "container");
        afterElement.parentNode.insertBefore(container, afterElement.nextSibling);
        elements.container = container;
    }
}
