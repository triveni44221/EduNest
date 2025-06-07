import { renderStudentList } from '../students/studentsUI.js';
import { initializeStudentsPage } from '../students/students.js';

export function handleElectronUpdates() {
    window.electron.receive('updateSuccess', () => {
        window.electron
            .invoke('fetchStudents')
            .then((updatedStudents) => {
                renderStudentList(updatedStudents);
                initializeStudentsPage();
            })
            .catch((error) => {
                console.error('Error fetching updated students:', error);
                alert('Failed to fetch the updated student list. Please try again.');
            });
    });
}
handleElectronUpdates();

export function handleElectronErrors() {
    if (window.electron) {
        window.electron.receive('error', (errorMessage) => {
            alert('Error: ' + errorMessage);
        });
    }
}

handleElectronErrors();