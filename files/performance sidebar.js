document.addEventListener("DOMContentLoaded", () => {
    electron.send('logMessage', 'This is a test message');
     window.electron.receive('statusUpdate', (statusMessage) => {

    });
    // Dynamically load the sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        fetch('sidebar.html')
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                setupSidebar(); // Call the setup function after the sidebar is loaded
            })
            .catch(error => console.error('Failed to load sidebar:', error));
    }
});

// Function to set up event listeners and initial active tab highlighting
function setupSidebar() {
    // Sidebar button IDs
    const buttonIds = [ "homeButton", "studentsButton", "testsButton", "classPerformanceButton", 
        "individualPerformanceButton", "generateReportsButton", "notificationsButton", "settingsButton" ];

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
    if (loadingSpinner) loadingSpinner.style.display = 'block'; // Show spinner

    fetch(`${page}.html`)
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data; // Inject HTML content

            // Dynamically load the corresponding JavaScript file
            const script = document.createElement('script');
            script.src = `${page}.js`; // Load external JS (e.g., home.js)
            script.onload = () => {
                console.log(`${page}.js loaded successfully.`);
            };
            script.onerror = () => {
                console.error(`Failed to load ${page}.js.`);
            };
            document.body.appendChild(script); // Append and execute the script

            updateActiveTab(page);
            if (loadingSpinner) loadingSpinner.style.display = 'none'; // Hide spinner
        })
        .catch(error => {
            content.innerHTML = "<h1>Error loading content</h1>";
            if (loadingSpinner) loadingSpinner.style.display = 'none'; // Hide spinner
            console.error(`Error loading ${page}.html:`, error);
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
