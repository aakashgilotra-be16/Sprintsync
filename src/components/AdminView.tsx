import React from 'react';
import {
  Users,
  Trash2,
  Upload,
  Tent,
  Settings,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { AppData, Sprint, Person } from '../types/index';
import { formatDate, getWorkingDaysCount, getOverlapWorkingDays } from '../utils/dateUtils';

interface AdminViewProps {
  data: AppData;
  devCount: number;
  sprintNameInput: string;
  setSprintNameInput: (name: string) => void;
  aiLoading: string | null;
  setAiLoading: (state: string | null) => void;
  isXlsxLoading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analyzeSprintRisk: (sprint: Sprint) => void;
  setError: (error: string | null) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  addHoliday: (holiday: { name: string; date: string }) => void;
  addSprint: (e: React.FormEvent<HTMLFormElement>) => void;
  deleteDocItem: (collection: string, id: string) => void;
  callGemini?: (prompt: string, systemInstruction: string) => Promise<string>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  data,
  devCount,
  sprintNameInput,
  setSprintNameInput,
  aiLoading,
  setAiLoading,
  isXlsxLoading,
  handleFileUpload,
  analyzeSprintRisk,
  addPerson,
  addHoliday,
  addSprint,
  deleteDocItem,
  callGemini,
}) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* TEAM ROSTER */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
            <Users size={20} className="text-[#0052CC]" /> Team Roster
          </h2>
          <label className="cursor-pointer bg-[#F4F5F7] text-[#172B4D] px-4 py-2 rounded border border-[#DFE1E6] font-bold text-[10px] flex items-center gap-2 hover:bg-[#EBECF0] transition shadow-sm">
            {isXlsxLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Upload size={12} />
            )}
            IMPORT EXCEL
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#DFE1E6] shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addPerson({
                serial: fd.get('serial') as string,
                name: fd.get('name') as string,
                dept: (fd.get('dept') || 'Dev') as 'Dev' | 'QA' | 'PM',
              });
              e.currentTarget.reset();
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block">
                #
              </label>
              <input
                required
                name="serial"
                placeholder="101"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block">
                Name
              </label>
              <input
                required
                name="name"
                placeholder="John Doe"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block">
                Dept
              </label>
              <select
                name="dept"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:bg-white"
              >
                <option value="Dev">Dev</option>
                <option value="QA">QA</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#172B4D] text-white h-[38px] px-4 rounded font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
            >
              Add Member
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F5F7] border-b">
              <tr>
                <th className="p-4 font-bold text-[#6B778C] text-[10px]">#</th>
                <th className="p-4 font-bold text-[#6B778C] text-[10px]">Name</th>
                <th className="p-4 font-bold text-[#6B778C] text-[10px]">Dept</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {data.people.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-[#FAFBFC] transition-colors"
                >
                  <td className="p-4 font-mono text-gray-400">{p.serial}</td>
                  <td className="p-4 font-bold text-[#172B4D]">{p.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.dept?.toLowerCase() === 'dev'
                          ? 'bg-[#E3FCEF] text-[#006644]'
                          : 'bg-[#EBECF0] text-[#6B778C]'
                      }`}
                    >
                      {p.dept}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteDocItem('people', p.id)}
                      className="text-[#DE350B] p-1 transition-colors hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HOLIDAYS */}
      <section className="space-y-4 pt-8 border-t border-[#DFE1E6]">
        <h2 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
          <Tent size={20} className="text-[#DE350B]" /> Public Holidays
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#DFE1E6] shadow-sm h-fit">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                addHoliday({
                  name: fd.get('hname') as string,
                  date: fd.get('hdate') as string,
                });
                e.currentTarget.reset();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block">
                  Holiday Name
                </label>
                <input
                  required
                  name="hname"
                  placeholder="e.g. Christmas"
                  className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:ring-2 focus:ring-[#DE350B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block">
                  Date
                </label>
                <input
                  required
                  name="hdate"
                  type="date"
                  className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:ring-2 focus:ring-[#DE350B]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#DE350B] text-white py-2 rounded font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all"
              >
                Register Holiday
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-sm overflow-hidden h-fit">
            <div className="p-4 bg-[#F4F5F7] border-b text-[10px] font-black text-[#6B778C] uppercase tracking-widest">
              Registered Holidays
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar-thin">
              {data.holidays
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-[#FAFBFC]"
                  >
                    <div className="text-xs">
                      <p className="font-bold text-[#172B4D]">{h.name}</p>
                      <p className="text-[#6B778C]">{formatDate(h.date)}</p>
                    </div>
                    <button
                      onClick={() => deleteDocItem('holidays', h.id)}
                      className="text-[#DE350B] p-1 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              {data.holidays.length === 0 && (
                <p className="p-6 text-center text-gray-400 italic text-xs">
                  No holidays added.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SPRINTS */}
      <section className="space-y-4 pt-8 border-t border-[#DFE1E6]">
        <h2 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
          <Settings size={20} className="text-[#0052CC]" /> Sprint Hub & Capacity
        </h2>
        <div className="bg-white p-6 rounded-xl border border-[#DFE1E6] shadow-sm">
          <form onSubmit={addSprint} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
                Sprint Name
              </label>
              <input
                required
                value={sprintNameInput}
                onChange={(e) => setSprintNameInput(e.target.value)}
                name="name"
                placeholder="Scrum-25"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF]"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!callGemini) return;
                  setAiLoading('naming');
                  const res = await callGemini('Short cool sprint name.', 'PM Assistant');
                  setSprintNameInput(res.replace(/"/g, '').trim());
                  setAiLoading(null);
                }}
                className="absolute right-2 top-7 text-[#4C9AFF] hover:text-[#0052CC] transition"
              >
                {aiLoading === 'naming' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
              </button>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
                Start Date
              </label>
              <input
                required
                name="start"
                type="date"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
                End Date
              </label>
              <input
                required
                name="end"
                type="date"
                className="w-full p-2 bg-[#FAFBFC] border border-[#DFE1E6] rounded text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0052CC] text-white h-[38px] rounded font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
            >
              Create Sprint
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F5F7] border-b">
              <tr>
                <th className="p-4 font-bold text-[#6B778C] text-[10px]">Sprint</th>
                <th className="p-4 font-bold text-[#6B778C] text-[10px]">Duration</th>
                <th className="p-4 font-bold text-[#6B778C] text-[10px] text-center">Devs</th>
                <th className="p-4 font-bold text-[#6B778C] text-[10px] text-center">Base</th>
                <th className="p-4 font-bold text-[#DE350B] text-[10px] text-center">Leaves</th>
                <th className="p-4 font-bold text-[#006644] text-[10px] text-center">Net Cap</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {data.sprints.map((s) => {
                const workingDays = getWorkingDaysCount(s.start, s.end, data.holidays);
                const dc = s.devCountAtCreation || devCount;
                const base = dc * 8 * workingDays;
                let loss = 0;
                data.leaves.forEach((l) => {
                  const personFound = data.people.find((p) => p.name === l.name);
                  if (personFound?.dept?.toLowerCase() === 'dev') {
                    loss += getOverlapWorkingDays(l.start, l.end, s.start, s.end, data.holidays) * 8;
                  }
                });
                const net = base - loss;
                return (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-[#FAFBFC] transition-colors"
                  >
                    <td className="p-4 font-bold text-[#0052CC]">{s.name}</td>
                    <td className="p-4 text-xs">
                      {formatDate(s.start)} - {formatDate(s.end)}{' '}
                      <span className="text-gray-400">({workingDays} working days)</span>
                    </td>
                    <td className="p-4 text-center text-[#6B778C]">{dc}</td>
                    <td className="p-4 text-center font-bold">{base}h</td>
                    <td className="p-4 text-center font-bold text-[#DE350B]">-{loss}h</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          net < base * 0.7
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {net}h
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => analyzeSprintRisk(s)}
                        className="p-1.5 bg-[#FFF0B3] rounded transition hover:bg-[#FFE380]"
                      >
                        <AlertTriangle size={14} />
                      </button>
                      <button
                        onClick={() => deleteDocItem('sprints', s.id)}
                        className="p-1.5 text-[#DE350B] transition hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
