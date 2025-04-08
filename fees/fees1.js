import { createField , createFieldset} from '../students/studentsForm.js';
import { YES_NO_OPTIONS } from "../students/studentsData.js";
import { loadStudentSection , students} from "../students/studentsUI.js";
import { elements, initializeElements } from '../utils/sharedElements.js';
import { createSubmitButton, normalizeBooleans} from "../utils/uiUtils.js"; 

function createYesNoDropdown(label, selectId, fieldToToggle) {
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = 'form-group';

    const dropdownLabel = document.createElement('label');
    dropdownLabel.textContent = label;
    dropdownDiv.appendChild(dropdownLabel);

    const dropdownSelect = document.createElement('select');
    dropdownSelect.id = selectId;
    // Add a data attribute to store whether 'yes' was selected
    dropdownSelect.dataset.selectedValue = 'no';

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
        // Update the data attribute on change
        dropdownSelect.dataset.selectedValue = dropdownSelect.value;
    };

    dropdownSelect.addEventListener('change', toggleVisibility);
    toggleVisibility(); // Initial visibility

    return dropdownDiv;
}

export async function renderFeeFields(container, isEdit, studentData) {
   // container.id = 'feeTabContent';

    container.innerHTML = '';

    const feeForm = document.createElement('form');
feeForm.id = 'feeForm';

if (studentData?.studentId) {
    feeForm.dataset.studentId = studentData.studentId;
}

    const feeFieldsContainer = document.createElement('div');
    feeFieldsContainer.id = 'feeFormContainer';

    const feeFields = [
        createField('Admission Fees', 'admissionFees', 'number', { required: true, value: studentData.admissionFees || '' }),
        createField('Eligibility Fee', 'eligibilityFee', 'number', { required: true, value: studentData.eligibilityFee || '' }),
        createField('College Fees', 'collegeFees', 'number', { required: true, value: studentData.collegeFees || '' }),
        createField('Exam Fees', 'examFees', 'number', { required: true, value: studentData.examFees || '' }),
        createField('Practical Fees', 'labFees', 'number', { required: true, value: studentData.labFees || '' }),
        createField('Coaching Fee', 'coachingFee', 'number', { required: true, value: studentData.coachingFee || '' }),
        createField('Study Material', 'studyMaterialFees', 'number', { required: true, value: studentData.studyMaterialFees || '' }),
        createField('Uniform Fees', 'uniformFees', 'number', { required: true, value: studentData.uniformFees || '' }),
        createField('Discount', 'discount', 'number', { required: false, value: studentData.discount || '' }),
    ];

    const feeFieldset = createFieldset("Fee Details", [
        feeFields.slice(0, 2),
        feeFields.slice(2, 4),
        feeFields.slice(4, 6),
        feeFields.slice(6, 9),
    ]);

    
feeFieldsContainer.appendChild(feeFieldset);
    
feeForm.appendChild(feeFieldsContainer);
container.appendChild(feeForm);

const submitButton = createSubmitButton(feeForm, isEdit, handleFeeFormSubmit);

    initializeElements();

    let classYearValue = studentData.classYear;
    let groupNameValue = studentData.groupName;
    let scholarshipValue = studentData.scholarship;

    if (!classYearValue || !groupNameValue || !scholarshipValue) {
        console.warn("Missing classYear, groupName, or scholarship in studentData");
    }

    function updateFieldVisibility(field, dependentFields, visibilityConditions, disableCondition) {
        
        const dependentValues = dependentFields.map(depField => {
            if (typeof depField === 'string') {
                return depField; 
            } else if (depField && depField.value !== undefined) {
                return depField.value; 
            } else {
                console.error("Invalid dependent field:", depField);
                return null; 
            }
        });
    
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
            if (shouldDisable) {
                field.setAttribute('disabled', 'true');
            } else {
                field.removeAttribute('disabled');
            }
            field.removeAttribute('required');
            field.value = '';
        }
    
    }

    function initializeEligibilityFee() {
        const eligibilityFeeField = container.querySelector('[data-element="eligibilityFee"]');
        if (!eligibilityFeeField) return;

        if (!container.querySelector('#eligibilitySelect')) {
            const eligibilityDropdown = createYesNoDropdown('Eligibility Fee?', 'eligibilitySelect', eligibilityFeeField);
            eligibilityDropdown.setAttribute('data-eligibility-dropdown', '');
            eligibilityFeeField.parentElement.before(eligibilityDropdown);

            const eligibilitySelect = container.querySelector('#eligibilitySelect');
            if (studentData.isEligibilityApplicable === true) {
                eligibilitySelect.value = 'yes';
                eligibilitySelect.dataset.selectedValue = 'yes'; // Update data attribute
                eligibilityFeeField.parentElement.style.display = 'block';
            } else {
                eligibilitySelect.value = 'no';
                eligibilitySelect.dataset.selectedValue = 'no'; // Update data attribute
                eligibilityFeeField.parentElement.style.display = 'none';
                eligibilityFeeField.value = ''; // Clear the value if 'No'
            }


            eligibilitySelect.addEventListener('change', () => {
                updateFeeFields();
            });

        } else if (studentData.isEligibilityApplicable === true) {
            const eligibilitySelect = container.querySelector('#eligibilitySelect');
            eligibilitySelect.value = 'yes';
            eligibilitySelect.dataset.selectedValue = 'yes';
            eligibilityFeeField.parentElement.style.display = 'block';

        }
    }
    initializeEligibilityFee();

    const updateFeeFields = () => {
      
        const selectedGroup = groupNameValue;
        const selectedClassYear = classYearValue;

        const eligibilityFeeField = container.querySelector('[data-element="eligibilityFee"]');
        const eligibilitySelect = container.querySelector('#eligibilitySelect');
        if (eligibilityFeeField && eligibilityFeeField.parentElement && eligibilitySelect) {
            updateFieldVisibility(eligibilityFeeField, [eligibilitySelect], (eligibilityValue) => eligibilityValue === 'yes');
        }

        const labFeesField = container.querySelector('[data-element="labFees"]');
        if (labFeesField && labFeesField.parentElement) {
            updateFieldVisibility(labFeesField, [selectedClassYear, selectedGroup], (year, group) => year === 'second' && (group === 'mpc' || group === 'bipc'));
        }

        const coachingFeeField = container.querySelector('[data-element="coachingFee"]');
        if (coachingFeeField && coachingFeeField.parentElement) {
            const coachingDropdownDiv = container.querySelector('.form-group[data-coaching-dropdown]');
            if (coachingDropdownDiv) {
                coachingDropdownDiv.remove();
            }

            if (selectedGroup === 'mpc') {
                const eapcetDropdown = createYesNoDropdown('EAPCET Coaching?', 'eapcetCoachingSelect', coachingFeeField);
                eapcetDropdown.setAttribute('data-coaching-dropdown', '');
                coachingFeeField.parentElement.before(eapcetDropdown);

                const eapcetSelect = container.querySelector('#eapcetCoachingSelect');
                if (eapcetSelect) {
                    if (studentData.isEapcetCoachingApplicable === true) {
                        eapcetSelect.value = 'yes';
                        eapcetSelect.dataset.selectedValue = 'yes';
                        coachingFeeField.parentElement.style.display = 'block';
                    } else {
                        eapcetSelect.value = 'no';
                        eapcetSelect.dataset.selectedValue = 'no';
                        coachingFeeField.parentElement.style.display = 'none';
                        coachingFeeField.value = '';
                    }
                    updateFieldVisibility(
                        coachingFeeField,
                        [selectedGroup, eapcetSelect],
                        (group, coachingSelectValue) => group === 'mpc' && coachingSelectValue === 'yes',
                        (group, coachingSelectValue) => group !== 'mpc'
                    );
                }
            } else if (selectedGroup === 'bipc') {
                const neetDropdown = createYesNoDropdown('NEET Coaching?', 'neetCoachingSelect', coachingFeeField);
                neetDropdown.setAttribute('data-coaching-dropdown', '');
                coachingFeeField.parentElement.before(neetDropdown);

                const neetSelect = container.querySelector('#neetCoachingSelect');
                if (neetSelect) {
                    // Set the dropdown value based on studentData
                    if (studentData.isNeetCoachingApplicable === true) {
                        neetSelect.value = 'yes';
                        neetSelect.dataset.selectedValue = 'yes';
                        coachingFeeField.parentElement.style.display = 'block';
                    } else {
                        neetSelect.value = 'no';
                        neetSelect.dataset.selectedValue = 'no';
                        coachingFeeField.parentElement.style.display = 'none';
                        coachingFeeField.value = '';
                    }
                    updateFieldVisibility(
                        coachingFeeField,
                        [selectedGroup, neetSelect],
                        (group, coachingSelectValue) => group === 'bipc' && coachingSelectValue === 'yes',
                        (group, coachingSelectValue) => group !== 'bipc'
                    );
                }
            } else {
                coachingFeeField.parentElement.style.display = 'none';
                updateFieldVisibility(coachingFeeField, [selectedGroup], (group) => false, (group) => true);
            }
        }
    };

    updateFeeFields();

    function updateFieldLabel(fieldElement, dependentValueObject, condition, trueLabel, falseLabel) {
    
        if (fieldElement && fieldElement.parentElement) {
            fieldElement.parentElement.querySelector('label').textContent = condition(dependentValueObject.value) ? trueLabel : falseLabel;
        }
    }

    const collegeFeesField = container.querySelector('[data-element="collegeFees"]');
    
    if (scholarshipValue) { 
        updateFieldLabel(collegeFeesField, { value: scholarshipValue }, (scholarshipValue) => scholarshipValue === 'yes', 'College Fees with SS', 'College Fees');
    } else {
        console.error("scholarshipValue is undefined");
    }
}

export async function handleFeeFormSubmit(event) {
    event.preventDefault();

    const studentId = parseInt(event.target.dataset.studentId, 10);
    if (!studentId) {
        alert("❌ No student ID found for fee submission!");
        return false;
    }
    
    const feeData = gatherFeeData();

    const payload = { studentId: studentId, ...feeData }; // full payload = 13 fields

    // 🔍 Log the payload before sending to database
    console.log("📝 Fee form submission payload:", payload);




    let feeResult;


    const existingFeeDetails = await fetchFeeDetailsFromDatabase(studentId);

    if (Object.keys(existingFeeDetails).length === 0) {
        feeResult = await window.electron.invoke('addStudentFees', { studentId: studentId, ...feeData });
    } else {
        feeResult = await window.electron.invoke('updateStudentFees', { studentId: studentId, ...feeData });
    }


    if (feeResult && feeResult.success) {
        alert(`Fee details saved successfully!`);
        const contentContainer = document.getElementById('feeTabContent');
        if (contentContainer) {
            contentContainer.innerHTML = '';
            const student = students.find(s => String(s.studentId) === String(studentId));
            const updatedFeeData = await fetchFeeDetailsFromDatabase(studentId);
            if (updatedFeeData && Object.keys(updatedFeeData).length > 0) {
                await loadFeeDetailsContent(student, contentContainer, true);
            } else {
                console.warn("🟡 Fee data still empty after save. Skipping reload.");
            }
        }        
        return true;
    } else {
        alert(`Failed to save fee details: ${feeResult && feeResult.message ? feeResult.message : 'Unknown error'}`);
        return false;
    }
}

export async function loadFeeDetailsContent(student, contentContainer, forceReload = false) {
   
    await loadStudentSection({
        student,
        contentContainer,
        section: 'fee',
        title: 'Fee Details',
        fetchDataFn: fetchFeeDetailsFromDatabase,
        formatDataFn: async (feeData) => {
           
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

            return `<div class="student-section fee-details"><dl>${feeHtml}</dl></div>`;
        },
        editButtonId: "editFeeButton",
        renderIfEmptyFn: renderFeeFields,
        forceReload
    });
}

export function gatherFeeData() {
    const getFeeValue = (element) => {
        if (!element || element.disabled) {
            return null;
        }
        const value = Number(element.value);
        return isNaN(value) ? null : value; 
    };
    const eligibilitySelect = document.getElementById('eligibilitySelect');
    const eapcetCoachingSelect = document.getElementById('eapcetCoachingSelect');
    const neetCoachingSelect = document.getElementById('neetCoachingSelect');

    const isEapcetApplicable = eapcetCoachingSelect?.value === 'yes';
    const isNeetApplicable = neetCoachingSelect?.value === 'yes';


    return {
        admissionFees: getFeeValue(elements.admissionFees),
        eligibilityFee: getFeeValue(elements.eligibilityFee),
        // Include the dropdown selection values
        isEligibilityApplicable: eligibilitySelect?.value === 'yes' ? 1 : 0,
        collegeFees: getFeeValue(elements.collegeFees),
        examFees: getFeeValue(elements.examFees),
        labFees: getFeeValue(elements.labFees),
        coachingFee: (isEapcetApplicable || isNeetApplicable) ? getFeeValue(elements.coachingFee) : null,
        // Include coaching dropdown selection based on group
        isEapcetCoachingApplicable: eapcetCoachingSelect?.value === 'yes' ? 1 : null,
        isNeetCoachingApplicable: neetCoachingSelect?.value === 'yes' ? 1 : null,
        studyMaterialFees: getFeeValue(elements.studyMaterialFees),
        uniformFees: getFeeValue(elements.uniformFees),
        discount: getFeeValue(elements.discount),
    };
}

export async function fetchFeeDetailsFromDatabase(studentId) {
    try {
        const result = await window.electron.invoke('getStudentFees', { studentId });
        if (result.success) {
            const normalizedData = normalizeBooleans(result.feeData, [
                'isEligibilityApplicable',
                'isEapcetCoachingApplicable',
                'isNeetCoachingApplicable'
            ]);

            return normalizedData;
        } else {
            console.warn("No existing fee data found for student ID:", studentId);
            return {}; // Return an empty object if no data is found
        }
    } catch (error) {
        console.error("Error fetching fee details:", error);
        return {}; // Return an empty object to avoid breaking the form
    }
}

export async function showEditFeeForm(student) {

    const contentContainer = document.getElementById('feeTabContent');
    if (!contentContainer) return;

    contentContainer.innerHTML = `<p>Loading fee edit form...</p>`;

    try {
        const feeDetails = await fetchFeeDetailsFromDatabase(student.studentId);

        const studentWithFees = { ...student, ...feeDetails };

        await renderFeeFields(contentContainer, true, studentWithFees);


    } catch (error) {
        console.error("Error loading fee details for edit:", error);
        contentContainer.innerHTML = `<p>Error loading fee edit form.</p>`;
    }
}