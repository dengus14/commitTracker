import { useState, useEffect } from 'react';

const GITHUB_API = 'https://api.github.com';

export const usePublicProfile = (username) => {
  const [profile, setProfile]     = useState(null);
  const [repos, setRepos]         = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [userRes, reposRes, eventsRes] = await Promise.all([
          fetch(`${GITHUB_API}/users/${username}`),
          fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=6`),
          fetch(`${GITHUB_API}/users/${username}/events/public?per_page=30`),
        ]);

        if (!userRes.ok) {
          if (userRes.status === 404) setError('User not found.');
          else if (userRes.status === 403) setError('GitHub API rate limit reached. Try again later.');
          else setError('Could not load profile.');
          setLoading(false);
          return;
        }

        const [userData, reposData, eventsData] = await Promise.all([
          userRes.json(),
          reposRes.ok ? reposRes.json() : [],
          eventsRes.ok ? eventsRes.json() : [],
        ]);

        setProfile(userData);
        setRepos(Array.isArray(reposData) ? reposData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  return { profile, repos, events, loading, error };
};
