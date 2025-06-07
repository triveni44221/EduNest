// filters.js


function createFiltersContainer(html, extraClasses = []) {
    const container = document.createElement('div');
    container.classList.add('filters-container', ...extraClasses);
    container.innerHTML = html;
    return container;
}

export function createClassFiltersContainer() {
    const html = `
        <div class="year-checkbox-container">
            <input type="checkbox" value="first"> <label>First Year</label>
            <input type="checkbox" value="second"> <label>Second Year</label>
        </div>
        <div class="separator"></div>
        <div class="groupName-checkbox-container">
            <input type="checkbox" value="mpc"> <label>MPC</label>
            <input type="checkbox" value="bipc"> <label>BiPC</label>
            <input type="checkbox" value="mec"> <label>MEC</label>
            <input type="checkbox" value="cec"> <label>CEC</label>
        </div>
    `;
    return createFiltersContainer(html);
}

export function createFeeFiltersContainer() {
    const html = `
        <div class="fee-checkbox-container">
            <input type="checkbox" data-filter="fee" value="totalPaid"> <label>Total Fee Paid</label>
            <input type="checkbox" data-filter="fee" value="firstTermPaid"> <label>First Term Paid</label>
            <input type="checkbox" data-filter="fee" value="secondTermPaid"> <label>Second Term Paid</label>
        </div>
    `;
    return createFiltersContainer(html);
}

export function getFiltersByType(container, selectors) {
    const filters = {};
    selectors.forEach(({ key, classSelector, dataAttr }) => {
        const inputs = Array.from(container.querySelectorAll(`${classSelector} input${dataAttr ? `[${dataAttr}]` : ''}:checked`))
            .map(cb => cb.value);
        if (inputs.length) filters[key] = inputs;
    });
    return filters;
}
export function getClassFilters(container) {
    return getFiltersByType(container, [
        { key: 'classYear', classSelector: '.year-checkbox-container' },
        { key: 'groupName', classSelector: '.groupName-checkbox-container' }
    ]);
}

export function getFeeFilters(container) {
    return getFiltersByType(container, [
        { key: 'feeStatus', classSelector: '', dataAttr: 'data-filter="fee"' }
    ]);
}

export function removeFiltersFromAllTabs() {
    const allTabContents = document.querySelectorAll('.tab-content'); 
    allTabContents.forEach(tabContent => {
      const filtersWrapper = tabContent.querySelector('.filters-wrapper');
      if (filtersWrapper) filtersWrapper.remove();
    });
  }

export function injectFilters(container, filterType, reloadCallback) {
    if (!container || !container.classList.contains('tab-content')) return;

    if (container.querySelector('.filters-wrapper')) {
        return;
    }

    const filtersWrapper = document.createElement('div');
    filtersWrapper.classList.add('filters-wrapper');

    let filtersContainer;
    if (filterType === 'class') {
        filtersContainer = createClassFiltersContainer();
    } else if (filterType === 'fee') {
        filtersContainer = createFeeFiltersContainer();
    }

    if (filtersContainer) {
        filtersWrapper.appendChild(filtersContainer);
        container.prepend(filtersWrapper);
        filtersContainer.addEventListener('change', reloadCallback);
    }
}
