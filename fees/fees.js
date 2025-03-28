import { createField , createFieldset} from '../students/studentsForm.js';
import { YES_NO_OPTIONS } from "../students/studentsData.js";
import { elements, initializeElements } from '../utils/sharedElements.js';


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

export function renderFeeFields(container, isEdit, studentData, form) {
    if (isEdit) return;
    
        const feeFieldsContainer = document.createElement('div');
        feeFieldsContainer.id = 'feeDetailsContainer';
    
        const feeFields = [
        createField('Admission Fees', 'admissionFees', 'number', { required: true }),
        createField('Eligibility Fee', 'eligibilityFee', 'number', { required: true }),
        createField('College Fees', 'collegeFees', 'number', { required: true }),
        createField('Exam Fees', 'examFees', 'number', { required: true }),
        createField('Practical Fees', 'labFees', 'number', { required: true }),
        createField('Coaching Fee', 'coachingFee', 'number', { required: true }),
        createField('Study Material', 'studyMaterialFees', 'number', { required: true }),
        createField('Uniform Fees', 'uniformFees', 'number', { required: true }),
        createField('Discount', 'discount', 'number', { required: false}),

    ];
    const feeFieldset = createFieldset("Fee Details", [
        feeFields.slice(0, 2),
        feeFields.slice(2, 4),
        feeFields.slice(4, 6),
        feeFields.slice(6, 9)
    ]);
    
    feeFieldsContainer.appendChild(feeFieldset);
    form.appendChild(feeFieldsContainer);

    /*const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("comments-container");

    const commentsLabel = document.createElement("label");
    commentsLabel.textContent = "Additional Comments";
    commentsLabel.setAttribute("for", "additionalComments");

    const commentsBox = document.createElement("textarea");
    commentsBox.id = "additionalComments";
    commentsBox.name = "additionalComments";
    commentsBox.rows = 4; // Ensures 3-4 lines
    commentsBox.placeholder = "Enter any additional comments here...";
    
    // Append to the container
    commentsContainer.appendChild(commentsLabel);
    commentsContainer.appendChild(commentsBox);

    // Append to the form
    form.appendChild(commentsContainer); */

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

export async function loadFeeDetailsContent(student, contentContainer) {
    if (contentContainer.innerHTML.trim() !== "") return; // Prevent redundant reloading

    contentContainer.innerHTML = `<p>Loading fee details...</p>`;

    try {
        const feeData = await fetchFeeDetailsFromDatabase(student.studentId);
        
        if (!feeData || Object.keys(feeData).length === 0) {
            contentContainer.innerHTML = `<p>No fee details available.</p>`;
            return;
        }

        const feeSections = {
            "Admission Fees": "admissionFees",
            "Eligibility Fee": "eligibilityFee",
            "College Fees": "collegeFees",
            "Exam Fees": "examFees",
            "Practical Fees": "labFees",
            "Coaching Fee": "coachingFee",
            "Study Material": "studyMaterialFees",
            "Uniform Fees": "uniformFees",
            "Discount": "discount"
        };

        const feeHtml = Object.entries(feeSections)
            .map(([label, key]) => {
                const value = feeData[key] || "N/A";
                return `<dt>${label}:</dt><dd>${value}</dd>`;
            })
            .join("");

        contentContainer.innerHTML = `
            <div class="student-details-header">
                <h3>Fee Details</h3>
                <button data-element="editFeeButton" class="edit-button" data-student-id="${student.studentId}">Edit</button>
            </div>
            <div class="student-section fee-details">
                <dl>${feeHtml}</dl>
            </div>
        `;
    } catch (error) {
        console.error("Error loading fee details:", error);
        contentContainer.innerHTML = `<p>Error fetching fee details.</p>`;
    }
}

export function gatherFeeData() {
    const getFeeValue = (element) => {
        if (!element || element.disabled) {
            return null; // Return null if the element is disabled or doesn't exist
        }
        const value = Number(element.value);
        return isNaN(value) ? null : value; // Return null if parsing fails, otherwise the parsed number
    };

    return {
        admissionFees: getFeeValue(elements.admissionFees),
        eligibilityFee: getFeeValue(elements.eligibilityFee),
        collegeFees: getFeeValue(elements.collegeFees),
        examFees: getFeeValue(elements.examFees),
        labFees: getFeeValue(elements.labFees),
        coachingFee: getFeeValue(elements.coachingFee),
        studyMaterialFees: getFeeValue(elements.studyMaterialFees),
        uniformFees: getFeeValue(elements.uniformFees),
    };
}

export async function fetchFeeDetailsFromDatabase(studentId) {
    try {
        const result = await window.electron.invoke('getStudentFees', { studentId });
        if (result.success) {
            return result.feeData; // Assuming the database returns an object with fee fields
        } else {
            console.warn("No existing fee data found for student ID:", studentId);
            return {}; // Return an empty object if no data is found
        }
    } catch (error) {
        console.error("Error fetching fee details:", error);
        return {}; // Return an empty object to avoid breaking the form
    }
}
