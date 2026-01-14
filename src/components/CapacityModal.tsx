/**
 * Capacity Modal Component
 * Shows individual developer capacity for a selected sprint
 */

import React from 'react';
import { X, User, AlertTriangle } from 'lucide-react';
import { formatDate, getWorkingDaysCount, getOverlapWorkingDays } from '../utils/dateUtils';
import type { AppData, Sprint } from '../types/index';

interface CapacityModalProps {
  sprint: Sprint;
  data: AppData;
  onClose: () => void;
}

interface DeveloperCapacity {
  name: string;
  baseCapacity: number;
  leaveDays: number;
  leaveHours: number;
  availableCapacity: number;
  utilization: number;
}

export const CapacityModal: React.FC<CapacityModalProps> = ({
  sprint,
  data,
  onClose,
}) => {
  // Get working days in sprint
  const workingDays = getWorkingDaysCount(sprint.start, sprint.end, data.holidays);
  const baseCapacityPerDay = 8; // hours

  // Calculate capacity for each developer
  const devCapacities: DeveloperCapacity[] = data.people
    .filter((p) => p.dept?.toLowerCase() === 'dev')
    .map((dev) => {
      const baseCapacity = workingDays * baseCapacityPerDay;

      // Find all leaves for this dev that overlap with sprint
      const devLeaves = data.leaves.filter((l) => l.name === dev.name);
      let totalLeaveHours = 0;
      let totalLeaveDays = 0;

      devLeaves.forEach((leave) => {
        const overlapDays = getOverlapWorkingDays(
          leave.start,
          leave.end,
          sprint.start,
          sprint.end,
          data.holidays
        );
        totalLeaveDays += overlapDays;
        totalLeaveHours += overlapDays * baseCapacityPerDay;
      });

      const availableCapacity = baseCapacity - totalLeaveHours;
      const utilization = baseCapacity > 0 ? (totalLeaveHours / baseCapacity) * 100 : 0;

      return {
        name: dev.name,
        baseCapacity,
        leaveDays: totalLeaveDays,
        leaveHours: totalLeaveHours,
        availableCapacity: Math.max(0, availableCapacity),
        utilization,
      };
    })
    .sort((a, b) => b.utilization - a.utilization); // Sort by utilization (highest first)

  // Calculate team totals
  const totalBaseCapacity = devCapacities.reduce((sum, dev) => sum + dev.baseCapacity, 0);
  const totalLeaveHours = devCapacities.reduce((sum, dev) => sum + dev.leaveHours, 0);
  const totalAvailableCapacity = devCapacities.reduce(
    (sum, dev) => sum + dev.availableCapacity,
    0
  );
  const teamUtilization =
    totalBaseCapacity > 0 ? (totalLeaveHours / totalBaseCapacity) * 100 : 0;

  const getCapacityStatus = (
    utilization: number
  ): { color: string; bgColor: string; label: string } => {
    if (utilization > 30) {
      return {
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        label: 'High Impact',
      };
    }
    if (utilization > 15) {
      return {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        label: 'Medium Impact',
      };
    }
    return {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      label: 'Low Impact',
    };
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">{sprint.name}</h2>
            <p className="text-sm opacity-90">
              {formatDate(sprint.start)} → {formatDate(sprint.end)} ({workingDays} working
              days)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar-thin" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Team Summary */}
          <div className="p-6 border-b border-[#DFE1E6] bg-[#F4F5F7]">
            <h3 className="font-black text-[#172B4D] uppercase tracking-widest text-sm mb-4">
              Team Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-black text-[#6B778C] uppercase mb-1">
                  Total Capacity
                </p>
                <p className="text-lg font-black text-[#0052CC]">{totalBaseCapacity}h</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B778C] uppercase mb-1">
                  Leave Hours
                </p>
                <p className="text-lg font-black text-[#DE350B]">{totalLeaveHours}h</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B778C] uppercase mb-1">
                  Available
                </p>
                <p className="text-lg font-black text-[#006644]">{totalAvailableCapacity}h</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B778C] uppercase mb-1">Usage</p>
                <p className={`text-lg font-black ${teamUtilization > 30 ? 'text-red-600' : teamUtilization > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {teamUtilization.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Team Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-[#6B778C] uppercase">
                  Capacity Utilization
                </span>
                <span className="text-[10px] text-gray-600">
                  {totalLeaveHours}h / {totalBaseCapacity}h
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    teamUtilization > 30
                      ? 'bg-red-500'
                      : teamUtilization > 15
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(teamUtilization, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Individual Developer Capacity */}
          <div className="p-6">
            <h3 className="font-black text-[#172B4D] uppercase tracking-widest text-sm mb-4">
              Individual Developer Capacity
            </h3>

            <div className="space-y-3">
              {devCapacities.length === 0 ? (
                <p className="text-center text-gray-400 italic py-8">No developers in roster</p>
              ) : (
                devCapacities.map((dev, idx) => {
                  const status = getCapacityStatus(dev.utilization);
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 transition-all ${status.bgColor} border-l-4 ${
                        dev.utilization > 30
                          ? 'border-l-red-500'
                          : dev.utilization > 15
                            ? 'border-l-yellow-500'
                            : 'border-l-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-[#6B778C]" />
                          <div>
                            <p className="font-black text-[#172B4D]">{dev.name}</p>
                            {dev.leaveDays > 0 && (
                              <p className="text-[10px] text-gray-600 mt-0.5">
                                {dev.leaveDays} day{dev.leaveDays > 1 ? 's' : ''} leave
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${status.color}`}>
                            {dev.availableCapacity}h
                          </p>
                          <p className="text-[9px] text-gray-500">
                            {dev.utilization.toFixed(1)}% away
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                        <div>
                          <span className="text-gray-600">Base:</span>
                          <p className="font-bold text-[#172B4D]">{dev.baseCapacity}h</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Leave:</span>
                          <p className="font-bold text-[#DE350B]">-{dev.leaveHours}h</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Available:</span>
                          <p className="font-bold text-[#006644]">{dev.availableCapacity}h</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            dev.utilization > 30
                              ? 'bg-red-500'
                              : dev.utilization > 15
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(dev.utilization, 100)}%` }}
                        />
                      </div>

                      {/* Status badge */}
                      {dev.utilization > 15 && (
                        <div className="flex items-center gap-1 mt-2 text-[9px] font-black">
                          <AlertTriangle size={12} className={status.color} />
                          <span className={status.color}>{status.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DFE1E6] bg-[#FAFBFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#0052CC] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 hover:bg-[#0747A6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
