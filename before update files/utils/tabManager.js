import { updateElements } from './sharedElements.js';

class TabManager {
    constructor(tabButtons, tabContents, defaultTab, contentLoaders = {}) {
        this.tabs = tabButtons.map((btn, index) => ({
            button: btn,
            content: tabContents[index],
            loader: contentLoaders[btn.getAttribute("data-element")] || null,
        }));
        this.activeTab = defaultTab || this.tabs[0];
        this.init();
    }

    init() {
        this.tabs.forEach(({ button }) => {
            button.addEventListener('click', () => this.switchTab(button));
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

                if (loader) {
                    console.log(`switchTab: Calling loader for tab:`, button.dataset.element);

                    loader(content); // Always call loader when switching
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
