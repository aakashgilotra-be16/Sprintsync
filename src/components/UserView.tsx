import React from 'react';
import { TrendingDown, Trash2 } from 'lucide-react';
import type { AppData, LeaveFormData, Sprint } from '../types/index';
import { formatDate, getOverlapWorkingDays } from '../utils/dateUtils';

interface UserViewProps {
  data: AppData;
  formLeave: LeaveFormData;
  setFormLeave: (leave: LeaveFormData) => void;
  addLeave: (leave: LeaveFormData) => void;
  impacts: Sprint[];
  generateHandover: () => void;
  deleteDocItem: (collection: string, id: string) => void;
}

export const UserView: React.FC<UserViewProps> = ({
  data,
  formLeave,
  setFormLeave,
  addLeave,
  impacts,
  generateHandover,
  deleteDocItem,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addLeave(formLeave);
    setFormLeave({ name: '', start: '', end: '' });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-[#DFE1E6] shadow-xl">
        <h2 className="text-2xl font-black text-[#172B4D] mb-8 tracking-tight">
          Log Absence
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
              Select Team Member
            </label>
            <select
              value={formLeave.name}
              onChange={(e) => setFormLeave({ ...formLeave, name: e.target.value })}
              required
              className="w-full p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF] transition"
            >
              <option value="">Select your name...</option>
              {data.people.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.dept})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
                Start Date
              </label>
              <input
                value={formLeave.start}
                onChange={(e) => setFormLeave({ ...formLeave, start: e.target.value })}
                required
                type="date"
                className="w-full p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#6B778C] uppercase mb-1 block tracking-widest">
                End Date
              </label>
              <input
                value={formLeave.end}
                onChange={(e) => setFormLeave({ ...formLeave, end: e.target.value })}
                required
                type="date"
                className="w-full p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4C9AFF]"
              />
            </div>
          </div>

          {impacts.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col gap-2">
              <div className="flex gap-2 items-center text-amber-700 font-bold text-[11px] uppercase tracking-tighter">
                <TrendingDown size={14} /> Capacity Impact Detected
              </div>
              <div className="text-[10px] font-black text-amber-800">
                {impacts.map((i) => {
                  const hrs = getOverlapWorkingDays(
                    formLeave.start,
                    formLeave.end,
                    i.start,
                    i.end,
                    data.holidays
                  ) * 8;
                  return hrs > 0 ? <span key={i.id} className="mr-3">{i.name}: -{hrs}h</span> : null;
                })}
              </div>
              <button
                type="button"
                onClick={generateHandover}
                className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-left hover:underline"
              >
                ✨ Draft Handover Note
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#0052CC] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            Submit Entry
          </button>
        </form>
      </div>

      <div className="bg-[#F4F5F7] p-4 rounded-xl border border-[#DFE1E6]">
        <h3 className="text-[10px] font-black text-[#6B778C] uppercase mb-3 tracking-widest">
          Recent Registry
        </h3>
        {data.leaves.slice(-5).reverse().map((l) => (
          <div
            key={l.id}
            className="flex justify-between items-center bg-white p-3 border border-[#DFE1E6] rounded-lg mb-2 text-xs group transition-colors hover:bg-[#FAFBFC]"
          >
            <div>
              <p className="font-bold text-[#172B4D]">{l.name}</p>
              <p className="text-[#6B778C] text-[10px]">
                {formatDate(l.start)} - {formatDate(l.end)}
              </p>
            </div>
            <button
              onClick={() => deleteDocItem('leaves', l.id)}
              className="text-[#DE350B] opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
