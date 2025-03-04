// sidebar.js

document.addEventListener("DOMContentLoaded", () => {
    window.electron.receive('user-role', () => loadSidebar());
});

if (!window.tabInitializers) window.tabInitializers = {};

window.registerTabInitializer = (tabName, initFunction) => {
    window.tabInitializers[tabName] = initFunction;
};

function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    fetch('./sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            sidebarContainer.innerHTML = data;
            setupSidebar(); // Call setupSidebar here
            autoLoadTab();
        })
        .catch(error => console.error('Failed to load sidebar:', error));
}

function autoLoadTab() {
    const currentPath = window.location.pathname.split('/').pop().split('.').shift();
    if (currentPath && window.tabInitializers[currentPath]) {
        loadContent(currentPath);
    } else {
        loadContent('home');
    }
}

function setupSidebar() {
    const buttonIds = [
        "homeButton", "studentsButton", "employeesButton", "classesButton",
        "attendanceButton", "feesButton", "accountsButton", "examsButton",
        "reportsButton", "notificationsButton", "settingsButton"
    ];

    buttonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", () => loadContent(id.replace("Button", "")));
        }
    });

    const currentPage = window.location.pathname.split('/').pop().split('.').shift();
    updateActiveTab(currentPage);
}

function loadContent(page) {
    const content = document.getElementById("content");
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    fetch(`${page}/${page}.html`)
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data;
            loadTabScript(page);
            updateActiveTab(page);
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        })
        .catch(error => {
            content.innerHTML = "<h1>Error loading content</h1>";
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            console.error(`Error loading ${page}/${page}.html:`, error);
        });
}

function loadTabScript(page) {
    document.querySelectorAll(`script[data-module="${page}"]`).forEach(s => s.remove());

    if (document.querySelector(`script[src="${page}/${page}.js"]`)) {
        console.warn(`⚠️ Script ${page}.js is already loaded.`);
        return;
    }

    const script = document.createElement('script');
    script.src = `${page}/${page}.js`;
    script.type = "module";
    script.setAttribute("data-module", page);

    script.onload = () => {
        console.log(`${page}/${page}.js loaded successfully.`);
        setTimeout(() => {
            if (window.tabInitializers[page]) {
                window.tabInitializers[page]();
            } else {
                console.warn(`⚠️ No initializer found for "${page}".`);
            }
        }, 0);
    };

    script.onerror = () => console.error(`Failed to load ${page}/${page}.js.`);
    document.body.appendChild(script);
}

function updateActiveTab(page) {
    document.querySelectorAll('.sidebar-button').forEach(button => button.classList.remove("active"));
    const activeButton = document.getElementById(`${page}Button`);
    if (activeButton) activeButton.classList.add("active");
}