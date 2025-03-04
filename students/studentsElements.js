import { getElementsByDataAttribute } from '../utils/uiUtils.js';

export let elements = {};

export function initializeElements() {
    console.log('studentsElements.js: initializeElements() start');
    elements = getElementsByDataAttribute('data-element');

    if (Object.keys(elements).length === 0) {
        console.warn("⚠️ Warning: No elements found with 'data-element' attributes.");
    }
    console.log('studentsElements.js: initializeElements() end');
}
