import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useStreakData = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false);

  const calculateStreak = useCallback(async (username) => {
    if (!username) {
      setError('Username is required');
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    setStreakData(null);

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/streak/${username}`, {
        headers
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.requiresAuth) {
          setError('Please login with GitHub for streak calculation');
        } else {
          throw new Error(result.message || 'Failed to calculate streak');
        }
        isLoadingRef.current = false;
        setLoading(false);
        return;
      }

      setStreakData(result.data);
    } catch (error) {
      console.error('Streak calculation error:', error);
      setError(error.message);
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, []);

  const refreshStreak = useCallback(async (username) => {
    if (!username || !user || !token) {
      setError('Authentication required for refresh');
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/streak/${username}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to refresh streak');
      }

      setStreakData(result.data);
    } catch (error) {
      console.error('Streak refresh error:', error);
      setError(error.message);
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, [user]);

  return {
    loading,
    streakData,
    error,
    calculateStreak,
    refreshStreak
  };
};
