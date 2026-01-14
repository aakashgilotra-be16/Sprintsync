import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppData } from '../types/index';
import { getDaysInMonth, getFirstDayOfMonth, toLocalISO } from '../utils/dateUtils';

interface CalendarViewProps {
  currentCalMonth: Date;
  setCurrentCalMonth: (date: Date) => void;
  data: AppData;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentCalMonth,
  setCurrentCalMonth,
  data,
}) => {
  const year = currentCalMonth.getFullYear();
  const month = currentCalMonth.getMonth();
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-[#DFE1E6] overflow-hidden animate-in fade-in duration-500">
        <div className="p-6 bg-[#091E42] text-white flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-3">
            <CalendarDays size={24} />{' '}
            {currentCalMonth.toLocaleString('default', { month: 'long' })}{' '}
            <span className="opacity-40">{year}</span>
          </h2>
          <div className="flex bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setCurrentCalMonth(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-white/10 rounded transition-all active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentCalMonth(new Date())}
              className="px-4 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 rounded transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentCalMonth(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-white/10 rounded transition-all active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="p-2 grid grid-cols-7 gap-1 bg-[#EBECF0]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center py-2 text-[10px] font-black text-[#6B778C] uppercase tracking-widest"
            >
              {d}
            </div>
          ))}

          {Array(firstDay)
            .fill(null)
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-32 bg-[#F4F5F7]/50 rounded-lg border border-transparent"
              ></div>
            ))}

          {Array.from({ length: days }).map((_, i) => {
            const date = new Date(year, month, i + 1);
            const dateStr = toLocalISO(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const holiday = data.holidays.find((h) => h.date === dateStr);
            const items = data.leaves.filter(
              (l) => dateStr >= l.start && dateStr <= l.end
            );
            const today = new Date();
            const isToday = date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear();

            return (
              <div
                key={i}
                className={`h-32 p-2 border-2 rounded-xl flex flex-col ${
                  isToday
                    ? 'border-[#0052CC] bg-blue-50'
                    : isWeekend
                      ? 'border-[#DFE1E6] bg-[#F4F5F7]'
                      : 'border-[#DFE1E6] bg-white'
                } ${
                  holiday ? 'border-red-300 bg-red-50/30' : ''
                } hover:border-[#4C9AFF] transition-all group overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div
                    className={`text-[12px] font-black flex items-center justify-center ${
                      isToday
                        ? 'bg-[#0052CC] text-white w-6 h-6 rounded-full'
                        : isWeekend
                          ? 'text-gray-300'
                          : holiday
                            ? 'text-red-600'
                            : 'text-[#172B4D]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {holiday && (
                    <div
                      className="bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase leading-none shadow-sm"
                      title={holiday.name}
                    >
                      Holiday
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar-thin">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      className="text-[9px] leading-tight bg-blue-50 text-blue-800 border border-blue-100 px-1 py-0.5 rounded font-black truncate shadow-sm"
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
