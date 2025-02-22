import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database file
const dbPath = path.join(__dirname, 'edunest.db');
const db = new Database(dbPath, { verbose: console.log });

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        studentId INTEGER PRIMARY KEY AUTOINCREMENT,
        studentName TEXT NOT NULL,
        admissionNumber INTEGER DEFAULT NULL,  
        dateOfAdmission TEXT NOT NULL,
        year INTEGER NOT NULL, 
        groupName TEXT NOT NULL,
        medium TEXT NOT NULL,
        secondLanguage TEXT NOT NULL,
        batchYear TEXT NOT NULL, 
        fathersName TEXT NOT NULL,
        fatherCell TEXT NOT NULL,
        mothersName TEXT NOT NULL,
        motherCell TEXT NOT NULL,
        dob TEXT NOT NULL,
        nationality TEXT NOT NULL,
        religion TEXT NOT NULL,
        community TEXT NOT NULL,
        motherTongue TEXT NOT NULL,
        scholarship TEXT NOT NULL,
        parentsIncome INTEGER NOT NULL,
        physicallyHandicapped TEXT NOT NULL,
        aadhaar TEXT NOT NULL,
        additionalCell TEXT DEFAULT NULL,
        identificationMark1 TEXT NOT NULL,
        identificationMark2 TEXT DEFAULT NULL,
        hno TEXT NOT NULL,
        street TEXT NOT NULL,
        village TEXT NOT NULL,
        mandal TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode INTEGER NOT NULL, 
        qualifyingExam TEXT NOT NULL,
        yearOfExam INTEGER NOT NULL, 
        hallTicketNumber TEXT NOT NULL,
        gpa REAL DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    );
`);

// **Reusable Student Management Functions**
export function addStudent(studentData) {
    try {
        const stmt = db.prepare(`
            INSERT INTO students (
                studentId, studentName, admissionNumber, dateOfAdmission, year, groupName, medium, secondLanguage,
                batchYear, fathersName, fatherCell, mothersName, motherCell, dob, nationality, religion, community,
                motherTongue, scholarship, parentsIncome, physicallyHandicapped, aadhaar, additionalCell,
                identificationMark1, identificationMark2, hno, street, village, mandal, district, state,
                pincode, qualifyingExam, yearOfExam, hallTicketNumber, gpa
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);

        const result = stmt.run(
            studentData.studentId, studentData.studentName ?? "", studentData.admissionNumber,
            studentData.dateOfAdmission ?? null, studentData.year, studentData.groupName,
            studentData.medium, studentData.secondLanguage, studentData.batchYear, 
            studentData.fathersName ?? null, studentData.fatherCell ?? null, studentData.mothersName ?? null, 
            studentData.motherCell ?? null, studentData.dob ?? null, studentData.nationality ?? null,
            studentData.religion ?? null, studentData.community ?? null, studentData.motherTongue ?? null,
            studentData.scholarship, studentData.parentsIncome ?? null, studentData.physicallyHandicapped,
            studentData.aadhaar ?? null, studentData.additionalCell ?? null, studentData.identificationMark1 ?? null,
            studentData.identificationMark2 ?? null, studentData.hno ?? null, studentData.street ?? null,
            studentData.village ?? null, studentData.mandal ?? null, studentData.district ?? null,
            studentData.state ?? null, studentData.pincode ?? null, studentData.qualifyingExam ?? null,
            studentData.yearOfExam ?? null, studentData.hallTicketNumber ?? null, studentData.gpa ?? null
        );

        return { success: true, message: "Student added successfully", studentId: result.lastInsertRowid };
    } catch (error) {
        console.error("Error adding student:", error);
        return { success: false, message: error.message };
    }
}

export function fetchStudents() {
    try {
        return db.prepare(`SELECT * FROM students`).all();
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
}

export function updateStudent(updatedStudent) {
    try {
        const stmt = db.prepare(`
            UPDATE students SET
                studentName = ?, admissionNumber = ?, dateOfAdmission = ?, year = ?, groupName = ?, 
                medium = ?, secondLanguage = ?, batchYear = ?, fathersName = ?, fatherCell = ?, 
                mothersName = ?, motherCell = ?, dob = ?, nationality = ?, religion = ?, 
                community = ?, motherTongue = ?, scholarship = ?, parentsIncome = ?, 
                physicallyHandicapped = ?, aadhaar = ?, additionalCell = ?, 
                identificationMark1 = ?, identificationMark2 = ?, hno = ?, street = ?, 
                village = ?, mandal = ?, district = ?, state = ?, pincode = ?, 
                qualifyingExam = ?, yearOfExam = ?, hallTicketNumber = ?, gpa = ? 
            WHERE studentId = ?
        `);
        
        const result = stmt.run(
            updatedStudent.studentName, updatedStudent.admissionNumber, updatedStudent.dateOfAdmission,
            updatedStudent.year, updatedStudent.groupName, updatedStudent.medium, updatedStudent.secondLanguage,
            updatedStudent.batchYear, updatedStudent.fathersName, updatedStudent.fatherCell, updatedStudent.mothersName,
            updatedStudent.motherCell, updatedStudent.dob, updatedStudent.nationality, updatedStudent.religion,
            updatedStudent.community, updatedStudent.motherTongue, updatedStudent.scholarship, updatedStudent.parentsIncome,
            updatedStudent.physicallyHandicapped, updatedStudent.aadhaar, updatedStudent.additionalCell,
            updatedStudent.identificationMark1, updatedStudent.identificationMark2, updatedStudent.hno,
            updatedStudent.street, updatedStudent.village, updatedStudent.mandal, updatedStudent.district,
            updatedStudent.state, updatedStudent.pincode, updatedStudent.qualifyingExam, updatedStudent.yearOfExam,
            updatedStudent.hallTicketNumber, updatedStudent.gpa, updatedStudent.studentId
        );

        return { success: result.changes > 0, message: "Student updated successfully" };
    } catch (error) {
        console.error("Error updating student:", error);
        return { success: false, message: error.message };
    }
}

export function deleteStudents(studentIds) {
    try {
        const placeholders = studentIds.map(() => '?').join(',');
        const stmt = db.prepare(`DELETE FROM students WHERE studentId IN (${placeholders})`);
        const result = stmt.run(...studentIds);
        return { success: result.changes > 0, message: "Deleted successfully" };
    } catch (error) {
        console.error("Error deleting students:", error);
        return { success: false, message: error.message };
    }
}
