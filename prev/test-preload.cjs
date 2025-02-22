const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

// Grouping all valid channels into a single object for easier management
const validChannels = Object.freeze({
    invoke: Object.freeze(['fetchStudents', 'editStudent', 'updateStudent', 'login', 'getCredentials']),  
    send: Object.freeze(['addStudent', 'deleteSelectedStudents', 'updateStudent', 'updateStudents', 'logMessage', 'editStudent', 'storeCredentials', 'clearCredentials', 'loginSuccess']), 
    receive: Object.freeze(['error', 'studentsUpdated', 'updateSuccess', 'updateFailed', 'dataReceived', 'statusUpdate', 'testResponse', 'loginSuccess', 'user-role'])
});

contextBridge.exposeInMainWorld('electron', {
    invoke: (channel, data) => {
        if (!validChannels.invoke.includes(channel)) {
            console.warn(`Attempted to invoke invalid channel: ${channel}`);
            return Promise.reject(new Error(`Invalid channel: ${channel}`));
        }
        return ipcRenderer.invoke(channel, data);
    },

    send: (channel, data) => {
        if (!validChannels.send.includes(channel)) {
            console.warn(`Attempted to send data via invalid channel: ${channel}`);
            return false;  // Explicit return to indicate failure
        }
        console.log(`Sending data via channel: ${channel}`);
        ipcRenderer.send(channel, data);
        return true; // Indicate success
    },

    receive: (channel, func) => {
        if (!validChannels.receive.includes(channel)) {
            console.warn(`Attempted to receive from invalid channel: ${channel}`);
            return false;
        }
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        return true;
    },

    removeListener: (channel) => {
        if (validChannels.receive.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
            console.log(`Removed all listeners from channel: ${channel}`);
            return true;
        }
        console.warn(`Attempted to remove listeners from invalid channel: ${channel}`);
        return false;
    },

    sendLoginSuccess: (data) => ipcRenderer.send('loginSuccess', data),
    storeCredentials: (username, password) => ipcRenderer.invoke('storeCredentials', { username, password }),
    clearStoredCredentials: () => ipcRenderer.invoke('clearCredentials', {}),

    // Register update listeners dynamically via an object
    listenForUpdates: (callback) => {
        const updateEvents = {
            updateSuccess: "Update successful",
            updateFailed: "Update failed",
            loginSuccess: "Login successful, role:",
            'user-role': "User role received:"
        };

        Object.keys(updateEvents).forEach(channel => {
            ipcRenderer.removeAllListeners(channel); // Prevent duplicate listeners
            ipcRenderer.once(channel, (event, data) => {
                console.log(updateEvents[channel], data);
                if (callback) callback(channel, data);
            });
        });
    }
});
