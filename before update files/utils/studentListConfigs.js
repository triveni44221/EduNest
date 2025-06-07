// studentListConfigs.js

// Columns: shared + specific
export const baseColumns = [
    { key: "studentId", label: "ID No" },
    { key: "studentName", label: "Name" },
    { key: "admissionNumber", label: "Admn No" },
    { key: "fatherCell", label: "Contact" },
    { key: "classYear", label: "Year" },
    { key: "groupName", label: "Group" },
  ];
  
  export const feesTabColumns = [
    ...baseColumns,
    { key: "totalFees", label: "Total Fees" },
    { key: "pendingAmount", label: "Pending" },
  ];
  
  export const attendanceTabColumns = [
    ...baseColumns,
    { key: "attendancePercentage", label: "Attendance %" },
  ];
  
  export const pastStudentsColumns = [...baseColumns];
  
  // Row Click Handlers
  

  export function handleAttendanceClick(student) {
    showStudentAttendanceDetails(student.studentId);
  }
  
  export function handlePastStudentsClick(student) {
    showPastStudentDetails(student.studentId);
  }
  
  async function handleRetainStudents(selectedIds) {
    await window.electron.invoke('retainStudents', selectedIds); // Assuming this is your API call
    filterAndRenderStudents();
}
