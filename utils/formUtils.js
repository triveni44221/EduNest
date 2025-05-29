
export function createAddStudentButton(onClick) {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-student-button';
    addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Student`;
    addBtn.addEventListener('click', onClick);
    return addBtn;
}

export function createDeleteButton({ items, checkboxClass, deleteHandler, entityName = 'items', refreshCallback }) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = `<i class="fa-solid fa-trash-can delete-icon"></i>Delete Selected`;

    deleteButton.addEventListener('click', async () => {
        const selectedCheckboxes = document.querySelectorAll(`.${checkboxClass}:checked`);

        if (selectedCheckboxes.length === 0) {
            alert(`No ${entityName} selected for deletion.`);
            return;
        }

        const confirmation = confirm(`Are you sure you want to delete the selected ${entityName}? This action cannot be undone.`);

        if (!confirmation) return;

        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));

        try {
            const result = await deleteHandler(selectedIds);

            if (result.success) {
                alert(`${selectedIds.length} ${entityName} deleted successfully.`);
                if (typeof refreshCallback === 'function') {
                    await refreshCallback();
                }
            } else {
                alert(result.message || `Failed to delete ${entityName}.`);
            }
        } catch (error) {
            console.error(`Error deleting ${entityName}:`, error);
            alert(`An error occurred while deleting ${entityName}: ${error.message}`);
        }
    });

    return deleteButton;
}

export function createSubmitButton(form, isEdit, submitHandler) {
    // Remove any existing submit button
    form.querySelector('.submit-button')?.remove();

    // Create and configure new submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = isEdit ? 'Update' : 'Submit';

    // Remove previous submit handler if one exists
    if (form.__submitHandler) {
        form.removeEventListener('submit', form.__submitHandler);
    }

    // Define and attach new submit handler
    const boundHandler = async (event) => {
        event.preventDefault();
        await submitHandler(event);
    };

    form.__submitHandler = boundHandler;
    form.addEventListener('submit', boundHandler);

    // Add the button to the form
    form.appendChild(submitButton);
    return submitButton;
}

export function addCancelButton(form, onClick) {
    console.log("onClick in addCancelButton:", onClick);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-edit-btn";
    cancelBtn.addEventListener("click", onClick);

    const actionsDiv = form.querySelector(".form-actions") || form;
    actionsDiv.appendChild(cancelBtn);
}

function handlePromoteStudents() {
    console.log('Promote clicked');
    // Implement logic
}

function handleDropStudents() {
    console.log('Drop clicked');
    // Implement logic
}