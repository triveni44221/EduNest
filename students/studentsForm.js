// students/studentsForm.js
import { YEAR_OPTIONS, GENDER_OPTIONS, GROUP_OPTIONS, MEDIUM_OPTIONS, SECOND_LANGUAGE_OPTIONS, NATIONALITY_OPTIONS, SCHOLARSHIP_OPTIONS, OCCUPATION_OPTIONS, PHYSICALLY_HANDICAPPED_OPTIONS, QUALIFYING_EXAM_OPTIONS, PARENTS_INCOME_OPTIONS, BATCH_YEAR_OPTIONS, COACHING_OPTIONS  } from "./studentsData.js";
import { calculateDateYearsAgo } from "../utils/dataUtils.js";
import { capitalizeFirstLetter, createSubmitButton} from "../utils/uiUtils.js"; 
import { elements, initializeElements } from '../utils/sharedElements.js';
import { handleStudentFormSubmit } from './studentsEvents.js';
import { createStudentPhotoSection } from './studentsUI.js';
import { studentTabManager } from './students.js';


export function createFormField({ label, elementName, type = "text", options = [], required = false, pattern = "", minLength = "", maxLength = "", min = "", max = "", value = ""}) {
 
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
        if (type === "number") { inputElement.step = elementName === "gpa" ? "0.01" : "1"; }
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

export function createFieldset(title, fields) {
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

export function renderForm(container, formFields, fieldsetGroups, adjustedIndexes, isEdit, studentId, studentData, submitHandler) {

    const form = document.createElement('form');
    form.setAttribute('data-element', isEdit ? 'editStudentForm' : 'addStudentForm');
    formFields.forEach(field => {
        field.value = studentData[field.elementName] || field.value || ""; 
    });
    form.setAttribute('data-form-type', isEdit ? 'edit' : 'add');
    if (isEdit && studentId !== undefined) {
        form.dataset.studentId = studentId;
    }
    

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

        container.prepend(studentIdContainer);

    }

     Object.entries(fieldsetGroups).forEach(([groupName, rows], index) => {
        const start = index === 0 ? 0 : adjustedIndexes[index - 1];
        const end = adjustedIndexes[index];

        const groupFields = formFields.slice(start, end);
        const fieldRows = rows.map(indices => indices.map(i => groupFields[i]));

        const fieldset = createFieldset(groupName, fieldRows);
        form.appendChild(fieldset);
    });

    const submitButton = createSubmitButton(form, isEdit, submitHandler);

    container.appendChild(form);
    return { form, submitButton };
}

export function createField(label, elementName, type, extra = {}) {
    return { 
        label, elementName, type, value: extra.value !== undefined ? extra.value : '', ...extra 
    };
}

export function renderStudentForm(container, isEdit = false, studentData = {}) {
    if (!container) {   
        console.error("Form container not found!");
        return;
    }

    const studentFormContainer = document.createElement('div');
    studentFormContainer.id = 'studentFormContainer';
    container.appendChild(studentFormContainer);

    let studentId = studentData && studentData.studentId !== undefined ? studentData.studentId : undefined;

    const currentYear = new Date().getFullYear();
    
    function createAddressFields(prefix = "", studentData = {}) {
        return [
            createField('House Number', `${prefix}hno`, 'text', { value: studentData[`${prefix}hno`] }),
            createField('Street', `${prefix}street`, 'text', { value: studentData[`${prefix}street`] }),
            createField('Village', `${prefix}village`, 'text', { value: studentData[`${prefix}village`] }),
            createField('Mandal', `${prefix}mandal`, 'text', { value: studentData[`${prefix}mandal`] }),
            createField('District', `${prefix}district`, 'text', { value: studentData[`${prefix}district`] }),
            createField('State', `${prefix}state`, 'text', { value: studentData[`${prefix}state`] }),
            createField('Pincode', `${prefix}pincode`, 'text', { pattern: '\\d{6}', maxLength: 6, required: true, value: studentData[`${prefix}pincode`] }),
        ];
    }
    
const formFields = [
    // Admission Details
    createField('Name of the Student', 'studentName', 'text', { minLength: 3, required: true }),
    createField('Gender', 'gender', 'select', { options: GENDER_OPTIONS, required: true, value: studentData.gender }),
    createField('Admission No.', 'admissionNumber', 'number', { min: 1000, max: 9999, disabled: true }),
    createField('Date of Admission', 'dateOfAdmission', 'date', { min: calculateDateYearsAgo(10), max: new Date().toISOString().split('T')[0], required: true, disabled: isEdit }),
    createField('Batch Year', 'batchYear', 'select', { options: BATCH_YEAR_OPTIONS, required: true, value: studentData.batchYear || `${currentYear}-${currentYear + 1}` }),
    createField('Class Year', 'classYear', 'select', { options: YEAR_OPTIONS, required: true, value: studentData.classYear || 'first' }),
    createField('Group', 'groupName', 'select', { options: GROUP_OPTIONS, required: true, value: studentData.groupName }),
    createField('Medium', 'medium', 'select', { options: MEDIUM_OPTIONS, required: true, value: studentData.medium || 'english' }),
    createField('Second Language', 'secondLanguage', 'select', { options: SECOND_LANGUAGE_OPTIONS, required: true, value: studentData.secondLanguage || 'sanskrit' }),

    // Personal Details
    createField('Date of Birth', 'dob', 'date', { min: calculateDateYearsAgo(25), max: calculateDateYearsAgo(10), required: true }),
    createField('Nationality', 'nationality', 'select', { options: NATIONALITY_OPTIONS, required: true, value: studentData.nationality || 'indian' }),
    createField('Religion', 'religion', 'text'),
    createField('Community', 'community', 'text'),
    createField('Mother Tongue', 'motherTongue', 'text'),
    createField('Scholarship', 'scholarship', 'select', { options: SCHOLARSHIP_OPTIONS, required: true, value: studentData.scholarship }),
    createField("Parent's Annual Income", 'parentsIncome', 'select', { options: PARENTS_INCOME_OPTIONS, required: true, value: studentData.parentsIncome }),
    createField('Physically Handicapped', 'physicallyHandicapped', 'select', { options: PHYSICALLY_HANDICAPPED_OPTIONS, required: true, value: studentData.physicallyHandicapped }),
    createField('Aadhaar (UID)', 'aadhaar', 'text', { pattern: '\\d{12}', maxLength: 12, required: true }),
    createField('Additional Contact No.', 'additionalCell', 'text', { pattern: '^[6789]\\d{9}$', maxLength: 10 }),
    createField('Identification Mark 1', 'identificationMark1', 'text'),
    createField('Identification Mark 2', 'identificationMark2', 'text'),

    // Parents' Details
    createField("Father's Name", 'fathersName', 'text', { minLength: 3, required: true }),
    createField("Father's Cell No.", 'fatherCell', 'text', { pattern: '^[6789]\\d{9}$', maxLength: 10, required: true }),
    createField("Father's Occupation", 'fatherOccupation', 'select', { options: OCCUPATION_OPTIONS, required: true, value: studentData.fatherOccupation }),
    createField("Mother's Name", 'mothersName', 'text', { minLength: 3, required: true }),
    createField("Mother's Cell No.", 'motherCell', 'text', { pattern: '^[6789]\\d{9}$', maxLength: 10, required: true }),
    createField("Mother's Occupation", 'motherOccupation', 'select', { options: OCCUPATION_OPTIONS, required: true, value: studentData.motherOccupation }),

    ...createAddressFields("", studentData), // Present Address

    // Academic Details
    createField('Qualifying Exam', 'qualifyingExam', 'select', { options: QUALIFYING_EXAM_OPTIONS, required: true, value: studentData.qualifyingExam }),
    createField('Year of Exam', 'yearOfExam', 'number', { min: 2020, max: currentYear, step: 1 }),
    createField('Hall Ticket Number', 'hallTicketNumber', 'text'),
    createField('GPA', 'gpa', 'number', { min: 5, max: 10, step: 0.01 }),

];

const fieldsetGroups = {
    'Admission Details': [[0], [1, 2, 3, 4], [5, 6, 7, 8]],
    'Personal Details': [[0, 1], [2, 3, 4], [5, 6, 7], [8, 9], [10, 11]],
    'Parent Details': [[0, 1, 2], [3, 4, 5]],
    'Address Details': [[0, 1, 2], [3, 4, 5, 6]],
    'Academic Details': [[0, 1, 2, 3]],
};

const adjustedIndexes = [9, 21, 27, 34, 38, 46];

const { form } = renderForm(studentFormContainer, formFields, fieldsetGroups, adjustedIndexes, isEdit, studentId, studentData, handleStudentFormSubmit);

 // 1. Photo Section Logic
 if (fieldsetGroups['Admission Details']) {
    const admissionFieldset = form.querySelector('fieldset:nth-of-type(1)'); // Assuming Admission Details is the first fieldset
    if (admissionFieldset) {
        const nameRow = admissionFieldset.querySelector('.form-row');
        if (nameRow) nameRow.appendChild(createStudentPhotoSection(studentData));
    }
}

// 2. Permanent Address Radio Button Logic
if (fieldsetGroups['Address Details']) {
    const addressFieldset = form.querySelector('fieldset:nth-of-type(4)'); // Assuming Address Details is the 4th fieldset

    if (addressFieldset) {
        const permanentAddressDiv = document.createElement('div');
        let isSameAsPresent = studentData.perm_same === 1 ? true : studentData.perm_same === 0 ? false : null;

        permanentAddressDiv.innerHTML = `
            <div class="form-row same-address-row">
                <label for="sameAsPresent">Is the Permanent Address same as Present Address?</label>
                <div class="radio-group">
                    <input type="radio" id="sameYes" name="sameAsPresent" value="yes" ${isSameAsPresent === true ? 'checked' : ''}>
                    <label for="sameYes">Yes</label>
                    <input type="radio" id="sameNo" name="sameAsPresent" value="no" ${isSameAsPresent === false ? 'checked' : ''}>
                    <label for="sameNo">No</label>
                </div>
            </div>
        `;

        const permanentFieldsContainer = document.createElement('div');
        permanentFieldsContainer.id = 'permanentAddressFields';
        permanentFieldsContainer.style.display = isSameAsPresent === false ? 'block' : 'none';

        function createPermanentAddressFields(studentData = {}) {
            return createAddressFields("perm_", studentData);
        }

        if (isSameAsPresent === false) {
            const permAddressFields = createPermanentAddressFields(studentData);
            const permFieldset = createFieldset("Permanent Address", [
                permAddressFields.slice(0, 3),
                permAddressFields.slice(3, 7)
            ]);
            permanentFieldsContainer.appendChild(permFieldset);
        }

        permanentAddressDiv.appendChild(permanentFieldsContainer);
        addressFieldset.appendChild(permanentAddressDiv);

        const sameYes = permanentAddressDiv.querySelector('#sameYes');
        const sameNo = permanentAddressDiv.querySelector('#sameNo');

        sameYes.addEventListener('change', () => {
            permanentFieldsContainer.style.display = 'none';
            Array.from(permanentFieldsContainer.querySelectorAll('input, select, textarea')).forEach(field => {
                field.disabled = true;
            });
        });

        sameNo.addEventListener('change', () => {
            permanentFieldsContainer.innerHTML = '';
            const permAddressFields = createPermanentAddressFields(studentData);
            const permFieldset = createFieldset("Permanent Address", [
                permAddressFields.slice(0, 3),
                permAddressFields.slice(3, 7)
            ]);
            permanentFieldsContainer.appendChild(permFieldset);
            permanentFieldsContainer.style.display = 'block';
            initializeElements();
        });
    }
}

// 3. Nationality Select Logic
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
                    value: studentData.otherNationality || ''
                });

                otherNationalityField.setAttribute('data-element', 'otherNationalityField');
                nationalitySelect.parentNode.after(otherNationalityField);
                initializeElements();
            }
        } else if (nationalityOtherField) {
            nationalityOtherField.remove();
            initializeElements();
        }
    }

    nationalitySelect.addEventListener('change', () => handleOtherNationalityField(nationalitySelect.value));
    handleOtherNationalityField(nationalitySelect.value);
}

setTimeout(initializeFormValues, 0); 

    return form;
    
}
export async function showEditEntity({
    entityType,
    containerElement,
    clearContainer = true,
    switchTabCallback,
    fetchDetailsCallback,
    renderCallback,
    afterRenderCallback,
    data,
    formDataKeyToRemove,
    formSelector,
}) {
    try {
        if (switchTabCallback) switchTabCallback();

        // Optional: clear old form or container
        if (clearContainer && containerElement) {
            const existingForm = formSelector ? document.querySelector(formSelector) : null;
            if (existingForm) existingForm.remove();

            containerElement.innerHTML = '';
        }

        // Remove any saved draft data (if needed)
        if (formDataKeyToRemove) {
            localStorage.removeItem(formDataKeyToRemove);
        }

        // Fetch extra details (if needed)
        let enrichedData = data;
        if (fetchDetailsCallback) {
            const details = await fetchDetailsCallback(data.studentId);
            enrichedData = { ...data, ...details };
        }

        // Render the form
        await renderCallback(containerElement, true, enrichedData);

        // Run any extra setup
        if (afterRenderCallback) {
            afterRenderCallback(enrichedData);
        }

    } catch (err) {
        console.error(`Error rendering ${entityType} edit form:`, err);
        if (containerElement) {
            containerElement.innerHTML = `<p>Error loading ${entityType} form.</p>`;
        }
    }
}

export function showEditStudent(studentTabManager, studentData) {
    showEditEntity({
        entityType: 'student',
        containerElement: elements.addStudentFormContainer,
        switchTabCallback: () => studentTabManager?.switchTab(elements.addStudentTabButton),
        renderCallback: renderStudentForm,
        afterRenderCallback: initializeElements,
        formDataKeyToRemove: "addStudentFormData",
        formSelector: '[data-element="editStudentForm"]',
        data: studentData,
    });
}

export function displayFormErrors(errors) {
    for (const field in errors) {
        const errorElement = elements[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    }
}


/*
export function showEditStudent(studentTabManager, studentData) {
     if (!studentTabManager) {
        console.error('❌ studentTabManager is not initialized.');
        return;
    }
    if (typeof studentTabManager.switchTab !== "function") {
        console.error('❌ studentTabManager does not have switchTab function.');
        console.error('Received:', studentTabManager);
        return;
    }
    studentTabManager.switchTab(elements.addStudentTabButton);
     // Remove previous form if it exists
     const existingForm = document.querySelector('[data-element="editStudentForm"]');
     if (existingForm) {
         existingForm.remove();
     }

     // Ensure container is empty before rendering new form
    elements.addStudentFormContainer.innerHTML = "";


    localStorage.removeItem("addStudentFormData");
   
    renderStudentForm(elements.addStudentFormContainer, true, studentData);
    initializeElements();
    setTimeout(() => {
        const form = document.querySelector('[data-element="editStudentForm"]');

        if (form) {
            form.dataset.studentId = studentData.studentId;
            form.removeEventListener('submit', handleStudentFormSubmit);
            form.addEventListener('submit', handleStudentFormSubmit);
        } else {
            console.error("Edit student form not found.");
        }
    }, 0);
}*/
