document.addEventListener("DOMContentLoaded", () => {
    window.electron.receive('user-role', (role) => {
        console.log("Received user role:", role);
        loadSidebar(); // Load sidebar only after receiving the role
    });
});

// Function to dynamically load the sidebar **only after login**
function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        fetch('./sidebar/sidebar.html')
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                setupSidebar(); // Call the setup function after the sidebar is loaded
            })
            .catch(error => console.error('Failed to load sidebar:', error));
    }
}

// Function to set up event listeners and initial active tab highlighting
function setupSidebar() {
    // Sidebar button IDs
    const buttonIds = [ "homeButton", "studentsButton", "employeesButton", "classesButton", "attendanceButton",
         "feesButton", "accountsButton", "examsButton", "reportsButton", "notificationsButton", "settingsButton"];

    // Add event listeners to buttons
    buttonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", () => loadContent(id.replace("Button", ""))); // Extract page name
        }
    });


 // Function to load content dynamically
 function loadContent(page) {
    const content = document.getElementById("content");
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    let folder;
    switch (page) {
        case 'students':
            folder = 'students';
            break;
        case 'tests':
            folder = 'tests';
            break;
        // Add more cases for other folders as needed
        default:
            folder = 'main'; // Default folder or handle as needed.
            break;
    }

    fetch(`${folder}/${page}.html`)
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data;

            const script = document.createElement('script');
script.src = `${folder}/${page}.js`;
script.type = "module"; // ✅ Important: Load as ES module
script.setAttribute("data-module", page); // Avoid duplicate script loads

// Remove previous script if already loaded
document.querySelectorAll(`script[data-module="${page}"]`).forEach(s => s.remove());

script.onload = () => console.log(`${folder}/${page}.js loaded successfully.`);
script.onerror = () => console.error(`Failed to load ${folder}/${page}.js.`);
document.body.appendChild(script);

            updateActiveTab(page);
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        })
        .catch(error => {
            content.innerHTML = "<h1>Error loading content</h1>";
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            console.error(`Error loading ${folder}/${page}.html:`, error);
        });
}

    // Function to highlight the active tab
    function updateActiveTab(page) {
        // Clear previous active states
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.classList.remove("active");
        });

        // Add "active" class to the current button
        const activeButton = document.getElementById(`${page}Button`);
        if (activeButton) {
            activeButton.classList.add("active");
        }
    }

    // Highlight active tab on initial load based on the current page URL
    const currentPage = window.location.pathname.split('/').pop().split('.').shift(); // Extract page name (e.g., "home")
    updateActiveTab(currentPage); // Highlight active tab when the page loads
}
