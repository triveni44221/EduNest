// students/studentsForm.js
import { YEAR_OPTIONS, GENDER_OPTIONS, GROUP_OPTIONS, MEDIUM_OPTIONS, SECOND_LANGUAGE_OPTIONS, NATIONALITY_OPTIONS, SCHOLARSHIP_OPTIONS, OCCUPATION_OPTIONS, PHYSICALLY_HANDICAPPED_OPTIONS, QUALIFYING_EXAM_OPTIONS, PARENTS_INCOME_OPTIONS, BATCH_YEAR_OPTIONS } from "./studentsData.js";
import { calculateDateYearsAgo } from "../utils/dataUtils.js";
import { capitalizeFirstLetter, displayStudentPhoto } from "../utils/uiUtils.js"; 
import { elements, initializeElements } from './studentsElements.js';
import { handleFormSubmit } from './studentsEvents.js';
import { setActiveTab } from './studentsUI.js';


function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = ""}) {
    
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');
    
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', elementName);
    labelElement.textContent = label;
    formGroup.appendChild(labelElement);

    let inputElement;
    if (type === 'select') {
        inputElement = document.createElement('select');
        inputElement.setAttribute('data-element', elementName);
        inputElement.setAttribute('data-form-field', ''); 
        inputElement.name = elementName;
        inputElement.required = required;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = `Please Select`;
        inputElement.appendChild(defaultOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === value) optionElement.selected = true;
            inputElement.appendChild(optionElement);
        });
    } else {
        inputElement = document.createElement('input');
        inputElement.type = type;
        inputElement.setAttribute('data-element', elementName);
        inputElement.setAttribute('data-form-field', ''); 
        inputElement.required = required;

        if (pattern) inputElement.pattern = pattern;
        if (minLength !== "") inputElement.minLength = minLength;
        if (maxLength !== "") inputElement.maxLength = maxLength;
        if (min !== "") inputElement.min = min;
        if (max !== "") inputElement.max = max;
        if (type === "number") inputElement.step = "0.01";
        inputElement.value = value || ""; 

        if (type === 'text') {
            inputElement.addEventListener('input', function() {
                this.value = capitalizeFirstLetter(this.value);
            });
        }
    }

    formGroup.appendChild(inputElement);

    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message');
    errorMessage.setAttribute('data-element', `${elementName}Error`);
    formGroup.appendChild(errorMessage);

    return formGroup;
} 

export function renderStudentForm(container, isEdit = false, studentData = {}) {
    if (!container) {   
        console.error("Form container not found!");
        return;
    }

    let studentId = studentData && studentData.studentId !== undefined ? studentData.studentId : undefined;
    let gender = studentData && studentData.gender !== undefined ? studentData.gender : undefined;


const currentYear = new Date().getFullYear();


const createField = (label, elementName, type, extra = {}) => ({ label, elementName, type, value: studentData[elementName] || '', ...extra });

const createSelectField = (label, elementName, options, required = true, defaultValue = '', studentData = {}) => {
    const value = studentData[elementName] !== undefined ? studentData[elementName] : defaultValue;
    return createField(label, elementName, 'select', { options, required, value });
};
const createTextField = (label, elementName, required = true, extra = {}) => 
    createField(label, elementName, 'text', { required, ...extra });

const createNumberField = (label, elementName, min, max, extra = {}) => 
    createField(label, elementName, 'number', { min, max, ...extra });

const createDateField = (label, elementName, min, max, extra = {}) => 
    createField(label, elementName, 'date', { min, max, required: true, ...extra });

const formFields = [
    // Admission Details
    createTextField('Name of the Student', 'studentName', true, { minLength: 3 }),
    createSelectField('Gender', 'gender', GENDER_OPTIONS, true, '', studentData),
    createNumberField('Admission No.', 'admissionNumber', 1000, 9999, { disabled: true }),
    createDateField('Date of Admission', 'dateOfAdmission', calculateDateYearsAgo(10), new Date().toISOString().split('T')[0], isEdit ? { disabled: true } : {}),
    createSelectField('Batch Year', 'batchYear', BATCH_YEAR_OPTIONS, true, `${currentYear}-${currentYear + 1}`, studentData),
    createSelectField('Class Year', 'classYear', YEAR_OPTIONS, true, 'first', studentData),
    createSelectField('Group', 'groupName', GROUP_OPTIONS, true, '', studentData),
    createSelectField('Medium', 'medium', MEDIUM_OPTIONS, true, 'english', studentData),
    createSelectField('Second Language', 'secondLanguage', SECOND_LANGUAGE_OPTIONS, true, 'sanskrit', studentData),

    // Personal Details
    createDateField('Date of Birth', 'dob', calculateDateYearsAgo(25), calculateDateYearsAgo(10)),
    createSelectField('Nationality', 'nationality', NATIONALITY_OPTIONS, true, 'indian', studentData),
    createTextField('Religion', 'religion'),
    createTextField('Community', 'community'),
    createTextField('Mother Tongue', 'motherTongue'),
    createSelectField('Scholarship', 'scholarship', SCHOLARSHIP_OPTIONS, true, '', studentData),
    createSelectField("Parent's Annual Income", 'parentsIncome', PARENTS_INCOME_OPTIONS, true, '', studentData),
    createSelectField('Physically Handicapped', 'physicallyHandicapped', PHYSICALLY_HANDICAPPED_OPTIONS, true, '', studentData),
    createTextField('Aadhaar (UID)', 'aadhaar', true, { pattern: '\\d{12}', maxLength: 12 }),
    createTextField('Additional Contact No.', 'additionalCell', false, { pattern: '^[6789]\\d{9}$', maxLength: 10 }),
    createTextField('Identification Mark 1', 'identificationMark1'),
    createTextField('Identification Mark 2', 'identificationMark2', false),

    // Parent Details
    createTextField("Father's Name", 'fathersName', true, { minLength: 3 }),
    createTextField("Father's Cell No.", 'fatherCell', true, { pattern: '^[6789]\\d{9}$', maxLength: 10 }),
    createSelectField("Father's Occupation", 'fatherOccupation', OCCUPATION_OPTIONS, true, '', studentData),
    createTextField("Mother's Name", 'mothersName', true, { minLength: 3 }),
    createTextField("Mother's Cell No.", 'motherCell', true, { pattern: '^[6789]\\d{9}$', maxLength: 10 }),
    createSelectField("Mother's Occupation", 'motherOccupation', OCCUPATION_OPTIONS, true, '', studentData),

    // Address Details
    createTextField('House Number', 'hno'),
    createTextField('Street', 'street'),
    createTextField('Village', 'village'),
    createTextField('Mandal', 'mandal'),
    createTextField('District', 'district'),
    createTextField('State', 'state'),
    createTextField('Pincode', 'pincode', true, { pattern: '\\d{6}', maxLength: 6 }),

    // Academic Details
    createSelectField('Qualifying Exam', 'qualifyingExam', QUALIFYING_EXAM_OPTIONS, true, '', studentData),
    createNumberField('Year of Exam', 'yearOfExam', 2020, currentYear),
    createTextField('Hall Ticket Number', 'hallTicketNumber'),
    createNumberField('GPA', 'gpa', 5, 10, { step: 0.01 }),
];


const form = document.createElement('form');
form.setAttribute('data-element', isEdit ? 'editStudentForm' : 'addStudentForm');
form.setAttribute('data-form-type', isEdit ? 'edit' : 'add'); 
form.removeEventListener('submit', handleFormSubmit);

container.innerHTML = '';
form.innerHTML = '';

if (isEdit) {
    const studentIdContainer = document.createElement('div');
    studentIdContainer.classList.add('student-id-container');

    const studentIdLabel = document.createElement('span');
    studentIdLabel.textContent = 'Student ID:';
    studentIdLabel.classList.add('student-id-label');

    const studentIdValue = document.createElement('span');
    studentIdValue.textContent = studentId || 'N/A';
    studentIdValue.classList.add('student-id-value');

    studentIdContainer.appendChild(studentIdLabel);
    studentIdContainer.appendChild(studentIdValue);

    container.prepend(studentIdContainer); // Place it above the form
}



function createFieldset(title, fields) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = title;
    fieldset.appendChild(legend);

    fields.forEach(rowFields => {
        const row = document.createElement('div');
        row.classList.add('form-row');
        rowFields.forEach(field => row.appendChild(createFormField({ ...field })));
        fieldset.appendChild(row);
    });

    return fieldset;
}

// Field grouping logic
const fieldsetGroups = {
    'Admission Details': [[0], [1, 2, 3, 4], [5, 6, 7, 8]],
    'Personal Details': [[0, 1], [2, 3, 4], [5, 6, 7], [8, 9], [10, 11]],
    'Parent Details': [[0, 1, 2], [3, 4, 5]],
    'Address Details': [[0, 1, 2], [3, 4, 5, 6]],
    'Academic Details': [[0, 1, 2, 3]]
};

// Adjust slice indexes based on `isEdit`
const adjustedIndexes = [9, 21, 27, 34, 38];

// Generate fieldsets dynamically
Object.entries(fieldsetGroups).forEach(([groupName, rows], index) => {
    const start = index === 0 ? 0 : adjustedIndexes[index - 1];
    const end = adjustedIndexes[index];

    const groupFields = formFields.slice(start, end);
    const fieldRows = rows.map(indices => indices.map(i => groupFields[i]));

    const fieldset = createFieldset(groupName, fieldRows);

    if (groupName === 'Admission Details') {
        const nameRow = fieldset.querySelector('.form-row');
        if (nameRow) {
            const photoDiv = document.createElement('div');
            photoDiv.classList.add('student-photo-container'); // Apply CSS class


            displayStudentPhoto(studentData, photoDiv); // Use the reusable function
            nameRow.appendChild(photoDiv);
        }
    }
    
    if (groupName === 'Address Details') {
        const permanentAddressDiv = document.createElement('div');

        permanentAddressDiv.innerHTML = `
            <div class="form-row">
                <label for="sameAsPresent">Is the Permanent Address same as Present Address?</label>
                <div class="radio-group">
                    <label><input type="radio" id="sameYes" name="sameAsPresent" value="yes"> Yes</label>
                    <label><input type="radio" id="sameNo" name="sameAsPresent" value="no"> No</label>
                </div>
            </div>
            <div id="permanentAddressFields" style="display: none;">
                ${createPermanentAddressFields()}
            </div>
        `;
        fieldset.appendChild(permanentAddressDiv);

        // Add event listeners
        const sameYes = permanentAddressDiv.querySelector('#sameYes');
        const sameNo = permanentAddressDiv.querySelector('#sameNo');
        const permanentAddressFields = permanentAddressDiv.querySelector('#permanentAddressFields');

        sameYes.addEventListener('change', () => permanentAddressFields.style.display = 'none');
        sameNo.addEventListener('change', () => permanentAddressFields.style.display = 'block');
    }

    form.appendChild(fieldset);
});


const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.className = 'submit-button';
submitButton.textContent = isEdit ? 'Update' : 'Submit';
form.appendChild(submitButton);

container.appendChild(form);



function initializeFormValues() { 
    
    initializeElements();
    const nationalitySelect = elements.nationality;
    
    if (!nationalitySelect) {
        console.error("Nationality select not found!");
        return; 
       }

       function handleOtherNationalityField(value) {
  
        let nationalityOtherField = elements.otherNationalityField;

        if (value === 'others') {
            if (!nationalityOtherField) {
                const otherNationalityField = createFormField({
                    label: 'Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true,
                    value: studentData.otherNationality || '' // Pre-fill for edit mode
                });

                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                nationalitySelect.parentNode.after(otherNationalityField);
                initializeElements(); // Re-initialize element references
            }
        } else if (nationalityOtherField) {
            nationalityOtherField.remove();

            initializeElements();
        }
    }

    // Attach event listener to nationality select field
    nationalitySelect.addEventListener('change', () => handleOtherNationalityField(nationalitySelect.value));

    // Ensure field is displayed when editing
    handleOtherNationalityField(nationalitySelect.value);
}
setTimeout(initializeFormValues, 0);

form.addEventListener('submit', handleFormSubmit); 

return form; 
}

function createPermanentAddressFields() {
    const permFields = [
        { label: 'House Number', elementName: 'perm_hno', type: 'text' },
        { label: 'Street', elementName: 'perm_street', type: 'text' },
        { label: 'Village', elementName: 'perm_village', type: 'text' },
        { label: 'Mandal', elementName: 'perm_mandal', type: 'text' },
        { label: 'District', elementName: 'perm_district', type: 'text' },
        { label: 'State', elementName: 'perm_state', type: 'text' },
        { label: 'Pincode', elementName: 'perm_pincode', type: 'text', pattern: '\\d{6}', maxLength: 6 }
    ];

    let html = '';
    permFields.forEach(field => {
        html += `<div class="form-group">${createFormField(field).innerHTML}</div>`;
    });
    return html;
}

export function showEditStudent(studentData) {
    setActiveTab({
        activeButton: elements.addStudentTabButton,
        inactiveButton: elements.allStudentsTabButton,
        visibility: {
            show: [elements.addStudentTab],
            hide: [elements.allStudentsTab],
        },
    });

    localStorage.removeItem("addStudentFormData");

    renderStudentForm(elements.addStudentFormContainer, true, studentData);
    initializeElements();
    const form = document.getElementById('editStudentForm');
    elements.editStudentForm.dataset.studentId = studentData.studentId;
    elements.editStudentForm.removeEventListener('submit', handleFormSubmit);
    elements.editStudentForm.addEventListener('submit', handleFormSubmit);
  }

export function displayFormErrors(errors) {
    for (const field in errors) {
        const errorElement = elements[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    }
}



/*function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = ""}) {
    
    const formGroup = document.createElement('div');
    formGroup.classList.add('form-group');
    
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', elementName);
    labelElement.textContent = label;
    formGroup.appendChild(labelElement);

    let inputElement;
    if (type === 'select') {
        inputElement = document.createElement('select');
        
        const defaultOption = new Option(`Select ${label}`, "", true, true);
        defaultOption.disabled = true;
        inputElement.appendChild(defaultOption);

        options.forEach(option => {
            inputElement.appendChild(new Option(option.label, option.value, false, option.value === value));
        });
    } else {
        inputElement = document.createElement('input');
        inputElement.type = type;

        // Validation attributes, ensuring maxLength >= minLength
        const validationAttributes = {
            pattern,
            min: min || undefined,
            max: max || undefined,
            value: value || ""
        };

        // Conditionally set minLength and maxLength
        if (minLength) {
            validationAttributes.minLength = minLength;
            if (maxLength && maxLength < minLength) {
                validationAttributes.maxLength = minLength; // Ensure maxLength is at least minLength
            } else if (maxLength) {
                validationAttributes.maxLength = maxLength;
            }
        } else if (maxLength) {
            validationAttributes.maxLength = maxLength;
        }

        Object.assign(inputElement, validationAttributes);

        if (type === "number") inputElement.step = "0.01";

        if (type === 'text') {
            inputElement.addEventListener('input', function() {
                this.value = capitalizeFirstLetter(this.value);
            });
        }
    }


    // Common attributes for both input types
    Object.assign(inputElement, {
        name: elementName,
        required,
        'data-element': elementName,
        'data-form-field': ''
    });

    formGroup.appendChild(inputElement);

    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message');
    errorMessage.setAttribute('data-element', `${elementName}Error`);
    formGroup.appendChild(errorMessage);

    return formGroup;
} 











    */