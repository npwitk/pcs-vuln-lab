import { baht } from './money';
import { sheetExamTypes, formatExamTypes, formatExamTypesShort, coversExamType } from './examTypes';
import { getErrorMessage } from './getErrorMessage';
import { pickUpcomingExams } from './upcomingExams';

describe('baht', () => {
  it.each([
    [40, {}, '฿40'],
    [1092.5, {}, '฿1,092.50'],
    [40, { always2: true }, '฿40.00'],
    [-12.25, {}, '−฿12.25'],
    [1234, { compact: true }, '฿1.2k'],
    [999.6, { compact: true }, '฿1,000'],
    ['not a number', {}, '฿0'],
  ])('baht(%p, %p) -> %p', (value, options, expected) => {
    expect(baht(value, options)).toBe(expected);
  });
});

describe('exam types', () => {
  it('prefers exam_types and falls back to exam_type', () => {
    expect(sheetExamTypes({ exam_types: ['Midterm', 'Final'], exam_type: 'Midterm' })).toEqual(['Midterm', 'Final']);
    expect(sheetExamTypes({ exam_types: [], exam_type: 'Quiz' })).toEqual(['Quiz']);
    expect(sheetExamTypes(null)).toEqual([]);
  });

  it('formats and matches case-insensitively', () => {
    expect(formatExamTypes({ exam_types: ['Midterm', 'Final'] })).toBe('Midterm + Final');
    expect(coversExamType({ exam_types: ['Final'] }, ' final ')).toBe(true);
    expect(coversExamType({ exam_types: ['Final'] }, 'Midterm')).toBe(false);
    expect(coversExamType({ exam_types: ['Final'] }, '')).toBe(false);
  });

  it('shortens Midterm only on multi-exam sheets', () => {
    expect(formatExamTypesShort({ exam_types: ['Midterm', 'Final'] })).toBe('Mid + Final');
    expect(formatExamTypesShort({ exam_types: ['Midterm', 'Final', 'Quiz'] })).toBe('Mid + Final + Quiz');
    expect(formatExamTypesShort({ exam_types: ['Midterm'] })).toBe('Midterm');
    expect(formatExamTypesShort({})).toBe('');
  });
});

describe('getErrorMessage', () => {
  it('reads both error response shapes and always returns a string', () => {
    expect(getErrorMessage({ response: { data: { error: 'Flat' } } })).toBe('Flat');
    expect(getErrorMessage({ response: { data: { error: { message: 'Nested', type: 'x' } } } })).toBe('Nested');
    expect(getErrorMessage({ response: { data: { message: 'Message' } } })).toBe('Message');
    expect(getErrorMessage({ response: { data: { error: { code: 1 } } } }, 'Fallback')).toBe('Fallback');
    expect(getErrorMessage(new Error('network'))).toBe('Something went wrong');
  });
});

describe('pickUpcomingExams', () => {
  const now = new Date('2026-09-27T00:00:00Z');
  const exam = (courseCode, examType, day, relevance) => ({ courseCode, examType, examDate: `2026-10-${day}T09:00:00Z`, relevance });

  it("keeps the user's programs first and the type of the first exam", () => {
    const picked = pickUpcomingExams([
      exam('OTHER', 'Final', '01', 0),
      exam('GENERAL', 'Midterm', '05', 1),
      exam('MINE', 'Midterm', '10', 2),
      exam('OTHER2', 'Midterm', '02', 0),
    ], now);
    expect(picked.map(e => e.courseCode)).toEqual(['MINE', 'GENERAL', 'OTHER2']);
  });

  it('falls back to date order without relevance, and drops past exams', () => {
    const picked = pickUpcomingExams([
      exam('LATER', 'Quiz', '20'),
      { courseCode: 'PAST', examType: 'Quiz', examDate: '2026-09-01T00:00:00Z' },
      exam('SOON', 'Quiz', '03'),
    ], now);
    expect(picked.map(e => e.courseCode)).toEqual(['SOON', 'LATER']);
    expect(pickUpcomingExams([], now)).toEqual([]);
  });
});
