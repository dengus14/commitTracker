import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useStreakData = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false);

  const fetchGitHub = async (path) => {
    try {
      if (user && user.hasToken && token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/github/${path}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

  const buildCommitDateMap = async (username, repos) => {
    const commitDatesSet = new Set();
    
    const reposToCheck = repos.slice(0, 10);
    
    for (const repo of reposToCheck) {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const since = sixMonthsAgo.toISOString();
        
        console.log(`Fetching commits for ${repo.full_name} since ${since}`);
        
        const commitsResponse = await fetchGitHub(
          `repos/${repo.full_name}/commits?author=${username}&since=${since}&per_page=100`
        );
        
        if (commitsResponse.status === 403) {
          console.warn('Rate limit hit, stopping commit fetch');
          break; 
        }
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          
          commits.forEach(commit => {
            const commitDate = new Date(commit.commit.author.date);
            const localDateString = commitDate.getFullYear() + '-' + 
              String(commitDate.getMonth() + 1).padStart(2, '0') + '-' + 
              String(commitDate.getDate()).padStart(2, '0');
            
            commitDatesSet.add(localDateString);
          });
          
          console.log(`Found ${commits.length} commits in ${repo.name}`);
        } else {
          console.warn(`Could not fetch commits for ${repo.full_name}: ${commitsResponse.status}`);
        }
        
      } catch (repoError) {
        console.warn(`Error processing ${repo.full_name}:`, repoError);
      }
    }
    
    console.log(`Total unique commit dates found: ${commitDatesSet.size}`);
    return commitDatesSet;
  };

  const calculateStreaksFromDates = (commitDatesSet) => {
    if (commitDatesSet.size === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakDates: []
      };
    }

    const sortedDates = Array.from(commitDatesSet).sort().reverse();
    console.log('Sorted commit dates (newest first):', sortedDates.slice(0, 10)); 

    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    console.log('Today is:', todayString);

    let currentStreak = 0;
    let currentStreakDates = [];
    let currentDate = new Date(today);
    
    while (true) {
      const dateString = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0');
      
      if (commitDatesSet.has(dateString)) {
        currentStreak++;
        currentStreakDates.unshift(dateString); 
        
        
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        
        break;
      }
      
      
      if (currentStreak >= 365) {
        console.warn('Current streak exceeds 365 days, stopping calculation');
        break;
      }
    }

    
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate = null;

    const chronologicalDates = Array.from(commitDatesSet).sort();
    
    for (const dateString of chronologicalDates) {
      const currentDate = new Date(dateString + 'T00:00:00');
      
      if (previousDate) {
       
        const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          
          tempStreak++;
        } else {
          
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1; 
        }
      } else {
        
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    }
    
   
    longestStreak = Math.max(longestStreak, tempStreak);

    console.log(`Calculated streaks - Current: ${currentStreak}, Longest: ${longestStreak}`);
    
    return {
      currentStreak,
      longestStreak,
      streakDates: currentStreakDates
    };
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
