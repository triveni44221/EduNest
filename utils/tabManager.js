class TabManager {
    constructor(tabButtons, tabContents, defaultTab) {
        this.tabs = tabButtons.map((btn, index) => ({
            button: btn,
            content: tabContents[index],
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
        this.tabs.forEach(({ button, content }) => {
            const isActive = button === activeButton;
            button.classList.toggle('active', isActive);
             // ✅ Ensure correct tab content visibility
             if (isActive) {
                content.style.display = "block";  // Show active tab content
            } else {
                content.style.display = "none";  // Hide inactive tab content
            }
        });
    }
}

// ✅ Ensure these functions are exported correctly
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