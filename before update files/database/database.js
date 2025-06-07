
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
    studentId INTEGER PRIMARY KEY,
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
    perm_same INTEGER DEFAULT NULL, 
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
    gpa REAL DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'active'
);
`;

const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    );
`;

const CREATE_FEES_TABLE = `
    CREATE TABLE IF NOT EXISTS fees (
        studentId INTEGER PRIMARY KEY,
        admissionFees INTEGER NOT NULL,
        eligibilityFee INTEGER NULL,
        isEligibilityApplicable INTEGER NULL,
        collegeFees INTEGER NOT NULL,
        examFees INTEGER NOT NULL,
        labFees INTEGER NULL,
        coachingFee INTEGER NULL,
        isEapcetCoachingApplicable INTEGER NULL,
        isNeetCoachingApplicable INTEGER NULL,
        studyMaterialFees INTEGER NULL,
        uniformFees INTEGER NULL,
        discount INTEGER NULL,

        FOREIGN KEY (studentId) REFERENCES students(studentId)
    ); 
`;  

db.exec(CREATE_STUDENTS_TABLE);
db.exec(CREATE_USERS_TABLE);
db.exec(CREATE_FEES_TABLE);

function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(query);

            if (query.trim().startsWith('SELECT')) {
                const result = stmt.all(params);
                resolve(result);
            } else {
                const result = stmt.run(params);
                resolve({
                    success: result.changes > 0,
                    lastInsertRowid: query.trim().startsWith('INSERT') ? result.lastInsertRowid : undefined,
                    rowsAffected: result.changes
                });
            }
        } catch (error) {
            console.error("Database Error:", error);
            reject({ success: false, message: error.message });
        }
    });
}

export function addStudent(studentData) {
    try {
        const admissionYear = new Date(studentData.dateOfAdmission).getFullYear(); // Get full year
        const nextYear = admissionYear + 1;
        const prefix = (admissionYear % 100) * 1000;


        const usedIds = db.prepare(`
            SELECT studentId FROM students 
            WHERE studentId BETWEEN ? AND ?
            ORDER BY studentId ASC
        `).all(prefix + 1, prefix + 999).map(row => row.studentId);
        
        // Find the first missing student ID in the range
        let nextStudentId = null;
        for (let i = prefix + 1; i <= prefix + 999; i++) {
            if (!usedIds.includes(i)) {
                nextStudentId = i;
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
                village, mandal, district, state, pincode, perm_same, perm_hno, perm_street, perm_village, perm_mandal, perm_district,
                perm_state, perm_pincode, qualifyingExam, yearOfExam, hallTicketNumber, gpa
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
            studentData.pincode ?? 0, studentData.perm_same ?? null, studentData.perm_hno ?? null, studentData.perm_street ?? null,
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

const FEE_FIELDS = [
    "admissionFees", "eligibilityFee", "isEligibilityApplicable", "collegeFees",
    "examFees", "labFees", "coachingFee", "isEapcetCoachingApplicable",
    "isNeetCoachingApplicable", "studyMaterialFees", "uniformFees", "discount"
];

export function saveStudentFees(feeData, isUpdate = false) {
    try {
        const fieldPlaceholders = FEE_FIELDS.map(() => "?").join(", ");
        const fieldAssignments = FEE_FIELDS.map(field => `${field} = ?`).join(", ");

        let stmt, values;

        if (isUpdate) {
            stmt = db.prepare(`
                UPDATE fees SET ${fieldAssignments} WHERE studentId = ?
            `);
            values = [...FEE_FIELDS.map(f => feeData[f]), feeData.studentId];
        } else {
            stmt = db.prepare(`
                INSERT INTO fees (
                    studentId, ${FEE_FIELDS.join(", ")}
                ) VALUES (
                    ?, ${fieldPlaceholders}
                )
            `);
            values = [feeData.studentId, ...FEE_FIELDS.map(f => feeData[f])];
        }

        stmt.run(...values);

        return {
            success: true,
            message: `Fee details ${isUpdate ? "updated" : "added"} successfully`
        };
    } catch (error) {
        console.error(`Error ${isUpdate ? "updating" : "adding"} student fees:`, error);
        return { success: false, message: error.message };
    }
}

export async function getStudentFees(studentId) {
    try {
        const query = `SELECT * FROM fees WHERE studentId = ?`;
        const result = await executeQuery(query, [studentId]);
        if (result && result.length > 0) {
            return { success: true, feeData: result[0] }; // Return the first result
        } else {
            return { success: false, message: "No fee data found for this student." };
        }
    } catch (error) {
        console.error("Error fetching student fees:", error);
        return { success: false, message: error.message };
    }
}

export async function getStudentById(studentId) {
    try {
        const query = 'SELECT * FROM students WHERE studentId = ?';
        const result = await executeQuery(query, [studentId]);
        if (result && result.length > 0) {
            return result[0]; // Return the first matching row
        } else {
            return null; // Return null if no student is found
        }
    } catch (error) {
        console.error("Error fetching student by ID:", error);
        return null; // Or throw an error object
    }
}

export function fetchStudents(limit = 30, offset = 0, filters = {}) {
    const { sql, params } = buildFilterSQL(filters, false);
    const query = `SELECT * FROM students${sql} LIMIT ? OFFSET ?`;
    return executeQuery(query, [...params, limit, offset]);
}

export function getFilteredStudentCount(filters = {}) {
    const { sql, params } = buildFilterSQL(filters, false);
    const query = `SELECT COUNT(*) as total FROM students${sql}`;
    const result = executeQuery(query, params);
    return result[0]?.total || 0;
}

function buildFilterSQL(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status) {
        if (Array.isArray(filters.status)) {
            conditions.push(`status IN (${filters.status.map(() => '?').join(',')})`);
            params.push(...filters.status);
        } else {
            conditions.push(`status = ?`);
            params.push(filters.status);
        }
    }

    if (filters.classYear?.length) {
        conditions.push(`classYear IN (${filters.classYear.map(() => '?').join(',')})`);
        params.push(...filters.classYear);
    }

    if (filters.groupName?.length) {
        conditions.push(`groupName IN (${filters.groupName.map(() => '?').join(',')})`);
        params.push(...filters.groupName);
    }

    const sql = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    return { sql, params };
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

export async function deleteStudents(studentIds) {
    if (!studentIds.length) return { success: false, message: "No student IDs provided" };
    const placeholders = studentIds.map(() => '?').join(', ');
    try {
        const result = await executeQuery(
            `UPDATE students SET status = 'deleted' WHERE studentId IN (${placeholders})`,
            studentIds
        );
        return { success: true, message: `${studentIds.length} student(s) marked as deleted.` };
    } catch (error) {
        console.error("Error marking students as deleted:", error);
        return { success: false, message: "Failed to mark students as deleted." };
    }
}

