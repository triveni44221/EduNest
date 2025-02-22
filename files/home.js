// Attach event listeners after content is loaded
function initializeHomePage() {
    console.log("Initializing Home Page...");

    const messageElement = document.getElementById('message');
    const changeMessageBtn = document.getElementById('changeMessageBtn');

    // Check if elements are present
    if (messageElement) {
        console.log("Message element found:", messageElement);
    } else {
        console.error("Message element not found.");
    }

    if (changeMessageBtn) {
        console.log("Button element found:", changeMessageBtn);

        // Attach event listener to the button
        changeMessageBtn.addEventListener('click', function () {
            console.log("Button clicked.");
            messageElement.textContent = "The message has been changed!";
            console.log("Message updated:", messageElement.textContent);
        });
    } else {
        console.error("Button element not found.");
    }
}

// Call the initialization function directly after the script loads
initializeHomePage();
