// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message'); 
const togglePassword = document.getElementById('togglePassword');
const toggleIcon = document.getElementById('toggleIcon'); 
const rememberMeCheckbox = document.getElementById("rememberMeCheckbox"); 
const remainingAttemptsMessage = document.getElementById('remainingAttempts');
const submitButton = loginForm.querySelector('button[type="submit"]');

// Constants
const MAX_FAILED_ATTEMPTS = 5; 
let failedAttempts = 0;

document.addEventListener("DOMContentLoaded", async () => {
    const isLinux = navigator.platform.includes('Linux');
    
    if (isLinux) {
        console.log("Running on Linux. Skipping login form.");
        const simulatedUsername = 'admin'; // Simulate a username
        const simulatedPassword = 'password'; // Simulate a password
        await handleLogin({ preventDefault: () => {} }, simulatedUsername, simulatedPassword);
    } else {
        togglePassword.addEventListener('click', togglePasswordVisibility);
        loginForm.addEventListener('submit', handleLogin);
        await loadStoredCredentials(); // Load stored credentials on startup
    }
});


window.electron.receive('loginSuccess', (role) => {
    console.log("Login successful. Redirecting...");
    redirectToDashboard(role);
});


// Load stored credentials
async function loadStoredCredentials() {
    try {
        const savedCredentials = await window.electron.invoke('getCredentials');
        if (savedCredentials) {
            usernameInput.value = savedCredentials.username;
            passwordInput.value = savedCredentials.password;
            rememberMeCheckbox.checked = true;
        }
    } catch (error) {
        console.error('Error loading saved credentials:', error);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const currentType = passwordInput.getAttribute('type');
    passwordInput.setAttribute('type', currentType === 'password' ? 'text' : 'password');
    toggleIcon.classList.toggle('fa-eye', passwordInput.getAttribute('type') === 'text');
    toggleIcon.classList.toggle('fa-eye-slash', currentType === 'password');
}

// Input validation
function isValidInput(username, password) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username) && password.length > 0;
}

// Handle form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    if (!isValidInput(username, password)) {
        return displayErrorMessage("Invalid username or password format.");
    }

    try {
        submitButton.disabled = true;
        displayErrorMessage("Logging in...");

        const result = await window.electron.invoke('login', { username, password });
        console.log("Login result:", result);

        if (result.success) {
            console.log("Login successful. Storing credentials..."); // Add this line
            if (rememberMe) {
                await window.electron.invoke('storeCredentials', { username, password });
                console.log("Credentials stored successfully."); // Add this line
            } else {
                await window.electron.clearStoredCredentials();
            }
            successfulLogin(result.role);
        } else {
            processLoginResult(result, username);
        }
    } catch (error) {
        console.error('Login failed:', error);
        displayErrorMessage("An error occurred while attempting to log in. Please try again.");
    } finally {
        submitButton.disabled = false;
    }
}

// Process login result
function processLoginResult(result, username) {
    failedAttempts++;
    displayErrorMessage(result.message || "Invalid username or password.");
    console.log("Failed attempts:", failedAttempts);

    const remainingAttempts = MAX_FAILED_ATTEMPTS - failedAttempts;
    remainingAttemptsMessage.textContent = `Remaining attempts: ${remainingAttempts}`;
    remainingAttemptsMessage.style.display = remainingAttempts > 0 ? 'block' : 'none';

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockAccount(username);
    }
}

function successfulLogin(role) {
    console.log("Successful login for role:", role);
    document.querySelector(".login-container").style.display = "none"; 
    displayWelcomeMessage(role);
    clearInputs(); 

    // Send login success event
    window.electron.send('loginSuccess', role);
}


// Function to clear input fields
function clearInputs() {
    usernameInput.value = '';
    passwordInput.value = '';
    rememberMeCheckbox.checked = false;
}

// Function to display welcome messages
function displayWelcomeMessage(role) {
    const welcomeMessageContainer = document.createElement('div');
    welcomeMessageContainer.id = 'welcomeMessage';
    welcomeMessageContainer.style.fontSize = '24px';
    welcomeMessageContainer.style.marginTop = '20px';
    welcomeMessageContainer.style.textAlign = 'center';

    welcomeMessageContainer.textContent = `Welcome, ${role}!`;
    document.body.appendChild(welcomeMessageContainer); 

    setTimeout(() => {
        redirectToDashboard(role);
    }, 2000); 
}

// Redirect user based on their role
function redirectToDashboard(role) {
    const dashboardMap = {
        'Admin': 'adminDashboard.html',
        'Operator': 'operatorDashboard.html',
        'Accountant': 'accountantDashboard.html',
        'Staff': 'staffDashboard.html',
        'Student': 'studentDashboard.html'
    };

    const targetUrl = dashboardMap[role] || 'errorPage.html';
    console.log(`Redirecting to ${role} Dashboard`);
    window.location.href = targetUrl;
}

// Lock account function
function lockAccount(username) {
    console.log(`Account for ${username} is locked.`);
    displayErrorMessage("Account temporarily locked. Please contact support.");

    usernameInput.disabled = true;
    passwordInput.disabled = true;
    rememberMeCheckbox.disabled = true;
    submitButton.disabled = true;
}

// Function to display error messages
function displayErrorMessage(message) {
    errorMessage.textContent = message; 
    errorMessage.style.display = 'block'; 
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Global error handling in the renderer process
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Unhandled Exception:', message, error);
};