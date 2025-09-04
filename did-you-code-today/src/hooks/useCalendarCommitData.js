import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useCalendarCommitData = () => {
  const { user } = useAuth();
  const [commitDates, setCommitDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchCommitDatesForMonth = useCallback(async (year, month) => {
    if (!user || !user.username) return;
    
    const fetchGitHub = async (path) => {
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
    };
    
    setLoading(true);
    
    try {
      // Get first and last day of the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month
      
      // Convert to ISO strings for GitHub API
      const startISO = startDate.toISOString();
      const endISO = new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      // Fetch user's repositories
      const reposResponse = await fetchGitHub(`users/${user.username}/repos?sort=updated&per_page=10`);
      
      if (!reposResponse.ok) {
        console.warn('Could not fetch repositories:', reposResponse.status);
        return;
      }
      
      const repos = await reposResponse.json();
      const commitDatesSet = new Set();
      
      // Check commits in top repositories
      for (const repo of repos.slice(0, 5)) {
        try {
          const commitsResponse = await fetchGitHub(
            `repos/${repo.full_name}/commits?author=${user.username}&since=${startISO}&until=${endISO}&per_page=100`
          );
          
          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            
            commits.forEach(commit => {
              const commitDate = new Date(commit.commit.author.date);
              // Get local date without time
              const localDate = new Date(commitDate.getFullYear(), commitDate.getMonth(), commitDate.getDate());
              const dateString = localDate.toDateString();
              commitDatesSet.add(dateString);
            });
          }
        } catch (repoError) {
          console.warn(`Could not fetch commits for ${repo.full_name}:`, repoError);
        }
      }
      
      setCommitDates(commitDatesSet);
    } catch (error) {
      console.error('Error fetching commit dates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const hasCommitOnDate = useCallback((date) => {
    const dateString = date.toDateString();
    return commitDates.has(dateString);
  }, [commitDates]);

  return {
    commitDates,
    loading,
    fetchCommitDatesForMonth,
    hasCommitOnDate
  };
};
