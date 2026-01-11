/**
 * Type definitions for SprintSync
 * Centralized TypeScript interfaces
 */

export interface User {
  uid: string;
  email?: string;
}

export interface Person {
  id: string;
  serial: string;
  name: string;
  dept: 'Dev' | 'QA' | 'PM';
}

export interface Sprint {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;
  capacity?: number;
  devCountAtCreation?: number;
}

export interface Leave {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface AppData {
  people: Person[];
  sprints: Sprint[];
  leaves: Leave[];
  holidays: Holiday[];
}

export interface LeaveFormData {
  name: string;
  start: string;
  end: string;
}

export interface AIResponse {
  type: 'risk' | 'handover';
  title: string;
  content: string;
}

export interface ParsedLeaveData {
  name: string;
  start: string;
  end: string;
  matchType: 'exact' | 'suggested' | 'none';
  suggestion?: string;
  workingDays?: number;
}

export type TabType = 'user' | 'calendar' | 'admin';
