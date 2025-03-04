// students/studentsForm.js
import { YEAR_OPTIONS, GROUP_OPTIONS, MEDIUM_OPTIONS, SECOND_LANGUAGE_OPTIONS, NATIONALITY_OPTIONS, SCHOLARSHIP_OPTIONS, PHYSICALLY_HANDICAPPED_OPTIONS, QUALIFYING_EXAM_OPTIONS, PARENTS_INCOME_OPTIONS, BATCH_YEAR_OPTIONS } from "./studentsData.js";
import { calculateDateYearsAgo } from "../utils/dataUtils.js";
import { capitalizeFirstLetter} from "../utils/uiUtils.js"; 
import { elements, initializeElements } from './studentsElements.js';
import { handleFormSubmit } from './studentsEvents.js';
import { setActiveTab } from './studentsUI.js';

function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = "" }) {
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
        defaultOption.textContent = `Select ${label}`;
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
const currentYear = new Date().getFullYear();


const formFields = [
    // Admission Details
    { label: 'Name of the Student', elementName: 'studentName', type: 'text', required: true, minLength: 3, value: studentData.studentName || '' },
    ...(isEdit ? [{ label: 'Student ID', elementName: 'studentId', type: 'number', required: true, value: studentData.studentId || '', disabled: true }] : []),
          
    { label: 'Admission No.', elementName: 'admissionNumber', type: 'number', min: 1000, max: 9999, value: studentData.admissionNumber || '', disabled: true },
    { label: 'Date of Admission', elementName: 'dateOfAdmission', type: 'date', required: true,min: calculateDateYearsAgo(10), max: new Date().toISOString().split('T')[0], value: studentData.dateOfAdmission || '', ...(isEdit ? { disabled: true } : {})},
    { label: 'Class Year', elementName: 'classYear', type: 'select', required: true, options: YEAR_OPTIONS, value: studentData.classYear || 'first' },
    { label: 'Group', elementName: 'groupName', type: 'select', required: true, options: GROUP_OPTIONS, value: studentData.groupName || '' },
    { label: 'Medium', elementName: 'medium', type: 'select', required: true, options: MEDIUM_OPTIONS, value: studentData.medium || 'english' },
    { label: 'Second Language', elementName: 'secondLanguage', type: 'select', required: true, options: SECOND_LANGUAGE_OPTIONS, value: studentData.secondLanguage || 'sanskrit' },
    { label: 'Batch Year', elementName: 'batchYear', type: 'select', required: true, options: BATCH_YEAR_OPTIONS, value: studentData.batchYear || `${currentYear}-${currentYear + 1}` },

    // Personal Details
    { label: 'Date of Birth', elementName: 'dob', type: 'date', required: true, min: calculateDateYearsAgo(25), max: calculateDateYearsAgo(10), value: studentData.dob || '' },
    { label: 'Nationality', elementName: 'nationality', type: 'select', required: true, options: NATIONALITY_OPTIONS, value: studentData.nationality || 'indian' },
    { label: 'Religion', elementName: 'religion', type: 'text', required: true, value: studentData.religion || '' },
    { label: 'Community', elementName: 'community', type: 'text', required: true, value: studentData.community || '' },
    { label: 'Mother Tongue', elementName: 'motherTongue', type: 'text', required: true, value: studentData.motherTongue || '' },
    { label: 'Scholarship', elementName: 'scholarship', type: 'select', required: true, options: SCHOLARSHIP_OPTIONS, value: studentData.scholarship || '' },
    { label: "Parent's Annual Income", elementName: 'parentsIncome', type: 'select', required: true,options: PARENTS_INCOME_OPTIONS, value: studentData.parentsIncome || '' },
    { label: 'Physically Handicapped', elementName: 'physicallyHandicapped', type: 'select', required: true, options: PHYSICALLY_HANDICAPPED_OPTIONS, value: studentData.physicallyHandicapped || '' },
    { label: 'Aadhaar (UID)', elementName: 'aadhaar', type: 'text', required: true, pattern: '\\d{12}', maxLength: 12, value: studentData.aadhaar || '' },
    { label: 'Additional Contact No.', elementName: 'additionalCell', type: 'text', pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.additionalCell || '' },
    { label: 'Identification Mark 1', elementName: 'identificationMark1', type: 'text', required: true, value: studentData.identificationMark1 || '' },
    { label: 'Identification Mark 2', elementName: 'identificationMark2', type: 'text', value: studentData.identificationMark2 || '' },

    // Parent Details
    { label: "Father's Name", elementName: 'fathersName', type: 'text', required: true, minLength: 3, value: studentData.fathersName || '' },
    { label: "Father's Cell No.", elementName: 'fatherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.fatherCell || '' },
    { label: "Mother's Name", elementName: 'mothersName', type: 'text', required: true, minLength: 3, value: studentData.mothersName || '' },
    { label: "Mother's Cell No.", elementName: 'motherCell', type: 'text', required: true, pattern: '^[6789]\\d{9}$', maxLength: 10, value: studentData.motherCell || '' },

    // Address Details
    { label: 'House Number', elementName: 'hno', type: 'text', required: true, value: studentData.hno || '' },
    { label: 'Street', elementName: 'street', type: 'text', required: true, value: studentData.street || '' },
    { label: 'Village', elementName: 'village', type: 'text', required: true, value: studentData.village || '' },
    { label: 'Mandal', elementName: 'mandal', type: 'text', required: true, value: studentData.mandal || '' },
    { label: 'District', elementName: 'district', type: 'text', required: true, value: studentData.district || '' },
    { label: 'State', elementName: 'state', type: 'text', required: true, value: studentData.state || '' },
    { label: 'Pincode', elementName: 'pincode', type: 'text', pattern: '\\d{6}', maxLength: 6, required: true, value: studentData.pincode || '' },

    // Academic Details
    { label: 'Qualifying Exam', elementName: 'qualifyingExam', type: 'select', required: true, options: QUALIFYING_EXAM_OPTIONS, value: studentData.qualifyingExam || '' },
    { label: 'Year of Exam', elementName: 'yearOfExam', type: 'number', required: true, min: 2020, max: currentYear, value: studentData.yearOfExam || '' },  
    { label: 'Hall Ticket Number', elementName: 'hallTicketNumber', type: 'text', required: true, value: studentData.hallTicketNumber || '' },
    { label: 'GPA', elementName: 'gpa', type: 'number', required: true, min: 5, max: 10, step: 0.01, value: studentData.gpa || '' }
];

const form = document.createElement('form');
form.setAttribute('data-element', isEdit ? 'editStudentForm' : 'addStudentForm');
form.setAttribute('data-form-type', isEdit ? 'edit' : 'add'); 
form.removeEventListener('submit', handleFormSubmit);

container.innerHTML = '';
form.innerHTML = '';

    const fieldsetGroups = {
    'Admission Details': formFields.slice(0, isEdit ? 9 : 8),
    'Personal Details': formFields.slice(isEdit ? 9 : 8, isEdit ? 21 : 20),
    'Parent Details': formFields.slice(isEdit ? 21 : 20, isEdit ? 25 : 24),
    'Address Details': formFields.slice(isEdit ? 25 : 24, isEdit ? 32 : 31),
    'Academic Details': formFields.slice(isEdit ? 32 : 31,isEdit ? 36 : 35)
    };

    for (const groupName in fieldsetGroups) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = groupName;
        fieldset.appendChild(legend);

        const groupFields = fieldsetGroups[groupName];
// Group fields into form-rows (add form-row divs)
let formRow;
groupFields.forEach((field, index) => {
    if (index % 3 === 0) { // Start a new row every 3 fields (adjust as needed)
        formRow = document.createElement('div');
        formRow.classList.add('form-row');
        fieldset.appendChild(formRow);
    }
    const formField = createFormField(field);
    formRow.appendChild(formField);
});
// Add Permanent Address logic inside Address Details fieldset
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

    const sameYes = permanentAddressDiv.querySelector('#sameYes');
    const sameNo = permanentAddressDiv.querySelector('#sameNo');
    const permanentAddressFields = permanentAddressDiv.querySelector('#permanentAddressFields');

    sameYes.addEventListener('change', function() {
        permanentAddressFields.style.display = 'none';
    });

    sameNo.addEventListener('change', function() {
        permanentAddressFields.style.display = 'block';
    });
}

        form.appendChild(fieldset);
    }

const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.className = 'submit-button';
submitButton.textContent = isEdit ? 'Update' : 'Submit';
form.appendChild(submitButton);

container.appendChild(form);

const studentIdField = form.querySelector('[data-element="studentId"]');
if (!isEdit && studentIdField) {
    studentIdField.parentElement.remove();
} else if (isEdit && studentIdField) {
    studentIdField.disabled = true;
}
function initializeFormValues() { 
    
    initializeElements();
    const nationalitySelect = elements.nationality;
    
    if (!nationalitySelect) {
        console.error("Nationality select not found!");
        return; 
       }

    nationalitySelect.addEventListener('change', function() {
        let nationalityOtherField = elements.otherNationalityField;

        if (this.value === 'others') {
            if (!nationalityOtherField) {
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true
                });

                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                this.parentNode.after(otherNationalityField);

                initializeElements();
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                // 🔹 **Update elements list**
                elements = getElementsByDataAttribute("data-element");

            }
        }
    });
}
setTimeout(initializeFormValues, 0);

const nationalitySelect = elements.nationality;
if (nationalitySelect) {
    nationalitySelect.addEventListener('change', function() {
        let nationalityOtherField = elements.otherNationalityField;
        
        if (this.value === 'others') {
            if (!nationalityOtherField) { 
                const otherNationalityField = createFormField({
                    label: 'Please Specify Nationality',
                    elementName: 'otherNationality',
                    type: 'text',
                    required: true
                });
                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                
                this.parentNode.after(otherNationalityField);

                initializeElements(); 
            }
        } else {
            if (nationalityOtherField) {
                nationalityOtherField.remove();

                initializeElements();
            }
        }
    });
} 
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
