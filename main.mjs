import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Store from 'electron-store';
import { addStudent, fetchStudents, updateStudent, deleteStudents } from './database/database.js';


dotenv.config();
const store = new Store();

// Resolve __dirname since ES modules don't have it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    const stylesPath = path.join(__dirname, 'styles', 'global.css');

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

ipcMain.handle('fetchStudents', async () => {
    const students = fetchStudents();
    return students;
});

ipcMain.handle('updateStudent', async (event, updatedStudent) => updateStudent(updatedStudent));

ipcMain.handle('deleteStudents', async (event, studentIds) => deleteStudents(studentIds));

ipcMain.handle('login', async (event, { username, password }) => {
    return new Promise((resolve, reject) => { // Return a Promise
        const user = users[username];
        if (user && password === user.password) {
            event.sender.send('loginSuccess', user.role); // Send immediately
            resolve({ success: true, role: user.role }); // Resolve the promise
        } else {
            resolve({ success: false, message: 'Invalid credentials' }); // Resolve with failure
        }
    });
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
    createLoginWindow(); // Create the login window
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