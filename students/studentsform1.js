// students/studentsForm.js
import { YES_NO_OPTIONS, YEAR_OPTIONS, GENDER_OPTIONS, GROUP_OPTIONS, MEDIUM_OPTIONS, SECOND_LANGUAGE_OPTIONS, NATIONALITY_OPTIONS, SCHOLARSHIP_OPTIONS, OCCUPATION_OPTIONS, PHYSICALLY_HANDICAPPED_OPTIONS, QUALIFYING_EXAM_OPTIONS, PARENTS_INCOME_OPTIONS, BATCH_YEAR_OPTIONS, COACHING_OPTIONS  } from "./studentsData.js";
import { calculateDateYearsAgo } from "../utils/dataUtils.js";
import  TabManager  from '../utils/tabManager.js';
import { capitalizeFirstLetter } from "../utils/uiUtils.js"; 
import { elements, initializeElements } from '../utils/sharedElements.js';
import { handleStudentFormSubmit } from './studentsEvents.js';
import { createStudentPhotoSection } from './studentsUI.js';

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

function renderForm(container, formFields, fieldsetGroups, adjustedIndexes, isEdit, studentId, studentData) {

    // Copy these lines from the original renderStudentForm:
    const form = document.createElement('form');
    form.setAttribute('data-element', isEdit ? 'editStudentForm' : 'addStudentForm');
    formFields.forEach(field => {
        field.value = studentData[field.elementName] || field.value || ""; // You'll need to pass studentData to renderForm or handle values differently
    });
    form.setAttribute('data-form-type', isEdit ? 'edit' : 'add');
    form.removeEventListener('submit', handleStudentFormSubmit);

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

 
    // Generate fieldsets dynamically
    Object.entries(fieldsetGroups).forEach(([groupName, rows], index) => {
        const start = index === 0 ? 0 : adjustedIndexes[index - 1];
        const end = adjustedIndexes[index];

        const groupFields = formFields.slice(start, end);
        const fieldRows = rows.map(indices => indices.map(i => groupFields[i]));

        const fieldset = createFieldset(groupName, fieldRows);
        form.appendChild(fieldset);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = isEdit ? 'Update' : 'Submit';
    form.appendChild(submitButton);

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

    // Parent Details
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

// Field grouping logic
const fieldsetGroups = {
    'Admission Details': [[0], [1, 2, 3, 4], [5, 6, 7, 8]],
    'Personal Details': [[0, 1], [2, 3, 4], [5, 6, 7], [8, 9], [10, 11]],
    'Parent Details': [[0, 1, 2], [3, 4, 5]],
    'Address Details': [[0, 1, 2], [3, 4, 5, 6]],
    'Academic Details': [[0, 1, 2, 3]],
};

// Adjust slice indexes based on `isEdit`
const adjustedIndexes = [9, 21, 27, 34, 38, 46];

// Call the generic renderForm function
const { form, submitButton } = renderForm(container, formFields, fieldsetGroups, adjustedIndexes, isEdit, studentId, studentData);

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

renderFeeFields(container, isEdit, studentData, form); // Pass form here

setTimeout(initializeFormValues, 0); // Call initializeFormValues synchronously

    form.appendChild(submitButton);

    form.addEventListener('submit', handleStudentFormSubmit);

    return form;
}

function renderFeeFields(container, isEdit, studentData, form) {
    // 3. Fee Details Container and Append logic.
    if (isEdit) return; // Fee fields should only appear in add mode
    
        const feeFieldsContainer = document.createElement('div');
        feeFieldsContainer.id = 'feeDetailsContainer';
    
        const feeFields = [
        // Fee Details
        createField('Admission Fees', 'admissionFees', 'number', { required: true }),
        createField('Eligibility Fee', 'eligibilityFee', 'number', { required: true }),
        createField('College Fees', 'collegeFees', 'number', { required: true }),
        createField('Exam Fees', 'examFees', 'number', { required: true }),
        createField('Practical Fees', 'labFees', 'number', { required: true }),
        createField('Coaching Fee', 'coachingFee', 'number', { required: true }),
        createField('Study Material', 'studyMaterialFees', 'number', { required: true }),
        createField('Uniform Fees', 'uniformFees', 'number', { required: true }),
    ];
    const feeFieldset = createFieldset("Fee Details", [
        feeFields.slice(0, 2),
        feeFields.slice(2, 4),
        feeFields.slice(4, 6),
        feeFields.slice(6, 8)
    ]);
    
    feeFieldsContainer.appendChild(feeFieldset);
    form.appendChild(feeFieldsContainer);
    initializeElements();
    console.log(elements);
    
    function updateFieldVisibility(field, dependentFields, visibilityConditions, disableCondition) {
        console.log("updateFieldVisibility called for:", field.dataset.element);
    
        const dependentValues = dependentFields.map(depField => depField.value);
        const shouldShow = visibilityConditions(...dependentValues);
        const shouldDisable = disableCondition ? disableCondition(...dependentValues) : !shouldShow;
    
        if (!field) {
            console.error("Field is null or undefined!");
            return;
        }
    
        if (!field.parentElement) {
            console.error("Field parent element is null or undefined!");
            return;
        }
    
        if (field.parentElement) {
            field.parentElement.style.display = shouldShow ? 'block' : 'none';
        }
    
        if (shouldShow) {
            field.removeAttribute('disabled');
            field.setAttribute('required', 'true');
        } else {
            if(shouldDisable){
                field.setAttribute('disabled', 'true');
            } else {
                field.removeAttribute('disabled');
            }
            field.removeAttribute('required');
            field.value = '';
        }
    
        console.log("shouldShow for:", field.dataset.element, "is:", shouldShow);
        console.log("updateFieldVisibility finished for:", field.dataset.element);
    }
  

    const classYearSelect = form.querySelector('[data-element="classYear"]');
    const groupSelect = form.querySelector('[data-element="groupName"]');


    function initializeEligibilityFee() {
        const eligibilityFeeField = form.querySelector('[data-element="eligibilityFee"]');
        if (!eligibilityFeeField) return;
    
        if (!form.querySelector('#eligibilitySelect')) {
            const eligibilityDropdown = createYesNoDropdown('Eligibility Fee?', 'eligibilitySelect', eligibilityFeeField);
            eligibilityDropdown.setAttribute('data-eligibility-dropdown', '');
            eligibilityFeeField.parentElement.before(eligibilityDropdown);
    
            const eligibilitySelect = form.querySelector('#eligibilitySelect');
            if (studentData.eligibilityFeeSelected) {
                eligibilitySelect.value = studentData.eligibilityFeeSelected;
            }
    
            eligibilitySelect.addEventListener('change', () => {
                updateFeeFields(); // Call updateFeeFields on change
            });
        }
    }
    initializeEligibilityFee();

    const updateFeeFields = () => {
        const selectedGroup = groupSelect.value;
        console.log("updateFeeFields called, selectedGroup:", selectedGroup);
// 1. Eligibility Fee Logic
const eligibilityFeeField = form.querySelector('[data-element="eligibilityFee"]');
const eligibilitySelect = form.querySelector('#eligibilitySelect');
if (eligibilityFeeField && eligibilityFeeField.parentElement && eligibilitySelect) {
    updateFieldVisibility(eligibilityFeeField, [eligibilitySelect], (eligibilityValue) => eligibilityValue === 'yes'); // Show if yes
}
    
        const labFeesField = form.querySelector('[data-element="labFees"]');
        if (labFeesField && labFeesField.parentElement) { // Add null check
            updateFieldVisibility(labFeesField, [classYearSelect, groupSelect], (year, group) => year === 'second' && (group === 'mpc' || group === 'bipc'));
        }
    
        const coachingFeeField = form.querySelector('[data-element="coachingFee"]');
    if (coachingFeeField && coachingFeeField.parentElement) {
        console.log("Coaching fee field found");
        // Coaching Dropdown and Fee Logic
        const coachingDropdownDiv = form.querySelector('.form-group[data-coaching-dropdown]');
        if (coachingDropdownDiv) {
            coachingDropdownDiv.remove();
        }

        if (selectedGroup === 'mpc') {
            const eapcetDropdown = createYesNoDropdown('EAPCET Coaching?', 'eapcetCoachingSelect', coachingFeeField);
            eapcetDropdown.setAttribute('data-coaching-dropdown', '');
            coachingFeeField.parentElement.before(eapcetDropdown);

            const eapcetSelect = form.querySelector('#eapcetCoachingSelect');
            if (eapcetSelect) {
                updateFieldVisibility(
                    coachingFeeField,
                    [groupSelect, eapcetSelect],
                    (group, coachingSelectValue) => group === 'mpc' && coachingSelectValue === 'yes',
                    (group, coachingSelectValue) => group !== 'mpc' //disable condition
                );
            }
        } else if (selectedGroup === 'bipc') {
            const neetDropdown = createYesNoDropdown('NEET Coaching?', 'neetCoachingSelect', coachingFeeField);
            neetDropdown.setAttribute('data-coaching-dropdown', '');
            coachingFeeField.parentElement.before(neetDropdown);

            const neetSelect = form.querySelector('#neetCoachingSelect');
            if (neetSelect) {
                updateFieldVisibility(
                    coachingFeeField,
                    [groupSelect, neetSelect],
                    (group, coachingSelectValue) => group === 'bipc' && coachingSelectValue === 'yes',
                    (group, coachingSelectValue) => group !== 'bipc' //disable condition
                );
            }
        } else {
            coachingFeeField.parentElement.style.display = 'none';
            console.log("Coaching fee field not found");
            updateFieldVisibility(
                coachingFeeField,
                [groupSelect],
                (group) => false,
                (group) => true //disable condition
            );
        }
    }
    };
    classYearSelect.addEventListener('change', updateFeeFields);
    groupSelect.addEventListener('change', updateFeeFields);


    function updateFieldLabel(fieldElement, dependentField, condition, trueLabel, falseLabel) {
        const updateLabel = () => {
            if (fieldElement && fieldElement.parentElement) { // Add null check here
                fieldElement.parentElement.querySelector('label').textContent = condition(dependentField.value) ? trueLabel : falseLabel;
            }
        };
    
        updateLabel(); // Initial label update
        dependentField.addEventListener('change', updateLabel);
    }

    // Get the Scholarship select element and College Fees field
    const scholarshipSelect = form.querySelector('[data-element="scholarship"]');
    const collegeFeesField = form.querySelector('[data-element="collegeFees"]');

    // Update College Fees label based on Scholarship
    updateFieldLabel(
        collegeFeesField,
        scholarshipSelect,
        (scholarshipValue) => scholarshipValue === 'yes',
        'College Fees with SS',
        'College Fees'
    );
    updateFeeFields(); // Initial setup    // Event listeners for fee fields

}

function createYesNoDropdown(label, selectId, fieldToToggle) {
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'form-group';

        const dropdownLabel = document.createElement('label');
        dropdownLabel.textContent = label;
        dropdownDiv.appendChild(dropdownLabel);

        const dropdownSelect = document.createElement('select');
        dropdownSelect.id = selectId;

        YES_NO_OPTIONS.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            dropdownSelect.appendChild(optionElement);
        });
        dropdownSelect.value = 'no'; // Default to 'No'

        dropdownDiv.appendChild(dropdownSelect);

        const toggleVisibility = () => {
            fieldToToggle.parentElement.style.display = dropdownSelect.value === 'yes' ? 'block' : 'none';
        };

        dropdownSelect.addEventListener('change', toggleVisibility);
        toggleVisibility(); // Initial visibility

        return dropdownDiv;
    }

export function showEditStudent(studentTabManager, studentData) {
     // Ensure tabManager is initialized
     if (!studentTabManager) {
        console.error('❌ studentTabManager is not initialized.');
        return;
    }
    if (typeof studentTabManager.switchTab !== "function") {
        console.error('❌ studentTabManager does not have switchTab function.');
        console.error('Received:', studentTabManager);
        return;
    }
    // Switch to the "Add Student" tab using TabManager
    studentTabManager.switchTab(elements.addStudentTabButton);

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
}

export function displayFormErrors(errors) {
    for (const field in errors) {
        const errorElement = elements[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = errors[field];
        }
    }
}

