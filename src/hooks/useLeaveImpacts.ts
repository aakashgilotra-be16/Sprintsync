/**
 * useLeaveImpacts Hook
 * Calculates sprint impacts from leave entries
 */

import { useMemo } from 'react';
import { getOverlapWorkingDays } from '../utils/dateUtils';
import type { Sprint, Holiday, LeaveFormData } from '../types/index';

export const useLeaveImpacts = (
  formLeave: LeaveFormData,
  sprints: Sprint[],
  holidays: Holiday[]
): Sprint[] => {
  return useMemo(() => {
    if (!formLeave.start || !formLeave.end) return [];

    return sprints.filter(
      (s) =>
        getOverlapWorkingDays(
          formLeave.start,
          formLeave.end,
          s.start,
          s.end,
          holidays
        ) > 0
    );
  }, [formLeave.start, formLeave.end, sprints, holidays]);
};
