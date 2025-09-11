import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useLanguageStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [languageData, setLanguageData] = useState(null);
  const [error, setError] = useState('');
  const isLoadingRef = useRef(false);

  const fetchGitHub = async (path) => {
    if (user && user.hasToken) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/github/${path}`, {
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

  

  const fetchLanguageStats = useCallback(async (username) => {
    if (!username) {
      setError('Please enter a GitHub username.');
      return;
    }

    if (isLoadingRef.current) {
      return; 
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError('');
    setLanguageData(null);

    try {
      console.log('Fetching repos for user:', username);
      
      const reposResponse = await fetchGitHub(`users/${username}/repos?per_page=100&sort=updated`);
      
      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          setError('GitHub API rate limit exceeded. Please try again later or login with GitHub.');
          isLoadingRef.current = false;
          setLoading(false);
          return;
        }
        if (reposResponse.status === 404) {
          setError('User not found. Please check the username.');
          isLoadingRef.current = false;
          setLoading(false);
          return;
        }
        throw new Error(`GitHub API error: ${reposResponse.status}`);
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
          bytes: bytes,
          percentage: ((bytes / totalBytes) * 100).toFixed(1)
        }))
        .sort((a, b) => b.bytes - a.bytes); 

      setLanguageData({
        languages: languageArray,
        totalBytes: totalBytes,
        reposChecked: repos.length
      });
      
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.message.includes('403')) {
        setError('GitHub API rate limit exceeded. Please login with GitHub or try again later.');
      } else if (error.message.includes('404')) {
        setError('User not found. Please check the username.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, []);

  return {
    loading,
    languageData,
    error,
    fetchLanguageStats
  };
};
