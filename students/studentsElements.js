import { getElementsByDataAttribute } from '../utils/uiUtils.js';

export let elements = {};

export function initializeElements() {
    elements = getElementsByDataAttribute('data-element');

    if (Object.keys(elements).length === 0) {
        console.warn("⚠️ Warning: No elements found with 'data-element' attributes.");
    }
}
