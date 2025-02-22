console.log("🔵 EduNest Electron App is starting...");
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Store from 'electron-store';
import { existsSync } from 'fs';
dotenv.config();
const store = new Store();

console.log("📌 Checking Electron Store functionality...");

// Test storing and retrieving data
store.set('testKey', 'testValue');
const testValue = store.get('testKey');

console.log("✅ Electron Store test value:", testValue);


// Define __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("🔍 DEBUG: ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);

const studentFilePath = path.join(__dirname, 'students.json');

const users = {
    admin: { password: process.env.ADMIN_PASSWORD, role: 'Admin' },
    operator: { password: process.env.OPERATOR_PASSWORD, role: 'Operator' },
    accountant: { password: process.env.ACCOUNTANT_PASSWORD, role: 'Accountant' },
    staff: { password: process.env.STAFF_PASSWORD, role: 'Staff' },
    student: { password: process.env.STUDENT_PASSWORD, role: 'Student' }
};

// Login authentication
ipcMain.handle('login', async (event, username, password) => {
    const user = users[username];
    if (user && password === user.password) {
        return { success: true, role: user.role };
    } else {
        return { success: false, message: 'Invalid credentials' };
    }
});

// Store and retrieve credentials
ipcMain.handle('store-credentials', (event, username, password) => {
    console.log("Storing credentials:", username, password);
    if (!username || !password) {
        console.error("⚠️ Invalid username or password. Skipping save.");
        return false;
    }
    store.set('credentials', { username, password });
    const stored = store.get('credentials');
    console.log("✅ Stored credentials after saving:", stored);
    return true;
});

ipcMain.handle('get-credentials', () => {
    const credentials = store.get('credentials');
    
    console.log("🔍 Fetching stored credentials:", credentials);
    
    if (!credentials) {
        console.warn("⚠️ No credentials found in Electron Store.");
        return null;
    }

    return credentials;
});

ipcMain.handle('logout', async () => {
    console.log("🔴 LOGOUT FUNCTION TRIGGERED IN MAIN PROCESS!");
    store.delete('credentials'); // Properly clear stored credentials
    return { success: true, message: "User logged out successfully" };
});



const credentialsPath = path.join(app.getPath('userData'), 'credentials.json');

ipcMain.handle('clearStoredCredentials', async () => {
    try {
        if (existsSync(credentialsPath)) {
            await fs.unlink(credentialsPath);
            console.log("✅ Stored credentials file deleted.");
        } else {
            console.log("ℹ️ No stored credentials file found.");
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to clear stored credentials:', error);
        return { success: false, error: error.message };
    }
});


function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        frame: true,
        maximizable: true,
    });
    console.log("🔍 Checking stored credentials before loading login.html...");

    setTimeout(() => {
        console.log("✅ Loading login.html...");
        win.loadFile(path.join(__dirname, 'login.html'));
        win.maximize();
    }, 5000); // 5-second delay to check console logs
}

async function saveStudentLocally(studentData) {
    try {
        let students = await loadStudents();

        if (!studentData || typeof studentData !== 'object' || !studentData.studentId) {
            console.error('Invalid student data, not saving.');
            return;
        }

        students.push(studentData);
        await fs.writeFile(studentFilePath, JSON.stringify(students, null, 2));
    } catch (error) {
        console.error('Error saving student data:', error);
    }
}

async function loadStudents() {
    try {
        const rawData = await fs.readFile(studentFilePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading students data:', error);
        return [];
    }
}

ipcMain.on('addStudent', async (event, studentData) => {
    try {
        await saveStudentLocally(studentData);
        event.reply('studentAdded', studentData);
    } catch (error) {
        console.error("Error adding student:", error);
        event.reply('error', error.message);
    }
});

ipcMain.handle('fetchStudents', async () => {
    try {
        return await loadStudents();
    } catch (err) {
        console.error('Failed to fetch student data:', err);
        throw new Error('Unable to fetch students');
    }
});

app.whenReady().then(() => {
    createWindow();
    ipcMain.handle("getStoredCredentials", async () => {
        const credentials = store.get('credentials');
        console.log("🔍 Fetching stored credentials:", credentials);
        return credentials || null;
    });

    ipcMain.handle('storeUserRole', (event, role) => {
        store.set('userRole', role);
        return true;
    });
    
    ipcMain.handle('getUserRole', () => {
        return store.get('userRole') || null;
    });
    
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
