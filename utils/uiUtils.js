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
