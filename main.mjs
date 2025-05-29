import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Store from 'electron-store';
import { addStudent, fetchStudents, updateStudent, deleteStudents, saveStudentFees } from './database/database.js';
import { getStudentFees, getStudentById, getFilteredStudentCount } from './database/database.js'; // Import function

dotenv.config();
const store = new Store();

console.log("🔍 Loaded ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD); // Debug log


// Resolve __dirname since ES modules don't have it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCssPath(filePath) {
    return path.join(__dirname, 'css', filePath);
}

const cssFilePaths = [
    'base.css', 'layout.css',  'utilities.css',
    'components/buttons.css', 'components/data-display.css', 
    'components/forms-tables-filters.css', 'components/navigation.css',
    'components/tabs-and-authentication.css',    
];

cssFilePaths.forEach(filePath => {
    const fullPath = getCssPath(filePath);
   });

const users = { 
    admin: { password: process.env.ADMIN_PASSWORD, role: 'Admin' },
    operator: { password: process.env.OPERATOR_PASSWORD, role: 'Operator' },
    accountant: { password: process.env.ACCOUNTANT_PASSWORD, role: 'Accountant' },
    staff: { password: process.env.STAFF_PASSWORD, role: 'Staff' },
    student: { password: process.env.STUDENT_PASSWORD, role: 'Student' }
};

function createLoginWindow() {
    const loginWin = new BrowserWindow({
        width: 800, 
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    const loginPath = path.join(__dirname, 'login', 'login.html');
    loginWin.loadFile(loginPath); // Load the login.html file
    loginWin.loadFile(path.join(__dirname, 'login', 'login.html'));
    loginWin.maximize(); 

    ipcMain.on('loginSuccess', (event, role) => {
        loginWin.close(); 
        createMainWindow(role); 
    });
}

function createMainWindow(role) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
        frame: true,
        maximizable: true,
    });

    win.loadFile('index.html');
    win.maximize();
    
    win.webContents.once('did-finish-load', () => {
        win.webContents.send('user-role', role);
    });
}

ipcMain.handle('addStudent', async (event, studentData) => addStudent(studentData));

ipcMain.handle('fetchStudents', async (event, { limit = 30, offset = 0, filters = {} } = {}) => {
    try {
        const result = await fetchStudents(limit, offset, filters);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in IPC fetchStudents:", error);
        return { success: false, message: error.message };
    }
});


ipcMain.handle('getFilteredStudentCount', async (event, filters) => {
    try {
        const count = await getFilteredStudentCount(filters);
        return count;
    } catch (error) {
        console.error('❌ Error getting filtered student count:', error);
        return 0;
    }
});


ipcMain.handle('updateStudent', async (event, updatedStudent) => updateStudent(updatedStudent));

ipcMain.handle('deleteStudents', async (event, studentIds) => deleteStudents(studentIds));

ipcMain.handle('addStudentFees', async (event, feeData) => saveStudentFees(feeData));

ipcMain.handle('getStudentFees', async (event, { studentId }) => {
    return getStudentFees(studentId);
});

ipcMain.handle('getStudentById', async (event, studentId) => {
    console.log(`ipcMain.handle: Received getStudentById request for ID ${studentId}`);
    try {
        const studentDetails = await getStudentById(studentId);
        console.log(`ipcMain.handle: getStudentById returned:`, studentDetails);
        return studentDetails;
    } catch (error) {
        console.error("ipcMain.handle: Error fetching student details:", error);
        return null; // Or throw an error object
    }
});

ipcMain.handle('updateStudentFees', async (event, feeData) => saveStudentFees(feeData, true));


ipcMain.handle('login', async (event, { username, password }) => {
    console.log("Received Login Request:", { username, password });
    console.log("Loaded Users Object:", users);

    const user = users[username];

    if (user) {
        console.log(`Checking login for ${username}:`, {
            entered: password,
            expected: user.password
        });

        if (password === user.password) {
            console.log("✅ Login successful!");
            event.sender.send('loginSuccess', user.role);
            return { success: true, role: user.role };
        } else {
            console.log("❌ Password mismatch!");
        }
    } else {
        console.log("❌ User not found!");
    }

    return { success: false, message: 'Invalid credentials' };
});


ipcMain.handle('storeCredentials', (event, { username, password }) => {
    store.set('credentials', { username, password });
    return true;
});

ipcMain.handle('getCredentials', () => {
    return store.get('credentials') || null;
});

ipcMain.handle('clearCredentials', () => {
    store.delete('credentials');
    return true;
});

app.whenReady().then(() => {
    const isLinux = process.platform === 'linux';
    
    if (isLinux) {
        // Simulate successful login on Linux
        console.log("Running on Linux. Skipping login.");
        createMainWindow('Admin'); // Or whichever role you want to simulate
    } else {
        createLoginWindow(); // Normal login flow on other platforms
    }
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});