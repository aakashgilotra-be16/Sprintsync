/**
 * Firebase Configuration
 * Handles initialization and exports Firebase services
 * Supports environment-based database switching (dev vs prod)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

/**
 * Determine environment: use VITE_ENV or check if running locally
 * VITE_ENV should be set in .env files:
 * - .env.local (production)
 * - .env.local.dev (development - for local testing)
 */
const getEnvironment = (): 'development' | 'production' => {
  const envMode = import.meta.env.VITE_ENV || 'production';
  return (envMode as 'development' | 'production') || 'production';
};

const ENVIRONMENT = getEnvironment();
const IS_DEVELOPMENT = ENVIRONMENT === 'development';

/**
 * Validate required Firebase environment variables
 * All credentials must be provided at build/runtime
 */
const validateEnv = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key as keyof ImportMetaEnv]
  );

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};

// Validate on import
if (typeof window !== 'undefined') {
  validateEnv();
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log environment info for debugging (only in dev)
if (IS_DEVELOPMENT && typeof window !== 'undefined') {
  console.log(
    `🔧 Running in ${ENVIRONMENT} mode - Using Firebase Project: ${firebaseConfig.projectId}`
  );
}

const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export {
  auth,
  db,
  onAuthStateChanged,
  signInAnonymously,
  type User,
  type Auth,
  type Firestore,
  ENVIRONMENT,
  IS_DEVELOPMENT,
};
