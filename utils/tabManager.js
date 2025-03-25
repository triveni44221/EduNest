class TabManager {
    constructor(tabButtons, tabContents, defaultTab, contentLoaders = {}) {
        this.tabs = tabButtons.map((btn, index) => ({
            button: btn,
            content: tabContents[index],
            loader: contentLoaders[btn.getAttribute("data-element")] || null, // Get loader function if exists
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

            // ✅ Show or hide tab content
            content.style.display = isActive ? "block" : "none";

            // ✅ Load dynamic content if loader exists & content is empty
            if (isActive && loader && content.innerHTML.trim() === "") {
                loader(content);
            }
        });
    }
}

// ✅ Helper functions to create UI elements
function createTabButton(id, label) {
    const button = document.createElement('button');
    button.setAttribute('data-element', id);
    button.classList.add("tab-button");
    button.textContent = label;
    return button;
}

function createTabContent(id) {
    const content = document.createElement('div');
    content.setAttribute('data-element', id);
    content.classList.add('tab-content', 'hidden');
    return content;
}

// ✅ Correct export syntax
export { createTabButton, createTabContent };
export default TabManager;
