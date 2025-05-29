import { getElementsByDataAttribute } from "./uiUtils.js";


export let elements = {};

export function initializeElements() {
    elements = getElementsByDataAttribute("data-element");

    if (Object.keys(elements).length === 0) {
        console.warn("⚠️ Warning: No elements found with 'data-element' attributes.");
    }

    const requiredElements = [
        "basicDetailsTab", "feeTab", "academicsTab", "attendanceTab", "certificatesTab",
        "basicDetailsTabContent", "feeTabContent", "academicsTabContent", "attendanceTabContent", "certificatesTabContent"
    ];
    requiredElements.forEach(id => {
        if (!elements[id]) {
            console.warn(`⚠️ Warning: Missing element '${id}' in sharedElements.js`);
        }
    });
}

export function updateElements() {
    const newElements = getElementsByDataAttribute("data-element");

    Object.entries(newElements).forEach(([key, el]) => {
        if (!elements[key] || elements[key] !== el) {
            elements[key] = el;
        }
    });
    
}
