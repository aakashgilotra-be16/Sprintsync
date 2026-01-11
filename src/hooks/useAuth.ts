/**
 * useAuth Hook
 * Manages Firebase authentication state
 */

import { useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from '@/config/firebase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
