/**
 * Date Utility Functions
 * Handles date formatting, calculations, and conversions
 */

import type { Holiday } from '../types/index';

export const toLocalISO = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === 'undefined') return 'TBD';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    const dObj = new Date(y, m - 1, d);
    return dObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getWorkingDaysCount = (
  startStr: string,
  endStr: string,
  holidays: Holiday[] = []
): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  const holidayStrings = holidays.map((h) => h.date);
  let count = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);

  while (cur <= endNorm) {
    const day = cur.getDay();
    const curStr = toLocalISO(cur);
    const isHoliday = holidayStrings.includes(curStr);
    if (day !== 0 && day !== 6 && !isHoliday) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const getOverlapWorkingDays = (
  s1: string,
  e1: string,
  s2: string,
  e2: string,
  holidays: Holiday[] = []
): number => {
  if (!s1 || !e1 || !s2 || !e2) return 0;
  const start1 = new Date(s1);
  const end1 = new Date(e1);
  const start2 = new Date(s2);
  const end2 = new Date(e2);
  if (
    isNaN(start1.getTime()) ||
    isNaN(end1.getTime()) ||
    isNaN(start2.getTime()) ||
    isNaN(end2.getTime())
  )
    return 0;

  const oStart = start1 > start2 ? start1 : start2;
  const oEnd = end1 < end2 ? end1 : end2;

  if (oStart > oEnd) return 0;
  return getWorkingDaysCount(toLocalISO(oStart), toLocalISO(oEnd), holidays);
};
