import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useCommitData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [commitStats, setCommitStats] = useState(null);
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

  const getStatusClass = () => {
    if (loading) return 'loading';
    if (status.includes('✅')) return 'status-success';
    if (status.includes('❌')) return 'status-error';
    if (status.includes('⚠️')) return 'status-warning';
    return '';
  };

  const checkCommits = useCallback(async (username) => {
    if (!username) {
      setStatus('Please enter a GitHub username.');
      return;
    }

    if (isLoadingRef.current) {
      return; // Prevent multiple simultaneous requests
    }

    isLoadingRef.current = true;
    setLoading(true);
    setStatus('');
    setCommitStats(null);

    try {
      // Get today in user's local timezone
      const now = new Date();
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowLocal = new Date(todayLocal);
      tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
      
      // Convert to ISO strings for GitHub API (which expects UTC)
      const todayStart = todayLocal.toISOString();
      const todayEnd = tomorrowLocal.toISOString();
      
      console.log('Date range for today:', {
        local: {
          start: todayLocal.toString(),
          end: tomorrowLocal.toString()
        },
        utc: {
          start: todayStart,
          end: todayEnd
        }
      });
      
      console.log('Fetching repos for user:', username, user?.hasToken ? '(authenticated)' : '(unauthenticated)');
      const reposResponse = await fetchGitHub(`users/${username}/repos?sort=updated&per_page=10`);
      
      console.log('Repos response status:', reposResponse.status);
      
      if (!reposResponse.ok) {
        if (reposResponse.status === 403) {
          setStatus('GitHub API rate limit exceeded (60 requests/hour). Please try again later or login with GitHub for higher limits.');
          isLoadingRef.current = false;
          setLoading(false);
          return;
        }
        if (reposResponse.status === 404) {
          setStatus('User not found. Please check the username.');
          isLoadingRef.current = false;
          setLoading(false);
          return;
        }
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }
      
      const repos = await reposResponse.json();
      
      if (!Array.isArray(repos) || repos.length === 0) {
        setStatus('No repositories found for this user.');
        isLoadingRef.current = false;
        setLoading(false);
        return;
      }

      let totalTodayCommits = 0;
      let reposWithCommitsToday = 0;
      let allCommitsToday = [];
      let mostRecentCommit = null;

      for (const repo of repos.slice(0, 3)) { // Reduced from 5 to 3 to avoid rate limits
        try {
          const commitsResponse = await fetchGitHub(
            `repos/${repo.full_name}/commits?author=${username}&since=${todayStart}&until=${todayEnd}`
          );
          
          if (commitsResponse.status === 403) {
            // Hit rate limit, stop checking more repos
            setStatus('GitHub API rate limit reached. Showing partial results. Please login for full access.');
            break;
          }
          
          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            
            if (commits.length > 0) {
              // Double-check each commit is actually today in user's timezone
              const todayCommits = commits.filter(commit => {
                const commitDate = new Date(commit.commit.author.date);
                const commitLocalDate = new Date(commitDate.getFullYear(), commitDate.getMonth(), commitDate.getDate());
                return commitLocalDate.getTime() === todayLocal.getTime();
              });
              
              if (todayCommits.length > 0) {
                totalTodayCommits += todayCommits.length;
                reposWithCommitsToday++;
                
                todayCommits.forEach(commit => {
                  allCommitsToday.push({
                    ...commit,
                    repoName: repo.name,
                    repoFullName: repo.full_name
                  });
                });
              }
            }
          }
        } catch (repoError) {
          console.warn(`Could not fetch commits for ${repo.full_name}:`, repoError);
        }
      }

      try {
        const recentCommitsResponse = await fetchGitHub(
          `repos/${repos[0].full_name}/commits?author=${username}&per_page=1`
        );
        
        if (recentCommitsResponse.ok) {
          const recentCommits = await recentCommitsResponse.json();
          if (recentCommits.length > 0) {
            const commit = recentCommits[0];
            const commitDate = new Date(commit.commit.author.date);
            const commitLocalDate = new Date(commitDate.getFullYear(), commitDate.getMonth(), commitDate.getDate());
            const isToday = commitLocalDate.getTime() === todayLocal.getTime();
            
            mostRecentCommit = {
              time: commitDate.toLocaleDateString() + ' at ' + commitDate.toLocaleTimeString(),
              repo: repos[0].name,
              message: commit.commit.message.split('\n')[0],
              sha: commit.sha.substring(0, 7),
              isToday: isToday
            };
          }
        }
      } catch (recentError) {
        console.warn('Could not fetch recent commits:', recentError);
      }

      let eventsData = { totalEvents: 0, pushEvents: 0 };
      try {
        const eventsResponse = await fetchGitHub(
          `users/${username}/events/public`
        );
        
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          if (Array.isArray(events)) {
            eventsData.totalEvents = events.length;
            eventsData.pushEvents = events.filter(e => e.type === 'PushEvent').length;
          }
        }
      } catch (eventsError) {
        console.warn('Events API error:', eventsError);
      }

      setCommitStats({
        todayCount: totalTodayCommits,
        todayRepos: reposWithCommitsToday,
        totalRecentEvents: eventsData.pushEvents,
        totalRepos: Math.min(repos.length, 3), 
        lastCommit: mostRecentCommit,
        apiInfo: {
          totalEvents: eventsData.totalEvents,
          pushEvents: eventsData.pushEvents,
          reposChecked: Math.min(repos.length, 3) 
        }
      });

      if (totalTodayCommits > 0) {
        const repoText = reposWithCommitsToday === 1 ? 'repository' : 'repositories';
        setStatus(`✅ You coded today! ${totalTodayCommits} commit${totalTodayCommits > 1 ? 's' : ''} across ${reposWithCommitsToday} ${repoText}`);
      } else if (mostRecentCommit) {
        const timeSinceLastCommit = mostRecentCommit.isToday ? 'today' : 'recently';
        setStatus(`⚠️ No commits today, but you committed ${timeSinceLastCommit}. Keep coding!`);
      } else {
        setStatus('❌ No recent commit activity found. Time to start coding!');
      }
      
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.message.includes('403')) {
        setStatus('❌ GitHub API rate limit exceeded. Please login with GitHub or try again later.');
      } else if (error.message.includes('404')) {
        setStatus('❌ User not found. Please check the username.');
      } else if (error.message.includes('Failed to fetch')) {
        setStatus('❌ Network error. Please check your internet connection.');
      } else {
        setStatus(`❌ Error: ${error.message}`);
      }
    }

    isLoadingRef.current = false;
    setLoading(false);
  }, []);

  return {
    loading,
    status,
    commitStats,
    checkCommits,
    getStatusClass
  };
};
