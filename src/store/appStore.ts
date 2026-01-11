/**
 * Zustand Global Store
 * Centralized state management without prop drilling
 */

import { create } from 'zustand';
import type { LeaveFormData, AIResponse, TabType } from '../types/index';

interface AppStore {
  // Tab state
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Leave form state
  formLeave: LeaveFormData;
  setFormLeave: (leave: LeaveFormData) => void;
  resetFormLeave: () => void;

  // AI result modal state
  aiResult: AIResponse | null;
  setAiResult: (result: AIResponse | null) => void;

  // Loading states
  aiLoading: string | null;
  setAiLoading: (state: string | null) => void;

  isXlsxLoading: boolean;
  setIsXlsxLoading: (loading: boolean) => void;

  // Sprint naming
  sprintNameInput: string;
  setSprintNameInput: (name: string) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Calendar state
  currentCalMonth: Date;
  setCurrentCalMonth: (date: Date) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Tab state
  activeTab: 'user',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Leave form state
  formLeave: { name: '', start: '', end: '' },
  setFormLeave: (leave) => set({ formLeave: leave }),
  resetFormLeave: () => set({ formLeave: { name: '', start: '', end: '' } }),

  // AI result modal state
  aiResult: null,
  setAiResult: (result) => set({ aiResult: result }),

  // Loading states
  aiLoading: null,
  setAiLoading: (state) => set({ aiLoading: state }),

  isXlsxLoading: false,
  setIsXlsxLoading: (loading) => set({ isXlsxLoading: loading }),

  // Sprint naming
  sprintNameInput: '',
  setSprintNameInput: (name) => set({ sprintNameInput: name }),

  // Error handling
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Calendar state
  currentCalMonth: new Date(),
  setCurrentCalMonth: (date) => set({ currentCalMonth: date }),
}));
