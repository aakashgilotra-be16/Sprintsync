/**
 * Sprint Capacity Sidebar Component
 * Shows all sprints with total team capacity and individual dev breakdown
 */

import React, { useState } from 'react';
import { ChevronDown, Users, TrendingUp } from 'lucide-react';
import { formatDate, getWorkingDaysCount, getOverlapWorkingDays } from '../utils/dateUtils';
import type { AppData, Sprint } from '../types/index';

interface SprintCapacitySidebarProps {
  data: AppData;
  onSelectSprint: (sprint: Sprint) => void;
}

interface SprintCapacityData {
  sprint: Sprint;
  totalCapacity: number;
  totalAvailable: number;
  utilization: number;
}

export const SprintCapacitySidebar: React.FC<SprintCapacitySidebarProps> = ({
  data,
  onSelectSprint,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate capacity for each sprint
  const sprintCapacities = data.sprints.map((sprint): SprintCapacityData => {
    const workingDays = getWorkingDaysCount(sprint.start, sprint.end, data.holidays);
    const devCount = data.people.filter((p) => p.dept?.toLowerCase() === 'dev').length;
    const totalCapacity = devCount * workingDays * 8; // 8 hours per day

    // Calculate capacity lost to leaves
    let totalLeaveHours = 0;
    data.leaves.forEach((leave) => {
      const dev = data.people.find((p) => p.name === leave.name);
      if (dev?.dept?.toLowerCase() === 'dev') {
        const overlapDays = getOverlapWorkingDays(
          leave.start,
          leave.end,
          sprint.start,
          sprint.end,
          data.holidays
        );
        totalLeaveHours += overlapDays * 8;
      }
    });

    const totalAvailable = totalCapacity - totalLeaveHours;
    const utilization = totalCapacity > 0 ? ((totalCapacity - totalAvailable) / totalCapacity) * 100 : 0;

    return {
      sprint,
      totalCapacity,
      totalAvailable,
      utilization,
    };
  });

  const getCapacityColor = (utilization: number): string => {
    if (utilization > 30) return 'bg-red-100 border-red-300';
    if (utilization > 15) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getCapacityTextColor = (utilization: number): string => {
    if (utilization > 30) return 'text-red-700';
    if (utilization > 15) return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <>
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-[#DFE1E6] transition-all duration-300 ${isExpanded ? 'w-72' : 'w-16'} z-40 overflow-y-auto custom-scrollbar-thin`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-4 bg-white border border-[#DFE1E6] rounded-full p-1 hover:bg-[#F4F5F7] transition-all"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#0052CC]" />
              <h3 className="font-black text-sm text-[#172B4D] uppercase tracking-widest">
                Sprint Capacity
              </h3>
            </div>

            <div className="space-y-3">
              {sprintCapacities.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">No sprints created yet</p>
              ) : (
                sprintCapacities.map((capacity) => (
                  <button
                    key={capacity.sprint.id}
                    onClick={() => onSelectSprint(capacity.sprint)}
                    className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-md ${getCapacityColor(capacity.utilization)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-xs text-[#172B4D]">
                          {capacity.sprint.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {formatDate(capacity.sprint.start)}
                        </p>
                      </div>
                      <Users size={14} className="text-[#6B778C]" />
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-[#6B778C] uppercase">
                            Total
                          </span>
                          <span className={`text-[10px] font-black ${getCapacityTextColor(capacity.utilization)}`}>
                            {capacity.totalAvailable}h / {capacity.totalCapacity}h
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              capacity.utilization > 30
                                ? 'bg-red-500'
                                : capacity.utilization > 15
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(capacity.utilization, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-[9px] text-gray-600 pt-1">
                        <p>
                          <strong>Usage:</strong> {capacity.utilization.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <p className="text-[9px] text-[#4C9AFF] font-bold mt-2 hover:underline">
                      View Details →
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {!isExpanded && (
          <div className="p-2 space-y-2 mt-4">
            {sprintCapacities.map((capacity) => (
              <button
                key={capacity.sprint.id}
                onClick={() => {
                  onSelectSprint(capacity.sprint);
                  setIsExpanded(true);
                }}
                title={`${capacity.sprint.name}: ${capacity.totalAvailable}h available`}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all hover:shadow-md ${getCapacityColor(capacity.utilization)}`}
              >
                <span className={getCapacityTextColor(capacity.utilization)}>
                  {capacity.utilization.toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
