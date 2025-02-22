// students/studentsForm.js
import { YEAR_OPTIONS, GROUP_OPTIONS, MEDIUM_OPTIONS, SECOND_LANGUAGE_OPTIONS, NATIONALITY_OPTIONS, SCHOLARSHIP_OPTIONS, PHYSICALLY_HANDICAPPED_OPTIONS, QUALIFYING_EXAM_OPTIONS, PARENTS_INCOME_OPTIONS, BATCH_YEAR_OPTIONS } from "./studentsData.js";
import { calculateDateYearsAgo } from "../utils/dataUtils.js";
import { capitalizeFirstLetter } from "../utils/uiUtils.js";

import { createFormField, renderStudentForm } from './studentsForm.js';
import { getElementsByDataAttribute } from '../utils/uiUtils.js';

let elements = getElementsByDataAttribute('data-element');

export function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = "" }) {
    // ... your createFormField code ...
}

export function renderStudentForm(container, isEdit = false, studentData = {}) {
    // ... your renderStudentForm code ...
}

export function initializeFormValues() {
    // Ensure elements are fetched before using them
    Object.assign(elements, getElementsByDataAttribute('data-element'));

    console.log('Elements object:', elements); // Debugging line

    const nationalitySelect = elements.nationality;

    if (!nationalitySelect) {
        console.error('Nationality select not found!');
        return; // Stop execution if not found
    }

    nationalitySelect.addEventListener('change', function () {
        let nationalityOtherField = elements.otherNationalityField;

        if (this.value === 'others') {
            if (!nationalityOtherField) {
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true,
                });

                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                this.parentNode.after(otherNationalityField);

                // 🔹 **Update elements list**
                elements = getElementsByDataAttribute('data-element');
                console.log('Updated elements:', elements); // Debugging line
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                // 🔹 **Update elements list**
                elements = getElementsByDataAttribute('data-element');
                console.log('Updated elements after removal:', elements); // Debugging line
            }
        }
    });

    console.log('Nationality select successfully initialized!');
}

setTimeout(initializeFormValues, 0);

const nationalitySelect = elements.nationality;
if (nationalitySelect) {
    nationalitySelect.addEventListener('change', function () {
        let nationalityOtherField = elements.otherNationalityField; // Existing reference

        if (this.value === 'others') {
            if (!nationalityOtherField) {
                // Field doesn't exist, create it
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true,
                });
                otherNationalityField.setAttribute('data-element', 'otherNationalityField');

                this.parentNode.after(otherNationalityField);

                // 🔹 **Re-fetch `elements` to include new field**
                elements = getElementsByDataAttribute('data-element');
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                // 🔹 **Re-fetch `elements` after removing**
                elements = getElementsByDataAttribute('data-element');
            }
        }
    });
} else {
    console.error('Nationality select not found!');
}

export function displayFormErrors(errors) {

      elements = getElementsByDataAttribute("data-element");
    
        for (const field in errors) {
            const errorElement = elements[`${field}Error`]; 
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
        }
    }
    