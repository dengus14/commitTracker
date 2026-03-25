import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFetchGitHub } from '../utils/githubApi';

export const useLanguageStats = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [languageData, setLanguageData] = useState(null);
  const [error, setError] = useState('');
  const isLoadingRef = useRef(false);

  const fetchLanguageStats = useCallback(async (username) => {
    if (!username) {
      setError('Please enter a GitHub username.');
      return;
    }

    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError('');
    setLanguageData(null);

    try {
      // Use cached backend endpoint when authenticated
      if (user && user.hasToken && token) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/languages/${username}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
          const result = await response.json();
          setLanguageData(result.data);
          isLoadingRef.current = false;
          setLoading(false);
          return;
        }
        // fall through to direct approach on error
      }

      // Unauthenticated fallback: sequential direct GitHub API calls
      const fetchGitHub = createFetchGitHub(user, token);

      const reposResponse = await fetchGitHub(`users/${username}/repos?per_page=100&sort=updated`);

      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          setError('GitHub API rate limit exceeded. Please try again later or login with GitHub.');
        } else if (reposResponse.status === 404) {
          setError('User not found. Please check the username.');
        } else {
          throw new Error(`GitHub API error: ${reposResponse.status}`);
        }
        isLoadingRef.current = false;
        setLoading(false);
        return;
      }

      const repos = await reposResponse.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        setError('No repositories found for this user.');
        isLoadingRef.current = false;
        setLoading(false);
        return;
      }

      const languageTotals = {};
      let totalBytes = 0;

      for (const repo of repos) {
        try {
          const languagesResponse = await fetchGitHub(`repos/${repo.full_name}/languages`);

          if (languagesResponse.status === 403) {
            setError('GitHub API rate limit reached. Showing partial results.');
            break;
          }

          if (languagesResponse.ok) {
            const languages = await languagesResponse.json();
            Object.entries(languages).forEach(([language, bytes]) => {
              languageTotals[language] = (languageTotals[language] || 0) + bytes;
              totalBytes += bytes;
            });
          }
        } catch (repoError) {
          console.warn(`Could not fetch languages for ${repo.full_name}:`, repoError);
        }
      }

      const languageArray = Object.entries(languageTotals)
        .map(([language, bytes]) => ({
          name: language,
          bytes,
          percentage: ((bytes / totalBytes) * 100).toFixed(1)
        }))
        .sort((a, b) => b.bytes - a.bytes);

      setLanguageData({
        languages: languageArray,
        totalBytes,
        reposChecked: repos.length
      });

    } catch (err) {
      if (err.message.includes('403')) {
        setError('GitHub API rate limit exceeded. Please login with GitHub or try again later.');
      } else if (err.message.includes('404')) {
        setError('User not found. Please check the username.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, [user, token]);

  return { loading, languageData, error, fetchLanguageStats };
};
