import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useStreakData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false);

  const fetchGitHub = async (path) => {
    try {
      if (user && user.hasToken) {
        const response = await fetch(`http://localhost:5001/api/github/${path}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          return { 
            ok: true, 
            json: async () => result.data, 
            status: response.status 
          };
        } else {
          const errorResult = await response.json();
          return { 
            ok: false, 
            status: response.status, 
            json: async () => errorResult 
          };
        }
      } else {
        const response = await fetch(`https://api.github.com/${path}`);
        return { 
          ok: response.ok, 
          json: () => response.json(), 
          status: response.status 
        };
      }
    } catch (networkError) {
      console.error('Network error in fetchGitHub:', networkError);
      return {
        ok: false,
        status: 0,
        json: async () => ({ message: 'Network error: ' + networkError.message })
      };
    }
  };

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
      console.log('Starting streak calculation for:', username);
      
      const reposResponse = await fetchGitHub(`users/${username}/repos?sort=updated&per_page=20`);
      
      if (!reposResponse.ok) {
        if (reposResponse.status === 404) {
          throw new Error('User not found');
        }
        if (reposResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }
      
      const repos = await reposResponse.json();
      
      if (!Array.isArray(repos) || repos.length === 0) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastCommitDate: null,
          streakDates: []
        });
        return;
      }

      const commitDates = await buildCommitDateMap(username, repos);
      
      const { currentStreak, longestStreak, streakDates } = calculateStreaksFromDates(commitDates);
      
      const lastCommitDate = commitDates.size > 0 ? 
        new Date(Math.max(...Array.from(commitDates.keys()).map(d => new Date(d).getTime()))) : 
        null;

      setStreakData({
        currentStreak,
        longestStreak,
        lastCommitDate,
        streakDates
      });

    } catch (error) {
      console.error('Streak calculation error:', error);
      setError(error.message);
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, []);

  return {
    loading,
    streakData,
    error,
    calculateStreak
  };
};
