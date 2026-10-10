// What the upcoming-exams carousel shows from GET /api/upcoming-exams: future
// exams of one type, the type of the first exam. Exams for the user's own
// programs come first (relevance 2, then untagged 1, then other programs 0;
// see server/services/studyTags.js), each by date. Exams without a relevance
// (the static JSON fallback) count as 1, so they're plain date order.
export function pickUpcomingExams(exams, now = new Date()) {
  const relevance = (exam) => (Number.isInteger(exam.relevance) ? exam.relevance : 1);
  const upcoming = (exams || [])
    .filter(exam => new Date(exam.examDate) > now)
    .sort((a, b) => relevance(b) - relevance(a) || new Date(a.examDate) - new Date(b.examDate));
  if (upcoming.length === 0) return [];
  return upcoming.filter(exam => exam.examType === upcoming[0].examType);
}
