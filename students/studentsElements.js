import { getElementsByDataAttribute } from '../utils/uiUtils.js';

export let elements = {};

export function initializeElements() {
    console.log("🟢 Running initializeElements()...");
    elements = getElementsByDataAttribute('data-element');
    console.log("🟢 Elements found:", elements);

    if (Object.keys(elements).length === 0) {
        console.warn("⚠️ Warning: No elements found with 'data-element' attributes.");
    }
}
