// paginationUtils.js
import { elements, updateElements } from "./sharedElements.js";

export function initPagination({ 
    container, 
    totalItems, 
    itemsPerPage = 10, 
    onPageChange, 
    currentPage = 1 
}) {
    if (!container || !container.parentNode) {
        console.error("❌ Invalid container passed to initPagination.", {
            container,
            typeofContainer: typeof container,
            containerIsNull: container === null,
            containerIsUndefined: typeof container === 'undefined',
            containerNodeType: container?.nodeType,
            containerOuterHTML: container?.outerHTML || "(no outerHTML)",
            containerParent: container?.parentNode
        });
        return;
    }
    

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.innerHTML = '';

    function render(pageToRender) {
        currentPage = pageToRender; 
        
        container.innerHTML = '';

        const maxVisiblePages = 7;
        const buffer = Math.floor(maxVisiblePages / 2);

        const createButton = (label, isActive, callback, extraClass = '') => {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.disabled = false;
            if (isActive) {
                btn.classList.add("active");
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

        const renderPageButton = (pageNum) => {
            const isActive = Number(pageNum) === Number(currentPage);
            container.appendChild(
                createButton(String(pageNum), isActive, () => {
                    currentPage = pageNum;
                    onPageChange(pageNum);
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
    // Check if pagination container already exists
    if (!elements.paginationContainer) {
        const container = document.createElement("div");
        container.className = "pagination-container";
        container.setAttribute("data-element", "paginationContainer");
        afterElement.parentNode.insertBefore(container, afterElement.nextSibling);

        updateElements();

        elements.paginationContainer = container;
    }
}
