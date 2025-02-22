// utils/dataUtils.js
export function calculateDateYearsAgo(yearsAgo) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().split('T')[0];
}