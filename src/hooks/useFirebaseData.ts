/**
 * useFirebaseData Hook
 * React Query-based data fetching with automatic caching & refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  fetchPeople,
  fetchSprints,
  fetchLeaves,
  fetchHolidays,
  addPersonDoc,
  addSprintDoc,
  addLeaveDoc,
  addHolidayDoc,
  deleteDocItem,
} from '../services/firestoreService';
import type { Person, Sprint, Leave, Holiday } from '../types/index';

interface UseFirebaseDataReturn {
  people: Person[];
  sprints: Sprint[];
  leaves: Leave[];
  holidays: Holiday[];
  isLoading: boolean;
  isError: boolean;
  addPerson: (person: Omit<Person, 'id'>) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  addLeave: (leave: Omit<Leave, 'id'>) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  deleteItem: (collection: string, id: string) => void;
}

export const useFirebaseData = (): UseFirebaseDataReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries with proper caching
  const peopleQuery = useQuery({
    queryKey: ['people'],
    queryFn: fetchPeople,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const sprintsQuery = useQuery({
    queryKey: ['sprints'],
    queryFn: fetchSprints,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const leavesQuery = useQuery({
    queryKey: ['leaves'],
    queryFn: fetchLeaves,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const holidaysQuery = useQuery({
    queryKey: ['holidays'],
    queryFn: fetchHolidays,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Mutations with automatic cache invalidation
  const addPersonMutation = useMutation({
    mutationFn: addPersonDoc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });

  const addSprintMutation = useMutation({
    mutationFn: addSprintDoc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });

  const addLeaveMutation = useMutation({
    mutationFn: addLeaveDoc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  const addHolidayMutation = useMutation({
    mutationFn: addHolidayDoc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: ({ collection, id }: { collection: string; id: string }) =>
      deleteDocItem(collection, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });

  return {
    people: peopleQuery.data || [],
    sprints: sprintsQuery.data || [],
    leaves: leavesQuery.data || [],
    holidays: holidaysQuery.data || [],
    isLoading:
      peopleQuery.isLoading ||
      sprintsQuery.isLoading ||
      leavesQuery.isLoading ||
      holidaysQuery.isLoading,
    isError:
      peopleQuery.isError ||
      sprintsQuery.isError ||
      leavesQuery.isError ||
      holidaysQuery.isError,
    addPerson: (person) => addPersonMutation.mutate(person),
    addSprint: (sprint) => addSprintMutation.mutate(sprint),
    addLeave: (leave) => addLeaveMutation.mutate(leave),
    addHoliday: (holiday) => addHolidayMutation.mutate(holiday),
    deleteItem: (collection, id) =>
      deleteDocMutation.mutate({ collection, id }),
  };
};
