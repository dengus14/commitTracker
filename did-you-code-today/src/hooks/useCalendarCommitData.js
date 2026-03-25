import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFetchGitHub } from '../utils/githubApi';

export const useCalendarCommitData = () => {
  const { user, token } = useAuth();
  const [commitCounts, setCommitCounts] = useState(new Map());
  const [loading, setLoading] = useState(false);

  const fetchCommitDatesForMonth = useCallback(async (year, month) => {
    if (!user || !user.username) return;

    const fetchGitHub = createFetchGitHub(user, token);

    setLoading(true);

    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const startISO = startDate.toISOString();
      const endISO = new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const reposResponse = await fetchGitHub(`users/${user.username}/repos?sort=updated&per_page=10`);

      if (!reposResponse.ok) {
        console.warn('Could not fetch repositories:', reposResponse.status);
        return;
      }

      const repos = await reposResponse.json();
      const counts = new Map();

      for (const repo of repos.slice(0, 5)) {
        try {
          const commitsResponse = await fetchGitHub(
            `repos/${repo.full_name}/commits?author=${user.username}&since=${startISO}&until=${endISO}&per_page=100`
          );

          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();

            commits.forEach(commit => {
              const d = new Date(commit.commit.author.date);
              const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
              counts.set(key, (counts.get(key) || 0) + 1);
            });
          }
        } catch (repoError) {
          console.warn(`Could not fetch commits for ${repo.full_name}:`, repoError);
        }
      }

      setCommitCounts(counts);
    } catch (error) {
      console.error('Error fetching commit dates:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const getCommitCount = useCallback((date) => {
    return commitCounts.get(date.toDateString()) || 0;
  }, [commitCounts]);

  return {
    commitCounts,
    loading,
    fetchCommitDatesForMonth,
    getCommitCount,
  };
};
