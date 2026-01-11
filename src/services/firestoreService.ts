/**
 * Firestore Service
 * Handles database CRUD operations
 */

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Person, Sprint, Leave, Holiday } from '../types/index';

const APP_ID = 'sprintsync-pro-v1';
const BASE_PATH = 'artifacts';

const getCollectionRef = (collectionName: string) => {
  return collection(
    db,
    BASE_PATH,
    APP_ID,
    'public',
    'data',
    collectionName
  );
};

// Queries
export const fetchPeople = async (): Promise<Person[]> => {
  const docs = await getDocs(getCollectionRef('people'));
  return docs.docs.map((d) => ({ ...d.data(), id: d.id } as Person));
};

export const fetchSprints = async (): Promise<Sprint[]> => {
  const docs = await getDocs(getCollectionRef('sprints'));
  return docs.docs
    .map((d) => ({ ...d.data(), id: d.id } as Sprint))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};

export const fetchLeaves = async (): Promise<Leave[]> => {
  const docs = await getDocs(getCollectionRef('leaves'));
  return docs.docs.map((d) => ({ ...d.data(), id: d.id } as Leave));
};

export const fetchHolidays = async (): Promise<Holiday[]> => {
  const docs = await getDocs(getCollectionRef('holidays'));
  return docs.docs.map((d) => ({ ...d.data(), id: d.id } as Holiday));
};

// Subscriptions
export const subscribeToPeople = (
  callback: (people: Person[]) => void,
  errorCallback: (error: Error) => void
) => {
  return onSnapshot(
    getCollectionRef('people'),
    (snapshot) =>
      callback(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Person))
      ),
    errorCallback
  );
};

export const subscribeToSprints = (
  callback: (sprints: Sprint[]) => void,
  errorCallback?: (error: Error) => void
) => {
  return onSnapshot(
    getCollectionRef('sprints'),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id } as Sprint))
          .sort(
            (a, b) =>
              new Date(a.start).getTime() - new Date(b.start).getTime()
          )
      ),
    errorCallback
  );
};

export const subscribeToLeaves = (
  callback: (leaves: Leave[]) => void,
  errorCallback?: (error: Error) => void
) => {
  return onSnapshot(
    getCollectionRef('leaves'),
    (snapshot) =>
      callback(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Leave))
      ),
    errorCallback
  );
};

export const subscribeToHolidays = (
  callback: (holidays: Holiday[]) => void,
  errorCallback?: (error: Error) => void
) => {
  return onSnapshot(
    getCollectionRef('holidays'),
    (snapshot) =>
      callback(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Holiday))
      ),
    errorCallback
  );
};

// Mutations
export const addPersonDoc = async (person: Omit<Person, 'id'>) => {
  return addDoc(getCollectionRef('people'), person);
};

export const addSprintDoc = async (sprint: Omit<Sprint, 'id'>) => {
  return addDoc(getCollectionRef('sprints'), sprint);
};

export const addLeaveDoc = async (leave: Omit<Leave, 'id'>) => {
  return addDoc(getCollectionRef('leaves'), leave);
};

export const addHolidayDoc = async (holiday: Omit<Holiday, 'id'>) => {
  return addDoc(getCollectionRef('holidays'), holiday);
};

export const deleteDocItem = async (
  collectionName: string,
  id: string
): Promise<void> => {
  return deleteDoc(
    doc(db, BASE_PATH, APP_ID, 'public', 'data', collectionName, id)
  );
};
