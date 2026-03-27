import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFetchGitHub } from '../utils/githubApi';

const toLocalDateKey = (date) =>
  date.getFullYear() + '-' +
  String(date.getMonth() + 1).padStart(2, '0') + '-' +
  String(date.getDate()).padStart(2, '0');

export const useCommitChart = () => {
  const { user, token } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.username) return;

    const fetchChart = async () => {
      setLoading(true);
      const fetchGitHub = createFetchGitHub(user, token);

      try {
        // Build the 30-day skeleton first so we always render all bars
        const today = new Date();
        const skeleton = {};
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          skeleton[toLocalDateKey(d)] = 0;
        }

        const since = new Date(today);
        since.setDate(today.getDate() - 29);
        since.setHours(0, 0, 0, 0);

        const reposRes = await fetchGitHub(`user/repos?sort=updated&per_page=100&affiliation=owner`);
        if (!reposRes.ok) return;

        const repos = await reposRes.json();
        const reposToCheck = Array.isArray(repos) ? repos.slice(0, 20) : [];

        for (const repo of reposToCheck) {
          try {
            const commitsRes = await fetchGitHub(
              `repos/${repo.full_name}/commits?author=${user.username}&since=${since.toISOString()}&per_page=100`
            );
            if (!commitsRes.ok) continue;
            const commits = await commitsRes.json();
            if (!Array.isArray(commits)) continue;

            commits.forEach(commit => {
              const d = new Date(commit.commit.author.date);
              const key = toLocalDateKey(d);
              if (key in skeleton) skeleton[key] = (skeleton[key] || 0) + 1;
            });
          } catch (_) {}
        }

        const todayKey = toLocalDateKey(today);
        const result = Object.entries(skeleton).map(([dateKey, count]) => {
          const d = new Date(dateKey + 'T12:00:00');
          return {
            dateKey,
            count,
            isToday: dateKey === todayKey,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          };
        });

        setDays(result);
      } catch (err) {
        console.error('CommitChart fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [user, token]);

  return { days, loading };
};
