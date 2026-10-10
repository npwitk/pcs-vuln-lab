// A cheat sheet can cover several exams (e.g. Midterm + Final content in one
// PDF). The API returns them as `exam_types`, in this canonical order, with
// `exam_type` mirroring the first; see server/utils/examTypes.js.
export const EXAM_TYPES = ['Midterm', 'Final', 'Quiz'];

// Every exam a sheet covers, tolerating rows that only carry exam_type.
export function sheetExamTypes(sheet) {
  if (!sheet) return [];
  if (Array.isArray(sheet.exam_types) && sheet.exam_types.length) return sheet.exam_types;
  return sheet.exam_type ? [sheet.exam_type] : [];
}

// "Midterm + Final", or '' when none.
export function formatExamTypes(sheet) {
  return sheetExamTypes(sheet).join(' + ');
}

// Compact label for tight spots like card pills: "Mid + Final". Only a
// multi-exam sheet is shortened; a single "Midterm" stays as is.
const SHORT_EXAM_TYPES = { Midterm: 'Mid' };
export function formatExamTypesShort(sheet) {
  const types = sheetExamTypes(sheet);
  if (types.length < 2) return types.join('');
  return types.map(type => SHORT_EXAM_TYPES[type] || type).join(' + ');
}

// Whether a sheet counts for an exam of this type (case-insensitive, as the
// upcoming-exams carousel always compared).
export function coversExamType(sheet, examType) {
  const wanted = (examType || '').trim().toUpperCase();
  return !!wanted && sheetExamTypes(sheet).some(type => type.trim().toUpperCase() === wanted);
}
