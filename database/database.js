import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database file
const dbPath = path.join(__dirname, 'edunest.db');
const db = new Database(dbPath, { verbose: console.log });

/** TABLE DEFINITIONS **/
const CREATE_STUDENTS_TABLE = `
    CREATE TABLE IF NOT EXISTS students (
    studentId INTEGER PRIMARY KEY, -- ❌ Removed AUTOINCREMENT
    studentName TEXT NOT NULL,
    gender TEXT NOT NULL,
    admissionNumber INTEGER DEFAULT NULL,  
    dateOfAdmission TEXT NOT NULL,
    classYear TEXT NOT NULL, 
    groupName TEXT NOT NULL,
    medium TEXT NOT NULL,
    secondLanguage TEXT NOT NULL,
    batchYear TEXT NOT NULL, 
    dob TEXT NOT NULL,
    nationality TEXT NOT NULL,
    otherNationality TEXT DEFAULT NULL,
    religion TEXT NOT NULL,
    community TEXT NOT NULL,
    motherTongue TEXT NOT NULL,
    scholarship TEXT NOT NULL,
    parentsIncome Text NOT NULL,
    physicallyHandicapped TEXT NOT NULL,
    aadhaar TEXT NOT NULL,
    additionalCell TEXT DEFAULT NULL,
    identificationMark1 TEXT NOT NULL,
    identificationMark2 TEXT DEFAULT NULL,
    fathersName TEXT NOT NULL,
    fatherCell TEXT NOT NULL,
    fatherOccupation TEXT NOT NULL,
    mothersName TEXT NOT NULL,
    motherCell TEXT NOT NULL,
    motherOccupation TEXT NOT NULL,
    hno TEXT NOT NULL,
    street TEXT NOT NULL,
    village TEXT NOT NULL,
    mandal TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode INTEGER NOT NULL, 
    perm_hno TEXT DEFAULT NULL,
    perm_street TEXT DEFAULT NULL,
    perm_village TEXT DEFAULT NULL,
    perm_mandal TEXT DEFAULT NULL,
    perm_district TEXT DEFAULT NULL,
    perm_state TEXT DEFAULT NULL,
    perm_pincode INTEGER DEFAULT NULL,
    qualifyingExam TEXT NOT NULL,
    yearOfExam INTEGER NOT NULL, 
    hallTicketNumber TEXT NOT NULL,
    gpa REAL DEFAULT NULL
);
`;

const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    );
`;

// Create tables
db.exec(CREATE_STUDENTS_TABLE);
db.exec(CREATE_USERS_TABLE);

/** REUSABLE QUERY EXECUTION FUNCTION **/
function executeQuery(query, params = []) {
    try {
        const stmt = db.prepare(query);
        if (query.trim().startsWith('SELECT')) {
            return stmt.all(params);
        }
        const result = stmt.run(params);
        return {
            success: result.changes > 0,
            lastInsertRowid: query.trim().startsWith('INSERT') ? result.lastInsertRowid : undefined,
            rowsAffected: result.changes
        };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, message: error.message };
    }
}

/** STUDENT MANAGEMENT FUNCTIONS **/

export function addStudent(studentData) {
    try {
        const admissionYear = new Date(studentData.dateOfAdmission).getFullYear(); // Get full year
        const nextYear = admissionYear + 1;
        const prefix = (admissionYear % 100) * 1000;


        // Find all used student IDs in the current year's range
        const usedIds = db.prepare(`
            SELECT studentId FROM students 
            WHERE studentId BETWEEN ? AND ? 
            ORDER BY studentId ASC
        `).all(prefix + 1, prefix + 999).map(row => row.studentId);

        // Find the first missing student ID
        let nextStudentId = null;
        for (let i = prefix + 1; i <= prefix + 999; i++) {
            if (!usedIds.includes(i)) {  // If there's a gap, use it
                nextStudentId = parseInt(i, 10);
                break;
            }
        }

        if (!nextStudentId) {
            throw new Error("No available student IDs in this range. Increase range or check for database errors.");
        }

        const stmt = db.prepare(`
            INSERT INTO students (
                studentId, studentName, gender, admissionNumber, dateOfAdmission, classYear, groupName, medium, secondLanguage,
                batchYear, fathersName, fatherCell, fatherOccupation, mothersName, motherCell, motherOccupation, dob, 
                nationality, otherNationality, religion, community, motherTongue, scholarship, parentsIncome, 
                physicallyHandicapped, aadhaar, additionalCell, identificationMark1, identificationMark2, hno, street, 
                village, mandal, district, state, pincode, perm_hno, perm_street, perm_village, perm_mandal, perm_district,
                perm_state, perm_pincode, qualifyingExam, yearOfExam, hallTicketNumber, gpa
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);

        const result = stmt.run(
            nextStudentId, studentData.studentName ?? "", studentData.gender ?? null,
            studentData.admissionNumber ?? null, studentData.dateOfAdmission ?? null, 
            studentData.classYear ?? "first", studentData.groupName ?? null, studentData.medium ?? "english",
            studentData.secondLanguage ?? "sanskrit", `${admissionYear}-${nextYear}`,
            studentData.fathersName ?? null, studentData.fatherCell ?? null, studentData.fatherOccupation ?? "no",
            studentData.mothersName ?? null, studentData.motherCell ?? null, studentData.motherOccupation ?? "no",
            studentData.dob ?? null, studentData.nationality ?? "indian", studentData.otherNationality ?? null,
            studentData.religion ?? null, studentData.community ?? null, studentData.motherTongue ?? null, 
            studentData.scholarship ?? "no", studentData.parentsIncome ?? '0', 
            studentData.physicallyHandicapped ?? "no", studentData.aadhaar ?? null, studentData.additionalCell ?? null,
            studentData.identificationMark1 ?? null, studentData.identificationMark2 ?? null,
            studentData.hno ?? null, studentData.street ?? null, studentData.village ?? null,
            studentData.mandal ?? null, studentData.district ?? null, studentData.state ?? null,
            studentData.pincode ?? 0, studentData.perm_hno ?? null, studentData.perm_street ?? null,
            studentData.perm_village ?? null, studentData.perm_mandal ?? null, studentData.perm_district ?? null,
            studentData.perm_state ?? null, studentData.perm_pincode ?? null, studentData.qualifyingExam ?? null,
            studentData.yearOfExam ?? 0, studentData.hallTicketNumber ?? null, studentData.gpa ?? 0.0
        );

        return { success: true, message: "Student added successfully", studentId: nextStudentId };
    } catch (error) {
        console.error("Error adding student:", error);
        return { success: false, message: error.message };
    }
}

export function fetchStudents(limit = 30, offset = 0) {
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);

    const query = `SELECT * FROM students LIMIT ? OFFSET ?`;
    console.log("fetchStudents called with limit:", limit, "offset:", offset); // Add this
    const result = executeQuery(query, [limit, offset]);
    console.log("executeQuery result:", result); // Add this
    return result;
}

export function updateStudent(updatedData) {  // Take updatedData ONLY
    try {
        if (!updatedData.studentId) { // Check if studentId is present
            return { success: false, message: "Student ID is missing for update" };
        }
        const studentId = updatedData.studentId; // Extract studentId
        delete updatedData.studentId; // Remove studentId from the update object

        const updates = Object.keys(updatedData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updatedData), studentId];

        const query = `UPDATE students SET ${updates} WHERE studentId = ?`;
        return executeQuery(query, values);
    } catch (error) {
        console.error("Error updating student:", error);
        return { success: false, message: error.message };
    }
}

export function deleteStudents(studentIds) {
    if (!studentIds.length) return { success: false, message: "No student IDs provided" };

    const placeholders = studentIds.map(() => '?').join(', ');
    const query = `DELETE FROM students WHERE studentId IN (${placeholders})`;
    return executeQuery(query, studentIds);
}

