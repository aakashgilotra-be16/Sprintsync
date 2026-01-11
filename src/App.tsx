/**
 * App.tsx - Main Component
 * Modern React 19 with TypeScript, Zustand, React Query
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';
import { useAuth, useFirebaseData, useLeaveImpacts } from './hooks/index';
import { useAppStore } from './store/appStore';
import {
  AIResponseModal,
  AdminView,
  UserView,
  CalendarView,
  ChatBot,
} from './components/index';
import { callGemini } from './services/aiService';
import {
  getWorkingDaysCount,
} from './utils/dateUtils';
import './index.css';
import type { Sprint } from './types/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const {
    people,
    sprints,
    leaves,
    holidays,
    addLeave,
    addPerson,
    addSprint,
    addHoliday,
    deleteItem,
  } = useFirebaseData();

  const {
    activeTab,
    setActiveTab,
    formLeave,
    setFormLeave,
    aiResult,
    setAiResult,
    aiLoading,
    setAiLoading,
    error,
    setError,
    isXlsxLoading,
    setIsXlsxLoading,
    sprintNameInput,
    setSprintNameInput,
    currentCalMonth,
    setCurrentCalMonth,
  } = useAppStore();

  // Calculate dev count
  const devCount = React.useMemo(
    () => people.filter((p) => p.dept?.toLowerCase() === 'dev').length,
    [people]
  );

  // Calculate leave impacts
  const impacts = useLeaveImpacts(formLeave, sprints, holidays);

  // AI Analysis
  const handleAnalyzeSprintRisk = async (s: Sprint) => {
    setAiLoading('risk');
    const wDays = getWorkingDaysCount(s.start, s.end, holidays);
    const relatedLeaves = leaves.filter(
      (l) => getWorkingDaysCount(l.start, l.end, holidays) > 0
    );
    const prompt = `Analyze Sprint: ${s.name}. Stats: ${wDays} working days, ${devCount} devs. Leaves: ${JSON.stringify(relatedLeaves)}. Suggest risk mitigation tips.`;
    const res = await callGemini(prompt, 'Senior Project Manager.');
    setAiResult({
      type: 'risk',
      title: `${s.name} Analysis`,
      content: String(res),
    });
    setAiLoading(null);
  };

  const handleGenerateHandover = async () => {
    setAiLoading('handover');
    const res = await callGemini(
      `Draft handover note for ${formLeave.name}, from ${formLeave.start} to ${formLeave.end}.`,
      'Agile assistant.'
    );
    setAiResult({
      type: 'handover',
      title: 'Handover Note Draft',
      content: String(res),
    });
    setAiLoading(null);
  };

  // Excel file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;

    setIsXlsxLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb = window.XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = window.XLSX.utils.sheet_to_json(ws);

        const batchRequests = [];
        for (const row of rawData) {
          const findVal = (keys: string[]) => {
            const k = Object.keys(row).find((k) =>
              keys.includes(k.trim().toLowerCase())
            );
            return k ? (row as Record<string, unknown>)[k] : null;
          };
          const deptValue = String(
            findVal([
              'department',
              'dept',
              'role',
              'team',
              'division',
            ]) || 'Dev'
          ) as 'Dev' | 'QA' | 'PM';
          batchRequests.push(
            addPerson({
              serial: String(findVal(['#', 'serial', 'no', 'id']) || 'N/A'),
              name: String(findVal(['name', 'full name']) || 'Unknown'),
              dept: deptValue,
            })
          );
        }
        await Promise.all(batchRequests);
      } catch {
        setError(
          'Excel Parsing Failed. Verify column headers (#, Name, Dept).'
        );
      } finally {
        setIsXlsxLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Sprint form submission
  const handleAddSprint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addSprint({
      name: sprintNameInput || (fd.get('name') as string),
      start: fd.get('start') as string,
      end: fd.get('end') as string,
      devCountAtCreation: devCount,
    });
    setSprintNameInput('');
    e.currentTarget.reset();
  };

  // Load XLSX library
  React.useEffect(() => {
    if (window.XLSX) return;
    const s = document.createElement('script');
    s.src =
      'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <Loader2 className="animate-spin text-[#0052CC]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] font-sans pb-10 antialiased selection:bg-[#0052CC] selection:text-white">
      <AIResponseModal aiResult={aiResult} setAiResult={setAiResult} />
      <ChatBot onAddLeave={addLeave} people={people} sprints={sprints} />

      {error && (
        <div className="fixed bottom-6 right-20 z-[200] bg-[#DE350B] text-white px-4 py-3 rounded shadow-xl flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <AlertTriangle size={18} />
          <span className="text-xs font-bold">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 font-black cursor-pointer"
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      <nav className="bg-white border-b border-[#DFE1E6] sticky top-0 z-50 h-16 flex items-center px-8 justify-between shadow-sm">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('user')}
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 bg-[#0052CC] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Clock size={20} strokeWidth={4} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-[#172B4D]">
            Sprint<span className="text-[#0052CC]">Sync</span>
          </h1>
        </div>

        <div className="flex bg-[#EBECF0] p-1.5 rounded-xl border border-[#DFE1E6]">
          {(['user', 'calendar', 'admin'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === t
                  ? 'bg-white text-[#0052CC] shadow-md'
                  : 'text-[#6B778C] hover:text-[#172B4D]'
              }`}
            >
              {t === 'user' ? 'Registry' : t === 'calendar' ? 'Calendar' : 'Admin'}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-10">
        {activeTab === 'admin' && (
          <AdminView
            data={{ people, sprints, leaves, holidays }}
            devCount={devCount}
            sprintNameInput={sprintNameInput}
            setSprintNameInput={setSprintNameInput}
            aiLoading={aiLoading}
            setAiLoading={setAiLoading}
            isXlsxLoading={isXlsxLoading}
            handleFileUpload={handleFileUpload}
            analyzeSprintRisk={handleAnalyzeSprintRisk}
            setError={setError}
            addPerson={addPerson}
            addHoliday={addHoliday}
            addSprint={handleAddSprint}
            deleteDocItem={deleteItem}
            callGemini={callGemini}
          />
        )}
        {activeTab === 'user' && (
          <UserView
            data={{ people, sprints, leaves, holidays }}
            formLeave={formLeave}
            setFormLeave={setFormLeave}
            addLeave={addLeave}
            impacts={impacts}
            generateHandover={handleGenerateHandover}
            deleteDocItem={deleteItem}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            currentCalMonth={currentCalMonth}
            setCurrentCalMonth={setCurrentCalMonth}
            data={{ people, sprints, leaves, holidays }}
          />
        )}
      </main>

      <footer className="text-center py-8 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black opacity-30">
        Cloud Synchronized Agile Capacity Intelligence
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
