    const { contextBridge, ipcRenderer } = require('electron');

    // Enable or disable logging in production
    const DEBUG_MODE = process.env.NODE_ENV === 'development';

    if (DEBUG_MODE) console.log('Preload script loaded');

    // Define valid IPC channels
    const validChannels = Object.freeze({
        invoke: Object.freeze(['fetchStudents','deleteStudents', 'editStudent', 'updateStudent', 'login', 'getCredentials', 'clearCredentials', 'storeCredentials', 'addStudent', 'addStudentFees', 'updateStudentFees','getStudentFees']),
        send: Object.freeze(['updateStudent', 'logMessage', 'editStudent', 'storeCredentials', 'clearCredentials', 'loginSuccess', 'load-sidebar', 'addStudent']),
        receive: Object.freeze(['error', 'studentsUpdated', 'updateSuccess', 'updateFailed', 'dataReceived', 'statusUpdate', 'testResponse', 'loginSuccess', 'user-role'])
    });

    // Auto-log important messages (Debug Mode Only)
    const autoLogChannels = {
        updateSuccess: "Update successful",
        updateFailed: "Update failed",
        loginSuccess: "Login successful, role:"
    };

    if (DEBUG_MODE) {
        Object.keys(autoLogChannels).forEach(channel => {
            ipcRenderer.on(channel, (event, data) => console.log(autoLogChannels[channel], data));
        });
    }

    // Generic IPC Helper Function
    const ipcHelper = (type, channel, dataOrFunc) => {
        if (!validChannels[type].includes(channel)) {
            console.error(`❌ Invalid IPC ${type} channel: ${channel}`);
            throw new Error(`Invalid IPC ${type} channel: ${channel}. Allowed: ${validChannels[type].join(', ')}`);
        }

        if (type === 'invoke') {
            return ipcRenderer.invoke(channel, dataOrFunc).catch(error => {
                console.error(`IPC Invoke Error on ${channel}:`, error);
                return { success: false, error: error.message || 'Unknown IPC Error' };
            });
        }

        if (type === 'send') {
            try {
                ipcRenderer.send(channel, dataOrFunc ?? null);
                return true;
            } catch (error) {
                console.error(`IPC Send Error on ${channel}:`, error);
                return false;
            }
        }

        if (type === 'receive') {
            ipcRenderer.removeAllListeners(channel); // Prevent multiple listeners
            ipcRenderer.on(channel, (event, ...args) => {
                try {
                    dataOrFunc(...args);
                } catch (error) {
                    console.error(`Error in IPC Receive handler for ${channel}:`, error);
                }
            });
            return true;
        }
    };

    // Function to remove specific listeners
    const removeListener = (channel, func) => {
        if (validChannels.receive.includes(channel)) {
            ipcRenderer.off(channel, func);
            if (DEBUG_MODE) console.log(`Listener removed from channel: ${channel}`);
            return true;
        }
        console.warn(`❗ Attempted to remove listener from an invalid channel: ${channel}`);
        return false;
    };

    // Ensure loginSuccess loads sidebar correctly
    ipcRenderer.once('loginSuccess', (event, role) => {
        if (DEBUG_MODE) console.log('✅ Login successful! Role:', role);
        ipcRenderer.send('load-sidebar'); // Trigger sidebar load
        document.dispatchEvent(new Event('sidebar-loaded')); // UI event for sidebar
    });

    // Expose only necessary functions in the renderer process
    contextBridge.exposeInMainWorld('electron', {
        invoke: (channel, data) => ipcHelper('invoke', channel, data),
        send: (channel, data) => ipcHelper('send', channel, data),
        receive: (channel, func) => ipcHelper('receive', channel, func),
        removeListener,
        storeCredentials: (username, password) => ipcHelper('invoke', 'storeCredentials', { username, password }),
        clearStoredCredentials: () => ipcHelper('invoke', 'clearCredentials')
    });
