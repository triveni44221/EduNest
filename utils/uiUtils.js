export function getElementsByDataAttribute(attribute = "data-element") {
    try {
        const elements = document.querySelectorAll(`[${attribute}]`);
        return Array.from(elements).reduce((acc, el) => {
            const key = el.getAttribute(attribute);
            if (key) acc[key] = el;
            return acc;
        }, {});
    } catch (error) {
        console.error("Error in getElementsByDataAttribute:", error);
        return {}; // Return an empty object in case of error
    }
}

    export function capitalizeFirstLetter(str) {
        return str ? str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";
    }

    export function normalizeString(str) {
        return str ? str.trim().toLowerCase() : "";
    }
    
    export function toggleVisibility({ show = [], hide = [] }) {
        const showList = Array.isArray(show) ? show : [show];
        const hideList = Array.isArray(hide) ? hide : [hide];
    
        showList.forEach((el) => el?.classList.remove('hidden'));
        hideList.forEach((el) => el?.classList.add('hidden'));
    }
    
    
    export function sortData(data, key, ascending = true) {
        return data.sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];
    
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                // Numeric comparison
                return ascending ? valueA - valueB : valueB - valueA;
            } else {
                // String comparison (using localeCompare for better handling of accented characters)
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return ascending
                        ? normalizeString(valueA).localeCompare(normalizeString(valueB))
                        : normalizeString(valueB).localeCompare(normalizeString(valueA));
                } else {
                    // Handle cases where values are not both numbers or both strings
                    const strA = String(valueA);
                    const strB = String(valueB);
                    return ascending
                        ? normalizeString(strA).localeCompare(normalizeString(strB))
                        : normalizeString(strB).localeCompare(normalizeString(strA));
                }
            }
        });
    }

  export function createSubmitButton(form, isEdit, submitHandler) {
    console.log("createSubmitButton called, form:", form);

    // Ensure submitButton is defined before using it
    let submitButton = form.querySelector('.submit-button');

    if (submitButton) {
        console.log("Removing existing submit button...");
        submitButton.remove();
    }

    submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = isEdit ? 'Update' : 'Submit';

    
    console.log("Appending submit button to form:", form);

    form.appendChild(submitButton);
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); 
        console.log("Submit button clicked");
        const success = await submitHandler(event);
        if (success) {
            console.log('Form submitted successfully');
        }
    });

    return submitButton;
}

export function normalizeBooleans(data, booleanFields = []) {
    const normalized = { ...data };
    for (const key of booleanFields) {
        normalized[key] = data[key] === 1;
    }
    return normalized;
}

