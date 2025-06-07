import { updateElements } from './sharedElements.js';
import { showLeaveConfirmation } from '../students/studentsForm.js';




class TabManager {
    constructor(tabButtons, tabContents, defaultTab, contentLoaders = {}, onTabSwitch = null) {
        this.tabs = tabButtons.map((btn, index) => ({
            button: btn,
            content: tabContents[index],
            loader: contentLoaders[btn.getAttribute("data-element")] || null,
        }));
        this.activeTab = defaultTab || this.tabs[0];
        this.onTabSwitch = onTabSwitch;
        this.init();
    }

    init() {
        this.tabs.forEach(({ button }) => {
            // 🧱 Block A logic inserted here
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;

                if (window.isAddStudentFormDirty) {
                    showLeaveConfirmation(() => {
                        this.switchTab(button);

                        if (button.dataset.element === 'activeStudentsTabButton') {
                            toggleVisibility({
                                show: [
                                    elements.studentDataContainer,
                                    elements.studentListContainer,
                                    elements.filtersContainer,
                                    elements.controlsContainer,
                                    elements.paginationContainer
                                ],
                                hide: [elements.addStudentFormContainer]
                            });
                        }
                    });
                } else {
                    this.switchTab(button);
                }
            });
        });

        this.switchTab(this.activeTab.button);
    }

    switchTab(activeButton) {
        this.tabs.forEach(({ button, content, loader }) => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
            content.classList.toggle('hidden', !isActive);

            if (isActive) {
                this.activeTab = { button, content, loader };
                console.log(`switchTab: Activating tab:`, button.dataset.element);

                if (this.onTabSwitch) {
                    this.onTabSwitch(button);
                }

                if (loader) {
                    console.log(`switchTab: Calling loader for tab:`, button.dataset.element);
                    loader(content);
                    updateElements();
                } else {
                    console.log(`switchTab: No loader found for tab:`, button.dataset.element);
                }
            }
        });
    }

    reloadActiveTab() {
        if (this.activeTab?.loader) {
            this.activeTab.loader(this.activeTab.content);
        }
    }
}   

function createTabButton(id, label) {
    const button = document.createElement('button');
    button.setAttribute('data-element', id);
    button.classList.add("tab-button");
    button.textContent = label;
    return button;
}

function createTabContent(id) {
    const content = document.createElement('div');
    content.setAttribute('id', id);
    content.setAttribute('data-element', id.replace("Content", ""));
    content.classList.add('tab-content', 'hidden');
    return content;
}

export { createTabButton, createTabContent };
export default TabManager;
