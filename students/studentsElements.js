import { getElementsByDataAttribute } from '../utils/uiUtils.js';

export let elements = {};

export function initializeElements() {
    elements = getElementsByDataAttribute('data-element');
}